import React, { useState } from "react";
import { View, StyleSheet, ActivityIndicator, Switch } from "react-native";
import { User } from "@supabase/supabase-js";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";

import colors from "../../config/colors";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import { useTheme } from "../../config/theme/ThemeProvider";
import CurrencySelector from "./components/CurrencySelector";
import { useThemeColors } from "../../config/theme/colorMode";
import { useCurrency } from "../../config/currencyProvider";

interface ProfileScreenProps {
  user: User;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { isLightMode, toggleTheme } = useTheme();
  const { loading, handleSignOut } = useAppScreenLogic(user);
  const { currency, setCurrency } = useCurrency();
  const { titlecolor, secondarycolormode } = useThemeColors();
  const { fullName } = useAppScreenLogic(user);

  return (
    <View style={styles.container}>
      <AppText style={[styles.title, { color: titlecolor }]}>Profile</AppText>

      <AppText style={[styles.emailLabel, { color: secondarycolormode }]}>
        Logged in as
      </AppText>
      <AppText style={[styles.emailText, { color: secondarycolormode }]}>
        {fullName}
      </AppText>

      <CurrencySelector value={currency} onSelect={setCurrency} />

      <View style={styles.toggleContainer}>
        <AppText style={styles.toggleLabel}>
          {isLightMode ? "Light Mode" : "Dark Mode"}
        </AppText>
        <Switch
          trackColor={{ false: colors.light, true: colors.secondary }}
          thumbColor={colors.white}
          onValueChange={toggleTheme}
          value={isLightMode}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.secondary} />
      ) : (
        <AppButton
          textColor={colors.white}
          iconName="logout"
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
  title: {
    fontWeight: "bold",
    fontSize: 28,
    color: colors.white,
  },
  emailLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.light,
  },
  emailText: {
    fontSize: 18,
    color: colors.white,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 30,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
  },
  signOutButton: {
    width: "60%",
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
});

export default ProfileScreen;
