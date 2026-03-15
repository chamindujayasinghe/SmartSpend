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

// Import both backup and restore functions
import {
  backupDataToCloud,
  restoreDataFromCloud,
} from "../../Hooks/handleBackup";

interface ProfileScreenProps {
  user: User;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { isLightMode, toggleTheme } = useTheme();
  const { loading, handleSignOut } = useAppScreenLogic(user);
  const { currency, setCurrency } = useCurrency();
  const { titlecolor, secondarycolormode } = useThemeColors();
  const { fullName } = useAppScreenLogic(user);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false); // Add restoring state

  const handleBackup = async () => {
    setIsBackingUp(true);
    await backupDataToCloud();
    setIsBackingUp(false);
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    await restoreDataFromCloud();
    setIsRestoring(false);
  };

  return (
    <View style={styles.container}>
      <AppText style={[styles.title, { color: titlecolor }]}>Profile</AppText>
      <View style={styles.nameContainer}>
        <AppText style={[styles.nameLabel, { color: titlecolor }]}>
          Logged in as
        </AppText>
        <AppText style={[styles.nameText, { color: secondarycolormode }]}>
          {fullName}
        </AppText>
      </View>

      <CurrencySelector value={currency} onSelect={setCurrency} />

      <View style={styles.toggleContainer}>
        <AppText style={[styles.toggleLabel, { color: titlecolor }]}>
          {isLightMode ? "Light Mode" : "Dark Mode"}
        </AppText>
        <Switch
          trackColor={{ false: colors.light, true: colors.secondary }}
          thumbColor={colors.white}
          onValueChange={toggleTheme}
          value={isLightMode}
          style={{ transform: [{ scale: 0.9 }] }}
        />
      </View>

      {/* Backup Button */}
      {isBackingUp ? (
        <ActivityIndicator
          size="large"
          color={colors.secondary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <AppButton
          textColor={colors.white}
          iconName="cloud-upload"
          title="Backup"
          style={styles.cloudbackupbtn}
          onPress={handleBackup}
          fontSize={14}
        />
      )}

      {/* Restore Button */}
      {isRestoring ? (
        <ActivityIndicator
          size="large"
          color={colors.secondary}
          style={{ marginTop: 20 }}
        />
      ) : (
        <AppButton
          textColor={colors.white}
          iconName="cloud-download"
          title="Restore"
          style={styles.cloudbackupbtn}
          onPress={handleRestore}
          fontSize={14}
        />
      )}

      {/* Sign Out Button */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.danger}
          style={{ marginTop: 20 }}
        />
      ) : (
        <AppButton
          textColor={colors.white}
          fontSize={14}
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
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    fontSize: 28,
    color: colors.white,
    marginBottom: 30,
  },
  nameContainer: {
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    marginBottom: 15,
  },
  nameLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.light,
  },
  nameText: {
    fontSize: 18,
    color: colors.white,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  signOutButton: {
    height: 35,
    marginTop: 20,
    width: "40%",
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
  cloudbackupbtn: {
    height: 35,
    marginTop: 20,
    backgroundColor: colors.secondary,
    width: "40%",
    fontSize: 12,
  },
});

export default ProfileScreen;
