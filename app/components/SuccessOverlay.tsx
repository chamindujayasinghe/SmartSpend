import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import colors from "../../config/colors";
import AppText from "./AppText";
import { useThemeColors } from "../../config/theme/colorMode";

interface SuccessOverlayProps {
  fullName: string;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ fullName }) => {
  const { titlecolor, secondarycolormode } = useThemeColors();
  return (
    <View style={styles.container}>
      <AppText style={styles.successTitle}>SUCCESS!</AppText>
      <AppText style={[styles.successSubtitle, { color: titlecolor }]}>
        Welcome, {fullName}.
      </AppText>
      <AppText style={[styles.redirectText, { color: secondarycolormode }]}>
        Loading your Smart-Spend App...
      </AppText>
      <ActivityIndicator
        size="large"
        color={colors.secondary}
        style={{ marginTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontWeight: "bold",
    fontSize: 40,
    marginBottom: 10,
    color: colors.secondary,
  },
  successSubtitle: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  redirectText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default SuccessOverlay;
