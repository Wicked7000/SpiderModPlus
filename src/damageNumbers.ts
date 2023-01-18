import { getRandomInt } from "isaacscript-common";
import { debugLog } from "./logging";
import { gameIsAvailable, state } from "./modState";
import { getRandomVectorSize, isAllowedEntity } from "./utils";

const MAX_TEXT_ITEMS = 15;
const LIFETIME_SECONDS = 1.5;
const CHANGE_STEPS = 4;
const OPACITY_CHANGE_AMOUNT = 1 / (LIFETIME_SECONDS * 60);
const CHANGE_TICKS = (LIFETIME_SECONDS * 60) / CHANGE_STEPS;

export const clearAllDamageNumbers = (): void => {
  for (let i = 0; i < state.textItems.length; i++) {
    state.textItems[i] = undefined;
  }
  state.lastTextItemIndex = 0;
};

// Create undefined text items on startup and load font.
export const initTextItems = (): void => {
  let amount = 0;
  while (amount < MAX_TEXT_ITEMS) {
    state.textItems.push(undefined);
    amount++;
  }

  state.font.Load("font/pftempestasevencondensed.fnt");
};

export const createDamageNumberFromDamage = (
  entity: Entity,
  amount: number,
): void => {
  if (amount < 0 || !isAllowedEntity(entity, "damage")) {
    return;
  }

  const damageText = `${Math.round(amount * 100) / 100}`;
  const speed = getRandomInt(45, 80);
  const direction = getRandomInt(1, 2) === 1 ? 1 : -1;

  const initialOffset = getRandomVectorSize(entity.Size / 2);

  state.textItems[state.lastTextItemIndex] = {
    xSpeed: speed,
    xDirection: direction,
    position: entity.Position.add(initialOffset),
    text: damageText,
    opacity: 1,
    velocity: Vector(0, -60),
    ticks: 0,
  };
  state.lastTextItemIndex = (state.lastTextItemIndex + 1) % MAX_TEXT_ITEMS;

  debugLog(`Added new damage number ${damageText}`, "DamageNumbers");
};

// 60 Times per second.
export const renderFloatingText = (): void => {
  if (
    (gameIsAvailable(state.game) && state.game.IsPaused()) ||
    state.hasSpidermodItem
  ) {
    return;
  }

  for (const textDescriptor of state.textItems) {
    if (textDescriptor !== undefined && textDescriptor.opacity > 0) {
      const screenPos = Isaac.WorldToScreen(textDescriptor.position);
      if (state.game.GetRoom().IsMirrorWorld()) {
        screenPos.X = Isaac.GetScreenWidth() - screenPos.X;
      }

      state.font.DrawString(
        textDescriptor.text,
        screenPos.X,
        screenPos.Y,
        KColor(1, 0.2, 0.2, textDescriptor.opacity),
      );
      textDescriptor.opacity -= OPACITY_CHANGE_AMOUNT;
      if (textDescriptor.ticks % CHANGE_TICKS === 0) {
        const newDirection = textDescriptor.xDirection * -1;
        const newVelocity = Vector(
          newDirection * textDescriptor.xSpeed,
          textDescriptor.velocity.Y,
        );
        textDescriptor.xDirection = newDirection;
        textDescriptor.velocity = newVelocity;
      }
      textDescriptor.position = textDescriptor.position.add(
        textDescriptor.velocity.mul(state.deltaTimeSeconds),
      );
      textDescriptor.ticks++;
    }
  }
};
