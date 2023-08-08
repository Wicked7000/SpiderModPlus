import { upgradeMod, ModCallbackCustom, ISCFeature } from "isaacscript-common";
import { entityPostInitCallback } from "./callbacks/entityPostInit";
import { entityTakeDamageCallback } from "./callbacks/entityTakeDmg";
import { enterNewRoomCallback } from "./callbacks/newRoom";
import { postEntityRemoveCallback } from "./callbacks/postEntityRemove";
import { postGameStartedCallback } from "./callbacks/postGameStarted";
import { postRenderCallback } from "./callbacks/postRender";
import { postUpdateCallback } from "./callbacks/postUpdate";
import { ModCallback } from "isaac-typescript-definitions";
import { MOD_NAME } from "./utils";

const modVanilla = RegisterMod(MOD_NAME, 1);
const mod = upgradeMod(modVanilla, [ISCFeature.SAVE_DATA_MANAGER] as const);
export { mod };

export function setupMod(): void {
  mod.AddCallbackCustom(
    ModCallbackCustom.POST_GAME_STARTED_REORDERED,
    postGameStartedCallback,
    undefined,
  );
  mod.AddCallback(ModCallback.POST_NPC_INIT, entityPostInitCallback);
  mod.AddCallback(ModCallback.POST_ENTITY_REMOVE, postEntityRemoveCallback);
  mod.AddCallback(ModCallback.POST_RENDER, postRenderCallback);
  mod.AddCallback(ModCallback.POST_UPDATE, postUpdateCallback);
  mod.AddCallback(ModCallback.ENTITY_TAKE_DMG, entityTakeDamageCallback);
  mod.AddCallbackCustom(
    ModCallbackCustom.POST_NEW_ROOM_REORDERED,
    enterNewRoomCallback,
  );
}
