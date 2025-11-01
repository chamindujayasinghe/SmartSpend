import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import colors from "../../config/colors";
import AppText from "./AppText";

interface SuccessOverlayProps {
  fullName: string;
}

const SuccessOverlay: React.FC<SuccessOverlayProps> = ({ fullName }) => {
  return (
    <View style={styles.container}>
      <AppText style={styles.successTitle}>SUCCESS!</AppText>
      <AppText style={styles.successSubtitle}>Welcome, {fullName}.</AppText>
      <AppText style={styles.redirectText}>
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
    backgroundColor: "transparent",
  },
  successTitle: {
    fontWeight: "bold",
    fontSize: 40,
    marginBottom: 10,
    color: colors.secondary,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  successSubtitle: {
    fontSize: 22,
    color: colors.white,
    marginBottom: 20,
    textAlign: "center",
  },
  redirectText: {
    fontSize: 16,
    color: colors.white,
    marginTop: 10,
  },
});

export default SuccessOverlay;
