type RGBArray = [number, number, number];
type CategoryData = {
    Name: string;
    Info: string;
    IsOld: boolean;
};
type SubcategoryData = {
    Name: string;
    Info: string;
};
type SettingTable = {
    Type: ModConfigMenu.OptionType;
    Attribute?: string;
    Default?: any;
    CurrentSetting: () => any;
    Minimum?: number;
    Maximum?: number;
    Display: () => string;
    OnChange: () => void;
    Info: string[];
    Color?: {
        r: number;
        g: number;
        b: number;
    }
};

/** @noSelf **/
declare interface ModConfigMenuInternal {
    VERSION: number;
    OptionType: {
        BOOLEAN: string;
    };
    GetCategoryIDByName: (categoryName: string) => number;
    UpdateCategory: (categoryName: string, categoryData: CategoryData) => unknown;
    SetCategoryInfo: (categoryName: string, info: string) => unknown;
    RemoveCategory: (categoryName: string) => unknown;
    GetSubcategoryIDByName: (category: string|number, subcategoryName: string) => number;
    UpdateSubcategory: (categoryName: string, subcategoryName: string, subcategoryData: SubcategoryData) => unknown;
    RemoveSubcategory: (categoryName: string, subcategoryName: string) => unknown;
    
    // @noSelf 
    AddSetting: (categoryName: string, subcategoryName: string | null, settingTable: SettingTable) => unknown;
    RemoveSetting: (categoryName: string, subcategoryName: string, settingAttribute: string) => unknown;
    AddText: (categoryName: string, subcategoryName: string, text: string, color: RGBArray) => unknown;
    AddTitle: (categoryName: string, subcategoryName: string, text: string, color: RGBArray) => unknown;
    AddSpace: (categoryName: string, subcategoryName: string) => unknown;
    AddBooleanSetting: (categoryName: string, subcategoryName: string, configTableAttribute: unknown, defaultValue: boolean, displayText: string, displayValueProxies: unknown, info: string, color: RGBArray) => unknown;
    AddNumberSetting: (categoryName: string, subcategoryName: string, configTableAttribute: unknown, minValue: number, maxValue: number, modifyBy: number, defaultValue: number, displayText: string, displayValueProxies: unknown, info: string, color: RGBArray) => unknown;
    AddScrollSetting: (categoryName: string, subcategoryName: string, configTableAttribute: unknown, defaultValue: boolean, displayText: string, displayValueProxies: unknown, info: string, color: RGBArray) => unknown;
    AddKeyboardSetting: (categoryName: string, subcategoryName: string, configTableAttribute: unknown, defaultValue: boolean, displayText: string, displayValueProxies: unknown, info: string, color: RGBArray) => unknown;
    AddControllerSetting: (categoryName: string, subcategoryName: string, configTableAttribute: unknown, defaultValue: boolean, displayText: string, displayValueProxies: unknown, info: string, color: RGBArray) => unknown;
}


declare const ModConfigMenu: ModConfigMenuInternal | undefined;
