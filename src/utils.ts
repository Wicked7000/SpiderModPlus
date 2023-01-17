import {
  CollectibleType,
  EntityFlag,
  EntityType,
} from "isaac-typescript-definitions";
import { copyColor, getEntityID, getRandomInt } from "isaacscript-common";
import { debugLog } from "./logging";
import { state } from "./modState";

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

export const getRandomVectorSize = (size: number): Vector => {
  const randomX = getRandomInt(0, size);
  const randomY = getRandomInt(0, size);
  return Vector(randomX, randomY);
};

export const clearAllOnSpidermod = (): void => {
  for (const descriptor of Object.values(state.healthBars)) {
    descriptor.entityEffects.background?.Remove();
    descriptor.entityEffects.foreground?.Remove();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state.healthBars[GetPtrHash(descriptor.tracking)];
  }
};

const allowedEntityCache: Record<string, boolean> = {};

// Entities that are segmented are considered 'dynamic'.
export const isDynamicEntity = (entity: Entity): boolean =>
  [EntityType.CHUB, EntityType.LARRY_JR, EntityType.PIN].includes(entity.Type);

/* We don't want to display damage for certain entities.
   Is not cached for dynamic (segmented) enemies.
*/
export const isAllowedEntity = (entity: Entity, source?: "damage"): boolean => {
  const entityId = `${getEntityID(entity)}:${entity.Parent !== undefined}`;
  if (entityId in allowedEntityCache) {
    const value = allowedEntityCache[entityId];
    if (source !== "damage") {
      debugLog(
        `isAllowedEntity ${value ?? false ? "blocked" : "allowed"} entity ${
          EntityType[entity.Type]
        } variant: ${entity.Variant}, subType: ${entity.SubType} CACHED)`,
        UTILS_PREFIX,
      );
    }
    return value ?? false;
  }

  const isEnemy = entity.IsEnemy();
  const canBeDamaged = entity.IsVulnerableEnemy();
  const isPlayer = entity.ToPlayer() !== undefined;
  const hideHp = entity.HasEntityFlags(EntityFlag.HIDE_HP_BAR);
  const isGeminiConnection =
    entity.Variant === 20 && entity.Type === EntityType.GEMINI;
  const childOfBoss = entity.Parent !== undefined && isDynamicEntity(entity);

  const blockedTypes = [
    EntityType.POKY,
    EntityType.WALL_HUGGER,
    EntityType.GRUDGE,
    EntityType.SLOT,
    EntityType.BALL_AND_CHAIN,
    EntityType.SPIKEBALL,
    EntityType.SHOPKEEPER,
    EntityType.FIREPLACE,
    EntityType.CONSTANT_STONE_SHOOTER,
    EntityType.BRIMSTONE_HEAD,
    EntityType.GAPING_MAW,
    EntityType.BROKEN_GAPING_MAW,
    EntityType.GRIMACE,
    EntityType.STONEY,
    EntityType.QUAKE_GRIMACE,
    EntityType.BOMB_GRIMACE,
    EntityType.MOCKULUS,
    EntityType.MOVABLE_TNT,
    EntityType.BOMB_GRIMACE,
    EntityType.SLOT,
    EntityType.GENERIC_PROP,
  ].includes(entity.Type);
  const blockList = [
    !isEnemy,
    !canBeDamaged,
    hideHp,
    isPlayer,
    blockedTypes,
    isGeminiConnection,
    childOfBoss,
  ];

  // Returns true if there is a blocked entity.
  const anyBlockedEntities = blockList.reduce(
    (previous, current) => previous || current,
  );

  debugLog(
    `isAllowedEntity ${anyBlockedEntities ? "blocked" : "allowed"} entity ${
      EntityType[entity.Type]
    } variant: ${entity.Variant}, subType: ${entity.SubType}, parent: ${
      entity.Parent
    }, child: ${entity.Child} (${arrayToString(blockList)})`,
    UTILS_PREFIX,
  );

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
