import { configObject } from "./config";
import { debugLog } from "./logging";
import { mod } from "./mod";

const SPIDER_PLUS_SETTINGS_PAGE = "SpiderMod+";
function convertBooleanToHumanReadable(
  prefix: string,
  boolValue: boolean,
): string {
  return `${prefix}: ${boolValue ? "on" : "off"}`;
}

function setConfigBoolFieldFlip(
  fieldName: keyof typeof configObject.persistent,
) {
  configObject.persistent[fieldName] = !configObject.persistent[fieldName];
}

function addBooleanSetting(
  settingName: string,
  configField: keyof typeof configObject.persistent,
  info: string[],
) {
  ModConfigMenu?.AddSetting(SPIDER_PLUS_SETTINGS_PAGE, null, {
    Type: ModConfigMenu.OptionType.BOOLEAN,
    CurrentSetting: () => configObject.persistent[configField],
    Display: () =>
      convertBooleanToHumanReadable(
        `${settingName}`,
        configObject.persistent[configField],
      ),
    OnChange: () => {
      setConfigBoolFieldFlip(configField);
    },
    Info: info,
  });
}

export function setupModConfig(): void {
  if (!ModConfigMenu) {
    return;
  }
  debugLog("Setting up mod configuration!");

  addBooleanSetting("Damage Numbers", "damageBars", [
    "Enables/Disables floating damage numbers when damaging enemies",
  ]);
  addBooleanSetting("Health Bars", "healthBars", [
    "Enables/Disables the health bars that follow enemies",
  ]);
  addBooleanSetting("Display health for Bosses", "bossHealthBars", [
    "Enables/Disables health bars being rendered for bosses",
  ]);
  addBooleanSetting("Display damage for Bosses", "bossDamageNums", [
    "Enables/Disables damage numbers being rendered for bosses",
  ]);
  mod.saveDataManager("config", configObject);
}
