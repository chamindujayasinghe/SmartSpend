import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { User } from "@supabase/supabase-js";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import SuccessOverlay from "../components/SuccessOverlay";

interface HomeScreenProps {
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const { fullName } = useAppScreenLogic(user);

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Dashboard</AppText>
      <AppText style={[styles.title, { fontSize: 22 }]}>{fullName}</AppText>
      <AppText style={styles.subtitle}>
        Welcome to your Smart-Spend dashboard.
      </AppText>
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
    marginBottom: 10,
    color: colors.white,
  },
  subtitle: {
    fontSize: 18,
    color: colors.light,
    marginBottom: 30,
    textAlign: "center",
  },
});

export default HomeScreen;
