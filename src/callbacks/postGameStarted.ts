import { initTextItems } from "../damageNumbers";
import { resetState, state } from "../modState";
import { MOD_NAME, resetEntityAllowedCache } from "../utils";

export const postGameStartedCallback = (): void => {
  resetState();
  resetEntityAllowedCache();
  initTextItems();

  Isaac.DebugString(`${MOD_NAME} - new run started!`);
  if (!state.font.IsLoaded()) {
    state.font.Load("font/pftempestasevencondensed.fnt");
  }
};
