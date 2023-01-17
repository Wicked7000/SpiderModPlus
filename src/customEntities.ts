import { EffectVariant } from "isaac-typescript-definitions";

export const CustomEffectVariants = {
  SpiderModHealth: Isaac.GetEntityVariantByName(
    "SpidermodHealth",
  ) as unknown as EffectVariant,
} as const;
