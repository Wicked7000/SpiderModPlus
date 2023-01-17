import { createDamageNumberFromDamage } from "../damageNumbers";

export const entityTakeDamageCallback = (
  entity: Entity,
  amount: number,
): boolean | undefined => {
  createDamageNumberFromDamage(entity, amount);

  return undefined;
};
