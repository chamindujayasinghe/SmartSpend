import { View, StyleSheet, TouchableOpacity } from "react-native";
import React from "react";
import colors from "../../../../config/colors";
import AppText from "../../../components/AppText";
import { Transaction } from "../../../../utilities/storage";

interface headerprops {
  selectedPeriod: string;
}

const BudgetHeader = ({ selectedPeriod }: headerprops) => {
  return (
    <View style={styles.header}>
      <View style={styles.budgetRow}>
        <View style={styles.remainingContainer}>
          <AppText style={styles.remainingtxt}>
            Remaining ({selectedPeriod})
          </AppText>
          <AppText style={styles.remainingtxt}>0.00</AppText>
        </View>
        <TouchableOpacity style={styles.budgetBtn}>
          <AppText style={styles.budgetsettingtxt}>Budget Setting</AppText>
        </TouchableOpacity>
      </View>
      <View style={[styles.budgetRow, { marginTop: 25 }]}>
        <View style={styles.progressContainer}>
          <AppText style={styles.spendedTxt}>{selectedPeriod}</AppText>
          <AppText style={styles.spendedTxt}>0.00</AppText>
        </View>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View style={styles.progressBarFill} />
            <AppText style={styles.progressPercentText}>50%</AppText>
          </View>
          <View style={styles.bottomValuesRow}>
            <AppText style={styles.bottomValueText}>0.00</AppText>
            <AppText style={styles.bottomValueText}>0.00</AppText>
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
    backgroundColor: colors.dark,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  remainingContainer: {
    alignItems: "flex-start",
  },
  remainingtxt: {
    color: colors.white,
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
    borderWidth: 1,
    borderColor: colors.white,
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
    fontSize: 12,
    fontWeight: "500",
  },
});

export default BudgetHeader;
