import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../../../../config/colors";
import AppText from "../../../components/AppText";
import { useThemeColors } from "../../../../config/theme/colorMode";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { AppStackParamList } from "../../../navigation/AppNavigator";

interface HeaderProps {
  selectedPeriod: string;
  selectedTab: "incomes" | "expenses";
}

const BudgetHeader = ({ selectedPeriod, selectedTab }: HeaderProps) => {
  const { secondarycolormode, colormode2 } = useThemeColors();

  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const handleBudgetSettingPress = () => {
    const initialType = selectedTab === "incomes" ? "Income" : "Expense";

    navigation.navigate("BudgetSetting", {
      selectedPeriod: selectedPeriod,
      initialType: initialType,
    });
  };

  return (
    <View style={[styles.header, { backgroundColor: secondarycolormode }]}>
      <View style={styles.budgetRow}>
        <View style={styles.remainingContainer}>
          <AppText style={[styles.remainingtxt, { color: colormode2 }]}>
            Remaining ({selectedPeriod})
          </AppText>
          <AppText style={styles.remainingtxt}>0.00</AppText>
        </View>
        <TouchableOpacity
          onPress={handleBudgetSettingPress}
          style={[styles.budgetBtn, { borderColor: colormode2 }]}
        >
          <AppText style={[styles.budgetsettingtxt, { color: colormode2 }]}>
            Budget Setting
          </AppText>
        </TouchableOpacity>
      </View>
      <View style={[styles.budgetRow, { marginTop: 25 }]}>
        <View style={styles.progressContainer}>
          <AppText style={[styles.spendedTxt, { color: colormode2 }]}>
            {selectedPeriod}
          </AppText>
          <AppText style={styles.spendedTxt}>0.00</AppText>
        </View>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View style={styles.progressBarFill} />
            <AppText style={styles.progressPercentText}>50%</AppText>
          </View>
          <View style={styles.bottomValuesRow}>
            <AppText style={[styles.bottomValueText, { color: colormode2 }]}>
              0.00
            </AppText>
            <AppText style={[styles.bottomValueText, { color: colormode2 }]}>
              0.00
            </AppText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginBottom: 20,
  },
  remainingContainer: {
    alignItems: "flex-start",
  },
  remainingtxt: {
    fontSize: 15,
    fontWeight: "500",
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetBtn: {
    flexDirection: "row",
    padding: 8,
    justifyContent: "center",
    textAlign: "center",
    borderWidth: 1.5,
    borderRadius: 10,
  },

  budgetsettingtxt: {
    fontSize: 16,
  },

  progressContainer: {
    alignItems: "flex-start",
  },

  spendedTxt: {
    fontSize: 15,
  },

  progressBarWrapper: {
    marginLeft: 40,
    flex: 1,
  },

  progressBarBackground: {
    height: 25,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: "#555",
    marginBottom: 3,
    justifyContent: "center",
  },

  progressBarFill: {
    width: "50%",
    height: "100%",
    backgroundColor: colors.secondary,
  },

  progressPercentText: {
    position: "absolute",
    right: 5,
    color: colors.white,
    fontSize: 13,
    fontWeight: "600",
  },
  bottomValuesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },

  bottomValueText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default BudgetHeader;
