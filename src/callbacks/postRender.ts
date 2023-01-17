import { renderFloatingText } from "../damageNumbers";
import { trackFrameTime } from "../utils";

export const postRenderCallback = (): void => {
  trackFrameTime();
  renderFloatingText();
};
