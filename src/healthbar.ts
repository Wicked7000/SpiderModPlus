import {
  copyColor,
  round,
  spawnEffectWithSeed,
  VectorZero,
} from "isaacscript-common";
import { CustomEffectVariants } from "./customEntities";
import type { TrackingDescriptor } from "./modState";
import { gameIsAvailable, state } from "./modState";
import {
  hsvToRGB,
  isAllowedParentedEntity,
  setSpriteTintColor,
  canHaveHealthbar,
} from "./utils";

function getPositionBasedOnEntity(entity: Entity, yOffset?: number) {
  const pos = Vector(
    entity.Position.X - 26,
    entity.Position.Y + 6 + (yOffset ?? 0),
  );
  return pos;
}

function getPositionBasedOnEntityForeground(entity: Entity, yOffset?: number) {
  const pos = Vector(
    entity.Position.X - 20,
    entity.Position.Y + 18 + (yOffset ?? 0),
  );
  return pos;
}

function spawnHealthbar(entityPtr: EntityPtr) {
  const entity = entityPtr.Ref;
  if (entity === undefined) {
    return;
  }

  const additionalDepth = entity.Child !== undefined ? 100 : 0;

  const pos = getPositionBasedOnEntity(entity);
  const posForeground = getPositionBasedOnEntityForeground(entity);
  const background = spawnEffectWithSeed(
    CustomEffectVariants.SpiderModHealthBackground,
    0,
    pos,
    1 as Seed,
  );
  background.DepthOffset = additionalDepth + 1;
  background.SpriteOffset = VectorZero;

  const foreground = spawnEffectWithSeed(
    CustomEffectVariants.SpiderModHealthForeground,
    0,
    posForeground,
    1 as Seed,
  );
  foreground.DepthOffset = additionalDepth + 2;
  foreground.SpriteOffset = VectorZero;
  const sprite = foreground.GetSprite();
  const color = copyColor(sprite.Color);
  color.SetTint(0, 1, 0, 1);
  sprite.Color = color;

  return { background, foreground };
}

const spawnHealthbarIfNotFound = (descriptor: TrackingDescriptor) => {
  if (
    descriptor.entityEffects.background === undefined ||
    descriptor.entityEffects.foreground === undefined
  ) {
    const effects = spawnHealthbar(descriptor.tracking);
    if (effects !== undefined) {
      descriptor.entityEffects.foreground = effects.foreground;
      descriptor.entityEffects.background = effects.background;
      return true;
    }
  }
  return false;
};

export const removeHealthbar = (ptrHash: PtrHash): void => {
  const descriptor = state.healthBars[ptrHash];
  if (descriptor !== undefined) {
    descriptor.entityEffects.background?.Remove();
    descriptor.entityEffects.foreground?.Remove();
  }
};

const hideHealthbars = (trackingDescriptor: TrackingDescriptor) => {
  const { background, foreground } = trackingDescriptor.entityEffects;
  if (background !== undefined) {
    background.SpriteScale = Vector(0, 0);
  }
  if (foreground !== undefined) {
    foreground.SpriteScale = Vector(0, 0);
  }
};

const ensureVisible = (trackingDescriptor: TrackingDescriptor) => {
  const { background, foreground } = trackingDescriptor.entityEffects;
  if (background !== undefined) {
    background.SpriteScale = Vector(1, 1);
  }
  if (foreground !== undefined) {
    foreground.SpriteScale = Vector(1, 1);
  }
};

// Returns health in range of 0-100.
const getPercentage = (max: number, current: number) => {
    if (current > max) {
        return 100;
    }
    const percentageHealth = round((current / max) * 100);
    const nonNegativePercentageHealth =
        percentageHealth > 0 ? percentageHealth : 0;
    return nonNegativePercentageHealth;
};

const getHealthPercentage = (entity: Entity) => {
  if (entity.Child === undefined || isAllowedParentedEntity(entity)) {
    return getPercentage(entity.MaxHitPoints, entity.HitPoints);
  }

  let currentMaxHP = 0;
  let currentHP = 0;
  let current: Entity | undefined = entity;
  while (current !== undefined) {
    currentHP += current.HitPoints;
    currentMaxHP += current.MaxHitPoints;
    current = current.Child;
  }
  return getPercentage(currentMaxHP, currentHP);
};

// This will be called on update as it uses EntityEffect.
export const renderHealthbars = (): void => {
  if (!gameIsAvailable(state.game)) {
    return;
  }

  for (const [ptrHash, trackingDescriptor] of pairs(state.healthBars)) {
    const entity = trackingDescriptor.tracking.Ref;
    if (entity === undefined) {
      // Remove entity (If we don't check this I think it may cause crashes).
      removeHealthbar(ptrHash);
      continue;
    }

    // Hide non-parent entities.
    if (!canHaveHealthbar(trackingDescriptor.tracking)) {
      hideHealthbars(trackingDescriptor);
      continue;
    }
    ensureVisible(trackingDescriptor);

    spawnHealthbarIfNotFound(trackingDescriptor);
    const pos = getPositionBasedOnEntity(entity);
    const posForeground = getPositionBasedOnEntityForeground(entity);

    if (
      trackingDescriptor.entityEffects.foreground !== undefined &&
      trackingDescriptor.entityEffects.background !== undefined
    ) {
      trackingDescriptor.entityEffects.background.Position = pos;
      trackingDescriptor.entityEffects.foreground.Position = posForeground;

      const healthAmount = getHealthPercentage(entity);
      if (trackingDescriptor.previousHealthAmount !== healthAmount) {
        const sprite = trackingDescriptor.entityEffects.foreground.GetSprite();
        const healthPercentage = healthAmount / 100;

        const hue = 130.0 - 130.0 * (1.0 - healthPercentage);
        const range = hsvToRGB(hue, 1, 1);

        setSpriteTintColor({ ...range, a: 1 }, sprite);
        trackingDescriptor.entityEffects.foreground.SpriteScale = Vector(
          healthPercentage,
          1,
        );
        trackingDescriptor.previousHealthAmount = healthPercentage;
      }
    }
  }
};
