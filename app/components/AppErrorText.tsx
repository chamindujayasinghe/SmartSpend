import React from "react";
import { Text, View, StyleSheet } from "react-native";
import colors from "../../config/colors";

interface AppErrorTextProps {
  children?: React.ReactNode;
  visible?: boolean;
}

const AppErrorText: React.FC<AppErrorTextProps> = ({ children, visible }) => {
  if (!visible || !children) return null;
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  text: {
    color: colors.error,
    fontSize: 15,
  },
});

export default AppErrorText;
