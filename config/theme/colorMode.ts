import colors from "../colors";
import { useTheme } from "./ThemeProvider";

export const useThemeColors = () => {
  const { isLightMode } = useTheme();
  
  const secondarycolormode = isLightMode ? colors.darkbrown : colors.light;


  const textinputcolor = isLightMode ? colors.midbrown : colors.dark;
  const placeholdertext = isLightMode ? colors.lightPrimary : colors.light;
  const titlecolor = isLightMode ? colors.brown : colors.white;
  const tabBarColor = isLightMode ? colors.darklight : colors.primary;
  const tabBatInactiveColor = isLightMode ? colors.brown : colors.light;
  const googlebutton = isLightMode ? colors.midDark : colors.white;
  const googlebuttontxt = isLightMode ? colors.white : colors.primary

  return {
    secondarycolormode,
    textinputcolor,
    titlecolor,
    placeholdertext,
    tabBarColor,
    tabBatInactiveColor,
    googlebutton,
    googlebuttontxt
  };
};