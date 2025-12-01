import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TouchableOpacityProps,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import colors from "../../config/colors";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
  iconName?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  textColor?: string;
  iconComponent?: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  style,
  iconName,
  textColor = colors.black,
  iconComponent,
  ...otherProps
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} {...otherProps}>
      {iconComponent && iconComponent}
      <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
      {iconName && (
        <MaterialCommunityIcons
          style={styles.icon}
          name={iconName}
          size={24}
          color={textColor}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 50,
    borderRadius: 10,
    marginTop: 40,
    backgroundColor: colors.secondary,
    shadowColor: colors.secondary,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  btnText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 20,
  },
  icon: {
    marginLeft: 20,
  },
});

export default AppButton;
