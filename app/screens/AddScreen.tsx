import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import NoteAddScreen from "./components/NoteAddScreen";
import CalendarScreen from "./components/calender/CalendarScreen";
import { useTheme } from "../../config/theme/ThemeProvider";

type AddTab = "calender" | "note";

const AddScreen: React.FC = () => {
  const { isLightMode } = useTheme();
  const [selectedTab, setSelectedTab] = useState<AddTab>("calender");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText
          style={[
            styles.title,
            { color: isLightMode ? colors.brown : colors.white },
          ]}
        >
          Add New Entry
        </AppText>
      </View>

      <View
        style={[
          styles.tabsContainer,
          { borderBottomColor: isLightMode ? colors.darkbrown : colors.dark },
        ]}
      >
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("calender")}
        >
          <AppText
            style={[
              styles.tabText,
              { color: isLightMode ? colors.darkbrown : colors.light },
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
          onPress={() => setSelectedTab("note")}
        >
          <AppText
            style={[
              styles.tabText,
              { color: isLightMode ? colors.darkbrown : colors.light },
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
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
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
    textTransform: "capitalize",
  },
  activeTabText: {
    color: colors.secondary,
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
