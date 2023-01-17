import { addTrackedEntity } from "../entityTracker";

export const entityPostInitCallback = (entity: Entity): void => {
  addTrackedEntity(entity);
};
