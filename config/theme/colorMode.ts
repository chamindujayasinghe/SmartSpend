import colors from "../colors";
import { useTheme } from "./ThemeProvider";

export const useThemeColors = () => {
  const { isLightMode } = useTheme();

  const darksecondary = isLightMode ? colors.darkSecondary : colors.secondary
  
  // text colors
  const secondarycolormode = isLightMode ? colors.darkbrown : colors.light;
  const titlecolor = isLightMode ? colors.brown : colors.white;
  const colormode2 = isLightMode ? colors.white : colors.black
  const placeholderdark = isLightMode ? colors.darkbrown : colors.light

  // auth colors
  const textinputcolor = isLightMode ? colors.midbrown : colors.dark;
  const placeholdertext = isLightMode ? colors.lightPrimary : colors.light;
  const googlebutton = isLightMode ? colors.midDark : colors.white;

  //tab bar colors
  const tabBarColor = isLightMode ? colors.darklight : colors.dark;
  const tabBatInactiveColor = isLightMode ? colors.brown : colors.light;

  //stats page
  const periodbtn = isLightMode ? colors.darklight : colors.dark
  const modal =  isLightMode ? colors.white : colors.dark

  //calender page
  const arrows = isLightMode ? colors.brown : colors.secondary
  const modal2 = isLightMode ? colors.white : colors.primary
  const modal3 = isLightMode ? colors.darklight : colors.primary

  return {
    secondarycolormode,
    textinputcolor,
    titlecolor,
    placeholdertext,
    tabBarColor,
    tabBatInactiveColor,
    googlebutton,
    periodbtn,
    darksecondary,
    modal,
    arrows,
    colormode2,
    modal2,
    placeholderdark,
    modal3
  };
};