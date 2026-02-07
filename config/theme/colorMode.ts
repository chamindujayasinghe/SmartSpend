import colors from "../colors";
import { useTheme } from "./ThemeProvider";

export const useThemeColors = () => {
  const { isLightMode } = useTheme();

  const colormode1 = isLightMode ? colors.black : colors.white;
  const colormode2 = isLightMode ? colors.white : colors.black;

  const secondarycolormode = isLightMode ? colors.dark : colors.light;
  const titlecolor = isLightMode ? colors.black : colors.white;

  // auth colors
  const textinputcolor = isLightMode ? colors.light : colors.dark;
  const placeholder = isLightMode ? colors.darkPrimary : colors.light;

  return {
    secondarycolormode,
    textinputcolor,
    titlecolor,
    placeholder,
    colormode1,
    colormode2,
  };
};
