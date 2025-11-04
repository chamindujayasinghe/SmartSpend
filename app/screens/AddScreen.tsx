import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import AppText from "../components/AppText"; // Use your AppText component
import colors from "../../config/colors";

// Import the content screens
import BudgetAddScreen from "./components/BudgetAddScreen";
import NoteAddScreen from "./components/NoteAddScreen";
import CalendarScreen from "./components/CalendarScreen";

type AddTab = "calender" | "budget" | "note";

const AddScreen: React.FC = () => {
  // 2. Create state to hold the selected tab
  const [selectedTab, setSelectedTab] = useState<AddTab>("calender");

  return (
    <View style={styles.container}>
      {/* This is your custom header from the image */}
      <View style={styles.header}>
        <AppText style={styles.title}>Add New Entry</AppText>
      </View>

      {/* 3. This is the tab container, copied from StatsScreen */}
      <View style={styles.tabsContainer}>
        {/* Tab 1: Calender */}
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("calender")}
        >
          <AppText
            style={[
              styles.tabText,
              selectedTab === "calender" && styles.activeTabText,
            ]}
          >
            Calender
          </AppText>
          {selectedTab === "calender" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("budget")}
        >
          <AppText
            style={[
              styles.tabText,
              selectedTab === "budget" && styles.activeTabText,
            ]}
          >
            Budget
          </AppText>
          {selectedTab === "budget" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("note")}
        >
          <AppText
            style={[
              styles.tabText,
              selectedTab === "note" && styles.activeTabText,
            ]}
          >
            Note
          </AppText>
          {selectedTab === "note" && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {selectedTab === "calender" && <CalendarScreen />}
        {selectedTab === "budget" && <BudgetAddScreen />}
        {selectedTab === "note" && <NoteAddScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 18,
    color: colors.light,
    fontWeight: "600",
    textTransform: "capitalize", // Matches your image
  },
  activeTabText: {
    color: colors.secondary, // Your active blue color
  },
  activeTabIndicator: {
    height: 3,
    width: "70%",
    backgroundColor: colors.secondary,
    position: "absolute",
    bottom: 0,
    borderRadius: 1.5,
  },
  contentArea: {
    flex: 1,
  },
});

export default AddScreen;
