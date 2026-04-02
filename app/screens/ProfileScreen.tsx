import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Switch,
  TouchableOpacity,
} from "react-native";
import { User } from "@supabase/supabase-js";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";

import colors from "../../config/colors";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import { useTheme } from "../../config/theme/ThemeProvider";
import CurrencySelector from "./components/CurrencySelector";
import { useThemeColors } from "../../config/theme/colorMode";
import { useCurrency } from "../../config/currencyProvider";

import {
  backupDataToCloud,
  restoreDataFromCloud,
} from "../../Hooks/handleBackup";

// Import your new modal (Adjust the path as needed!)
import EditProfileModal from "./components/EditProfileModal";

interface ProfileScreenProps {
  user: User;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { isLightMode, toggleTheme } = useTheme();
  const { loading, handleSignOut } = useAppScreenLogic(user);
  const { currency, setCurrency } = useCurrency();
  const { titlecolor, secondarycolormode } = useThemeColors();

  // You might want to pull fullName from user.user_metadata if useAppScreenLogic doesn't auto-refresh
  // when metadata changes, but for now we'll keep your hook.
  const { fullName } = useAppScreenLogic(user);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // NEW: State to handle modal visibility
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Extract initial names from Supabase user metadata
  const initialFirstName = user?.user_metadata?.first_name || "";
  const initialLastName = user?.user_metadata?.last_name || "";

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

      <TouchableOpacity
        style={styles.editProfileButton}
        onPress={() => setIsEditModalVisible(true)} // Open the modal
      >
        <MaterialCommunityIcons
          name="pencil"
          size={16}
          color={colors.secondary}
          style={styles.editIcon}
        />
        <AppText style={styles.editProfileText}>Edit Profile</AppText>
      </TouchableOpacity>

      {/* Profile Info Section */}
      <View style={styles.profileHeaderContainer}>
        <View style={styles.nameContainer}>
          <AppText style={[styles.nameLabel, { color: titlecolor }]}>
            Logged in as
          </AppText>
          <AppText style={[styles.nameText, { color: secondarycolormode }]}>
            {fullName}
          </AppText>
        </View>
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

      <EditProfileModal
        isVisible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        initialFirstName={initialFirstName}
        initialLastName={initialLastName}
        onUpdateSuccess={() => {
          setIsEditModalVisible(false);
        }}
      />
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
    marginBottom: 5, // Reduced margin to bring the edit button closer
  },
  editProfileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(158, 158, 158, 0.21)",
    marginBottom: 25,
  },
  editIcon: {
    marginRight: 5,
  },
  editProfileText: {
    fontSize: 14,
    color: colors.secondary,
    fontWeight: "600",
  },
  profileHeaderContainer: {
    width: "100%",
    marginBottom: 20,
  },
  nameContainer: {
    justifyContent: "space-between",
    width: "100%",
    flexDirection: "row",
    marginBottom: 5,
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
