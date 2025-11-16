import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { useTheme } from "../../../config/theme/ThemeProvider";

type TabType = "Income" | "Expense";

interface Props {
  activeTab: string;
  onTabPress: (tab: TabType) => void;
}

const TABS: TabType[] = ["Income", "Expense"];

const TransactionTypeTabs: React.FC<Props> = ({ activeTab, onTabPress }) => {
  const { isLightMode } = useTheme();
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            {
              backgroundColor: isLightMode ? colors.lightbrown : colors.dark,
              borderColor: isLightMode ? colors.brown : colors.white,
            },
            activeTab === tab && styles.activeTabButton,
          ]}
          onPress={() => onTabPress(tab)}
        >
          <AppText
            style={[
              [
                styles.tabText,
                { color: isLightMode ? colors.brown : colors.light },
              ],
              activeTab === tab && styles.activeTabText,
            ]}
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
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
  },
  activeTabButton: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  tabText: {
    color: colors.light,
  },
  activeTabText: {
    color: colors.white,
    fontWeight: "bold",
  },
});

export default TransactionTypeTabs;
