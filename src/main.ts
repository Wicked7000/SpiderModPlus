import { ModCallback } from "isaac-typescript-definitions";
import { entityPostInitCallback } from "./callbacks/entityPostInit";
import { entityTakeDamageCallback } from "./callbacks/entityTakeDmg";
import { enterNewRoomCallback } from "./callbacks/newRoom";
import { postEntityRemoveCallback } from "./callbacks/postEntityRemove";
import { postGameStartedCallback } from "./callbacks/postGameStarted";
import { postRenderCallback } from "./callbacks/postRender";
import { postUpdateCallback } from "./callbacks/postUpdate";
import { debugLog } from "./logging";
import { MOD_NAME } from "./utils";

main();

function main() {
  const mod = RegisterMod(MOD_NAME, 1);

  mod.AddCallback(ModCallback.POST_GAME_STARTED, postGameStartedCallback);
  mod.AddCallback(ModCallback.POST_NPC_INIT, entityPostInitCallback);
  mod.AddCallback(ModCallback.POST_ENTITY_REMOVE, postEntityRemoveCallback);
  mod.AddCallback(ModCallback.POST_RENDER, postRenderCallback);
  mod.AddCallback(ModCallback.POST_UPDATE, postUpdateCallback);
  mod.AddCallback(ModCallback.ENTITY_TAKE_DMG, entityTakeDamageCallback);
  mod.AddCallback(ModCallback.POST_NEW_ROOM, enterNewRoomCallback);

  debugLog("initialized");
}
