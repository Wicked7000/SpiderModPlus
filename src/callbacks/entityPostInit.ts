import { configObject } from "../config";
import { addTrackedEntity } from "../entityTracker";

export const entityPostInitCallback = (entity: Entity): void => {
  if (configObject.persistent.healthBars) {
    addTrackedEntity(entity);
  }
};
