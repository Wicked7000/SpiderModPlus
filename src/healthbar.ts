import { copyColor, spawnEffectWithSeed, VectorZero } from "isaacscript-common";
import { CustomEffectVariants } from "./customEntities";
import { gameIsAvailable, state, TrackingDescriptor } from "./modState";
import {
  canEntityBeDamaged,
  hsvToRGB,
  isAllowedEntity,
  isDynamicEntity,
  setSpriteTintColor,
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

function spawnHealthbar(entity: Entity) {
  const additionalOffset = isDynamicEntity(entity) ? 100 : 0;

  const pos = getPositionBasedOnEntity(entity);
  const posForeground = getPositionBasedOnEntityForeground(entity);
  const background = spawnEffectWithSeed(
    CustomEffectVariants.SpiderModHealth,
    0,
    pos,
    1 as Seed,
  );
  background.DepthOffset = additionalOffset + 1;
  background.SpriteOffset = VectorZero;
  loadHealthbarSprite(background.GetSprite(), "background");

  const foreground = spawnEffectWithSeed(
    CustomEffectVariants.SpiderModHealth,
    0,
    posForeground,
    1 as Seed,
  );
  loadHealthbarSprite(foreground.GetSprite(), "foreground");
  foreground.DepthOffset = additionalOffset + 2;
  foreground.SpriteOffset = VectorZero;
  return { background, foreground };
}

function loadHealthbarSprite(
  sprite: Sprite,
  type: "background" | "foreground",
) {
  const spriteFile =
    type === "background" ? "background.anm2" : "foreground.anm2";
  sprite.Load(spriteFile, true);
  sprite.Offset = VectorZero;
  sprite.SetAnimation("Default");
  sprite.SetFrame(0);

  // Set foreground to be red.
  if (type === "foreground") {
    const color = copyColor(sprite.Color);
    color.SetTint(0, 1, 0, 1);
    sprite.Color = color;
  }

  return sprite;
}

const spawnHealthbarIfNotFound = (descriptor: TrackingDescriptor) => {
  if (
    descriptor.entityEffects.background === undefined ||
    descriptor.entityEffects.foreground === undefined
  ) {
    const effects = spawnHealthbar(descriptor.tracking);
    descriptor.entityEffects.foreground = effects.foreground;
    descriptor.entityEffects.background = effects.background;
  }
};

export const removeHealthbar = (entity: Entity): void => {
  const hash = GetPtrHash(entity);
  const descriptor = state.healthBars[hash];
  if (descriptor !== undefined) {
    descriptor.entityEffects.background?.Remove();
    descriptor.entityEffects.foreground?.Remove();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete state.healthBars[hash];
  }
};

// Hides healthbar if certain conditions are met.
const hideHealthbars = (trackingDescriptor: TrackingDescriptor) => {
  const shouldHide =
    !trackingDescriptor.tracking.IsVisible() ||
    !canEntityBeDamaged(trackingDescriptor.tracking);
  if (shouldHide) {
    const { background, foreground } = trackingDescriptor.entityEffects;
    if (background !== undefined) {
      background.SpriteScale = Vector(0, 0);
    }
    if (foreground !== undefined) {
      foreground.SpriteScale = Vector(0, 0);
    }
    return true;
  }
  return false;
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

const checkIfHealthbarIsInvalid = (trackingDescriptor: TrackingDescriptor) => {
  const notAllowed = !isAllowedEntity(trackingDescriptor.tracking);
  const notExists = !trackingDescriptor.tracking.Exists();
  if (notAllowed || notExists) {
    if (trackingDescriptor.tracking.Child !== undefined) {
      trackingDescriptor.tracking = trackingDescriptor.tracking.Child;
      return false;
    }
    removeHealthbar(trackingDescriptor.tracking);

    return true;
  }
  return false;
};

const getHealthPercentage = (entity: Entity) => {
  const getPercentage = (max: number, current: number) => {
    const percentageHealth = current / max;
    const nonNegativePercentageHealth =
      percentageHealth > 0 ? percentageHealth : 0;
    return nonNegativePercentageHealth;
  };

  if (entity.Child === undefined) {
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

  for (const trackingDescriptor of Object.values(state.healthBars)) {
    if (checkIfHealthbarIsInvalid(trackingDescriptor)) {
      continue;
    }
    if (hideHealthbars(trackingDescriptor)) {
      continue;
    } else {
      ensureVisible(trackingDescriptor);
    }

    spawnHealthbarIfNotFound(trackingDescriptor);
    const pos = getPositionBasedOnEntity(trackingDescriptor.tracking);
    const posForeground = getPositionBasedOnEntityForeground(
      trackingDescriptor.tracking,
    );

    if (
      trackingDescriptor.entityEffects.foreground !== undefined &&
      trackingDescriptor.entityEffects.background !== undefined
    ) {
      trackingDescriptor.entityEffects.background.Position = pos;
      trackingDescriptor.entityEffects.foreground.Position = posForeground;

      const healthPercentage = getHealthPercentage(trackingDescriptor.tracking);

      const sprite = trackingDescriptor.entityEffects.foreground.GetSprite();

      const hue = 130.0 - 130.0 * (1.0 - healthPercentage);
      const range = hsvToRGB(hue, 1, 1);

      setSpriteTintColor({ ...range, a: 1 }, sprite);
      trackingDescriptor.entityEffects.foreground.SpriteScale = Vector(
        healthPercentage,
        1,
      );
    }
  }
};
