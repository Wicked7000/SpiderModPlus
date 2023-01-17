import { removeTrackedEntity } from "../entityTracker";

export const postEntityRemoveCallback = (entity: Entity): void => {
  removeTrackedEntity(entity);
};
