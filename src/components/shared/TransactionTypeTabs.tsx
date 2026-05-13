import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
<<<<<<< HEAD:src/components/shared/TransactionTypeTabs.tsx
import AppText from "../ui/AppText";
import colors from "../../config/colors";
import { useThemeColors } from "../../config/theme/colorMode";
=======
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { useTheme } from "../../../config/theme/ThemeProvider";
import { useThemeColors } from "../../../config/theme/colorMode";
>>>>>>> 2df68ee2fa9c5e3984406726648b7ae9c4cdc2b5:app/screens/components/TransactionTypeTabs.tsx

type TabType = "Income" | "Expense";

interface Props {
  activeTab: string;
  onTabPress: (tab: TabType) => void;
}

const TABS: TabType[] = ["Income", "Expense"];

const TransactionTypeTabs: React.FC<Props> = ({ activeTab, onTabPress }) => {
<<<<<<< HEAD:src/components/shared/TransactionTypeTabs.tsx
  const { colormode2, secondarycolormode } = useThemeColors();
=======
  const { colormode1, colormode2, secondarycolormode } = useThemeColors();
>>>>>>> 2df68ee2fa9c5e3984406726648b7ae9c4cdc2b5:app/screens/components/TransactionTypeTabs.tsx
  return (
    <View style={styles.tabContainer}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            {
              backgroundColor: secondarycolormode,
              borderColor: colormode2,
            },
            activeTab === tab && styles.activeTabButton,
          ]}
          onPress={() => onTabPress(tab)}
        >
          <AppText
            style={[
              [styles.tabText, { color: colormode2 }],
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
