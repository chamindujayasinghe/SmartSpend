import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Platform,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import colors from "../../config/colors";

interface AppTextInputProps extends TextInputProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  isPassword?: boolean;
}

const AppTextInput: React.FC<AppTextInputProps> = ({
  icon,
  isPassword = false,
  style,
  ...otherProps
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      {icon && <MaterialCommunityIcons style={styles.icon} name={icon} />}
      <TextInput
        style={[styles.textinput, style]}
        secureTextEntry={isPassword && !isPasswordVisible}
        {...otherProps}
        placeholderTextColor={colors.light}
      />
      {isPassword && (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <FontAwesome
            name={isPasswordVisible ? "eye-slash" : "eye"}
            style={styles.eye}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark,
    borderRadius: 10,
    height: 50,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  textinput: {
    flex: 1,
    height: "100%",
    color: colors.white,
    fontSize: 16,
    fontFamily: Platform.OS === "android" ? "Roboto" : "Avenir",
  },
  icon: {
    color: colors.secondary,
    margin: 15,
    fontSize: 20,
    shadowColor: colors.secondary,
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  eye: {
    color: colors.secondary,
    fontSize: 18,
    paddingHorizontal: 5,
  },
});

export default AppTextInput;
