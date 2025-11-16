import React from "react";
import { View, StyleSheet, ActivityIndicator, Switch } from "react-native";
import { User } from "@supabase/supabase-js";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import { useTheme } from "../../config/theme/ThemeProvider";

interface ProfileScreenProps {
  user: User;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { isLightMode, toggleTheme } = useTheme();
  const { loading, handleSignOut } = useAppScreenLogic(user);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Profile</AppText>

      <AppText style={styles.emailLabel}>Logged in as:</AppText>
      <AppText style={styles.emailText}>{user.email}</AppText>

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
    backgroundColor: "transparent",
  },
  title: {
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 40,
    color: colors.white,
  },
  emailLabel: {
    fontSize: 16,
    color: colors.light,
  },
  emailText: {
    fontSize: 18,
    color: colors.white,
    marginBottom: 60,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
  },
  toggleSwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  signOutButton: {
    width: "60%",
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
});

export default ProfileScreen;
