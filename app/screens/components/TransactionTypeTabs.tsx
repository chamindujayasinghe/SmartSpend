// TransactionTypeTabs.tsx

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText"; // Adjust path if needed
import colors from "../../../config/colors"; // Adjust path if needed

type TabType = "Income" | "Expense" | "Transfer";

interface Props {
  activeTab: string;
  onTabPress: (tab: TabType) => void;
}

const TABS: TabType[] = ["Income", "Expense", "Transfer"];

const TransactionTypeTabs: React.FC<Props> = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            activeTab === tab && styles.activeTabButton,
          ]}
          onPress={() => onTabPress(tab)}
        >
          <AppText
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab}
          </AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.dark,
    marginRight: 10,
  },
  activeTabButton: {
    borderColor: colors.secondary,
  },
  tabText: {
    color: colors.light,
  },
  activeTabText: {
    color: colors.secondary,
    fontWeight: "bold",
  },
});

export default TransactionTypeTabs;
