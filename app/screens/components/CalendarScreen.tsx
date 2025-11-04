import React from "react";
import { View, StyleSheet } from "react-native";
import colors from "../../../config/colors";
import AppText from "../../components/AppText";

const CalendarScreen = () => {
  return (
    <View style={styles.container}>
      <AppText>calender page</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    flex: 1,
  },
});

export default CalendarScreen;
