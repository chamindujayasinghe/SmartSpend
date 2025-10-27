import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TextStyle,
  StyleProp,
  Platform,
} from "react-native";
import colors from "../../config/colors";

interface AppTextProps {
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

const AppText: React.FC<AppTextProps> = ({ style, children }) => {
  return <Text style={[styles.text, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    color: colors.white,
    textAlign: "center",
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
  },
});

export default AppText;
