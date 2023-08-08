import {
  CollectibleType,
  EntityFlag,
  EntityType,
} from "isaac-typescript-definitions";
import { copyColor, getEntityID, getRandomInt } from "isaacscript-common";
import { debugLog } from "./logging";
import { state } from "./modState";
import { configObject } from "./config";

const UTILS_PREFIX = "Utils";

export const MOD_NAME = "SpiderMod+";

export function setSpriteTintColor(
  color: { r?: number; g?: number; b?: number; a?: number },
  sprite: Sprite,
): Sprite {
  const spriteColor = copyColor(sprite.Color);
  spriteColor.SetTint(color.r ?? 0, color.g ?? 0, color.b ?? 0, color.a ?? 1);
  sprite.Color = spriteColor;
  return sprite;
}

export function setSpriteColor(
  color: { r?: number; g?: number; b?: number; a?: number },
  sprite: Sprite,
): Sprite {
  const spriteColor = copyColor(sprite.Color);
  spriteColor.SetColorize(
    color.r ?? spriteColor.R,
    color.g ?? spriteColor.G,
    color.b ?? spriteColor.B,
    color.a ?? 1,
  );
  sprite.Color = spriteColor;
  return sprite;
}

export function hsvToRGB(
  h: number,
  s: number,
  v: number,
): { r: number; b: number; g: number } {
  const chroma = v * s;
  const hueFace = h / 60;
  const x = chroma * (1 - Math.abs((hueFace % 2) - 1));
  let intermediate = {
    r: 0,
    g: 0,
    b: 0,
  };

  if (hueFace >= 0 && hueFace < 1) {
    intermediate = { r: chroma, g: x, b: 0 };
  } else if (hueFace >= 1 && hueFace < 2) {
    intermediate = { r: x, g: chroma, b: 0 };
  } else if (hueFace >= 2 && hueFace < 3) {
    intermediate = { r: 0, g: chroma, b: x };
  } else if (hueFace >= 3 && hueFace < 4) {
    intermediate = { r: 0, g: x, b: chroma };
  } else if (hueFace >= 4 && hueFace < 5) {
    intermediate = { r: x, g: 0, b: chroma };
  } else if (hueFace >= 5 && hueFace < 6) {
    intermediate = { r: chroma, g: 0, b: x };
  }

  const m = v - chroma;
  return {
    r: intermediate.r + m,
    g: intermediate.g + m,
    b: intermediate.b + m,
  };
}

export const arrayToString = (
  array: Array<string | { toString: () => string }>,
): string => {
  const stringList: string[] = [];
  for (const item of array) {
    stringList.push(item.toString());
  }
  return stringList.join(",");
};

// Entities that are allowed healthbars even if they are a child of an entity.
export const isAllowedParentedEntity = (entity: Entity): boolean => {
  const isAllowed = [
    EntityType.RING_OF_FLIES,
    EntityType.SWARM,
    EntityType.ARMY_FLY,
    EntityType.HUSH_FLY,
    EntityType.WILLO,
    EntityType.RAGLING,
    // Because he can re-spawn his head.
    EntityType.RAG_MAN,
    EntityType.FLY,
    EntityType.ATTACK_FLY,
    EntityType.SISTERS_VIS,
  ].includes(entity.Type);

  const isAllowedGemini =
    entity.Type === EntityType.GEMINI && entity.Variant >= 10;
  return isAllowed || isAllowedGemini;
};

export const getRandomVectorSize = (size: number): Vector => {
  const randomX = getRandomInt(0, size);
  const randomY = getRandomInt(0, size);
  return Vector(randomX, randomY);
};

export const clearAllOnSpidermod = (): void => {
  for (const [ptrHash, _] of pairs(state.healthBars)) {
    const healthbars = state.healthBars[ptrHash];
    if (healthbars !== undefined) {
      healthbars.entityEffects.background?.Remove();
      healthbars.entityEffects.foreground?.Remove();
    }

    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state.healthBars[ptrHash];
  }
};

export const resetEntityAllowedCache = (): void => {
  allowedEntityCache = {};
};

let allowedEntityCache: Record<string, boolean> = {};

export const canEntityBeDamaged = (entity: Entity): boolean =>
  !entity.IsInvincible() &&
  entity.IsEnemy() &&
  entity.IsVulnerableEnemy() &&
  !entity.IsDead();

export const canDisplayHealthDamageBase = (entityPtr: EntityPtr): boolean => {
  const entity = entityPtr.Ref;
  if (entity === undefined) {
    return true;
  }

  const isVisible = entity.IsVisible();
  const canTakeDamage = canEntityBeDamaged(entity);
  const notAllowed = !isAllowedEntity(entity);
  const isNonParentEntity =
    entity.Parent !== undefined && !isAllowedParentedEntity(entity);
  if (notAllowed || isNonParentEntity || !isVisible || !canTakeDamage) {
    return false;
  }
  return true;
};

export const canHaveDamageNumbers = (entityPtr: EntityPtr): boolean => {
  const entity = entityPtr.Ref;
  if (entity === undefined) {
    return true;
  }

  if (!configObject.persistent.bossDamageNums && entity.IsBoss()) {
    return false;
  }

  return canDisplayHealthDamageBase(entityPtr);
};

export const canHaveHealthbar = (entityPtr: EntityPtr): boolean => {
  const entity = entityPtr.Ref;
  if (entity === undefined) {
    return true;
  }

  if (!configObject.persistent.bossHealthBars && entity.IsBoss()) {
    return false;
  }
  return canDisplayHealthDamageBase(entityPtr);
};

/* We don't want to display damage for certain entities.
   Is not cached for dynamic (segmented) enemies.
*/
export const isAllowedEntity = (entity: Entity): boolean => {
  const entityId = `${getEntityID(entity)}`;
  if (entityId in allowedEntityCache) {
    const value = allowedEntityCache[entityId];
    return value ?? false;
  }

  const isEffect = entity.ToEffect() !== undefined;
  const isPlayer = entity.ToPlayer() !== undefined;
  const hideHp =
    entity.HasEntityFlags(EntityFlag.HIDE_HP_BAR) &&
    ![EntityType.ULTRA_GREED].includes(entity.Type);
  const isGeminiConnection =
    entity.Variant === 20 && entity.Type === EntityType.GEMINI;

  const blockedTypes = [
    EntityType.FIREPLACE,
    EntityType.MOVABLE_TNT,
    EntityType.GENERIC_PROP,
  ].includes(entity.Type);
  const blockList = [
    hideHp,
    isEffect,
    isPlayer,
    blockedTypes,
    isGeminiConnection,
  ];

  // Returns true if there is a blocked entity.
  const anyBlockedEntities = blockList.reduce(
    (previous, current) => previous || current,
  );

  // Edge case when ragman spawns them sometimes.
  if (entity.HitPoints < 0 && entity.Type === EntityType.RAGLING) {
    return true;
  }

  if (anyBlockedEntities) {
    debugLog(
      `isAllowedEntity ${anyBlockedEntities ? "blocked" : "allowed"} entity ${
        EntityType[entity.Type]
      } variant: ${entity.Variant}, subType: ${entity.SubType}, parent: ${
        entity.Parent
      }, health: ${entity.HitPoints}/${entity.MaxHitPoints}, child: ${
        entity.Child
      } (${arrayToString(blockList)})`,
      UTILS_PREFIX,
    );
  }

  const isAllowed = !anyBlockedEntities;
  allowedEntityCache[entityId] = isAllowed;
  return isAllowed;
};

export const trackSpidermodItem = (): void => {
  if (hasSpidermodItem()) {
    state.hasSpidermodItem = true;
    clearAllOnSpidermod();
  }
};

export const trackFrameTime = (): void => {
  const currentTime = Isaac.GetTime();
  state.deltaTimeSeconds = (currentTime - state.lastFrameTime) / 1000 / 1;
  state.lastFrameTime = currentTime;
};

export const getEsau = (): EntityPlayer | undefined =>
  Isaac.GetPlayer(1) as EntityPlayer | undefined;

export const hasSpidermodItem = (): boolean => {
  const isaac = Isaac.GetPlayer(0);
  const esau = getEsau();

  return (
    isaac.HasCollectible(CollectibleType.SPIDER_MOD) ||
    (esau !== undefined && esau.HasCollectible(CollectibleType.SPIDER_MOD))
  );
};
