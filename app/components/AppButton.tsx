import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TouchableOpacityProps,
} from "react-native";
import colors from "../../config/colors";

interface AppButtonProps extends TouchableOpacityProps {
  title: string;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  style,
  ...otherProps
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} {...otherProps}>
      <Text style={styles.btnText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
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
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AppButton;
