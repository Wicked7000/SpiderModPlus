import { renderHealthbars } from "../healthbar";
import { trackSpidermodItem } from "../utils";

export const postUpdateCallback = (): void => {
  trackSpidermodItem();
  renderHealthbars();
};
