import { EntityType } from "isaac-typescript-definitions";
import { removeHealthbar } from "./healthbar";
import { debugLog } from "./logging";
import { state } from "./modState";
import { isAllowedEntity } from "./utils";

const entityTrackerPrefix = "EntityTracker";

export const addTrackedEntity = (entity: Entity): void => {
  if (state.hasSpidermodItem || !isAllowedEntity(entity)) {
    return;
  }

  const entityHash = GetPtrHash(entity);
  if (!(entityHash in state.healthBars)) {
    state.healthBars[entityHash] = {
      entityEffects: {
        background: undefined,
        foreground: undefined,
      },
      tracking: entity,
    };
    debugLog(
      `Tracked entity added ${EntityType[entity.Type]} variant: ${
        entity.Variant
      } subtype: ${entity.SubType}, ${entityHash}`,
      entityTrackerPrefix,
    );
  }
};

export const removeTrackedEntity = (entity: Entity): void => {
  const entityHash = GetPtrHash(entity);
  if (entityHash in state.healthBars) {
    removeHealthbar(entity);
    debugLog(
      `Tracked entity removed ${EntityType[entity.Type]}, ${entityHash}`,
      entityTrackerPrefix,
    );
  }
};
