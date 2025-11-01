import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { useRoute } from "@react-navigation/native";

// A generic placeholder for your other screens
const PlaceholderScreen = () => {
  const route = useRoute(); // Get route info

  return (
    <View style={styles.container}>
      <AppText style={styles.title}>Coming Soon</AppText>
      <AppText style={styles.subtitle}>
        You are on the "{route.name}" screen.
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light,
  },
});

export default PlaceholderScreen;
