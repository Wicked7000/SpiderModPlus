import { initTextItems } from "../damageNumbers";
import { resetState } from "../modState";
import { MOD_NAME } from "../utils";

export const postGameStartedCallback = (): void => {
  resetState();
  initTextItems();

  Isaac.DebugString(`${MOD_NAME} - new run started!`);
};
