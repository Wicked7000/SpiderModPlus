import { configObject } from "../config";
import { createDamageNumberFromDamage } from "../damageNumbers";

export const entityTakeDamageCallback = (
  entity: Entity,
  amount: number,
): boolean | undefined => {
  if (configObject.persistent.damageBars) {
    createDamageNumberFromDamage(entity, amount);
  }

  return undefined;
};
