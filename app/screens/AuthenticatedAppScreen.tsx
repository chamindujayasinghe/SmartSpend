import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { User } from "@supabase/supabase-js";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";

interface AppScreenProps {
  user: User;
  isInitialLogin?: boolean;
}

const AppScreen: React.FC<AppScreenProps> = ({
  user,
  isInitialLogin = false,
}) => {
  const { loading, showSuccessMessage, fullName, handleSignOut } =
    useAppScreenLogic(user, isInitialLogin);

  if (showSuccessMessage) {
    return (
      <View style={[styles.container, styles.successOverlay]}>
        <AppText style={styles.successTitle}>SUCCESS!</AppText>
        <AppText style={styles.successSubtitle}>Welcome, {fullName}.</AppText>
        <AppText style={styles.redirectText}>
          Loading your Smart-Spend Dashboard...
        </AppText>
        <ActivityIndicator
          size="large"
          color={colors.secondary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Dashboard</AppText>

      <AppText style={[styles.title, { fontSize: 22 }]}>{fullName}</AppText>

      <AppText style={styles.subtitle}>
        This is your authenticated Smart-Spend dashboard.
      </AppText>

      <AppText style={styles.userId}>User ID: {user.id}</AppText>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.secondary}
          style={{ marginTop: 30 }}
        />
      ) : (
        <AppButton
          title="Sign Out"
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  successOverlay: {
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

  title: {
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 10,
    color: colors.white,
  },

  subtitle: {
    fontSize: 18,
    color: colors.light,
    marginBottom: 30,
  },

  userId: {
    fontSize: 14,
    color: colors.light,
    marginBottom: 50,
    textAlign: "center",
    padding: 10,
    backgroundColor: colors.dark,
    borderRadius: 8,
  },

  signOutButton: {
    width: "80%",
  },
});

export default AppScreen;
