import React from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { User } from "@supabase/supabase-js";

import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";

interface ProfileScreenProps {
  user: User;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const { loading, handleSignOut } = useAppScreenLogic(user);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Profile</AppText>

      <AppText style={styles.emailLabel}>Logged in as:</AppText>
      <AppText style={styles.emailText}>{user.email}</AppText>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.secondary}
          style={{ marginTop: 30 }}
        />
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
  signOutButton: {
    width: "60%",
    backgroundColor: colors.danger,
    shadowColor: colors.danger,
  },
});

export default ProfileScreen;
