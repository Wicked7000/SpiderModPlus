import type { EffectVariant } from "isaac-typescript-definitions";

export const CustomEffectVariants = {
  EmptyEntity: Isaac.GetEntityVariantByName("emptyEntity") as EffectVariant,
  SpiderModHealthForeground: Isaac.GetEntityVariantByName(
    "SpidermodHealthForeground",
  ) as EffectVariant,
  SpiderModHealthBackground: Isaac.GetEntityVariantByName(
    "SpidermodHealthBackground",
  ) as EffectVariant,
} as const;
