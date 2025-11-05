import React from "react";
import { View, StyleSheet } from "react-native";

import colors from "../../../config/colors";
import AppText from "../../components/AppText";

interface Props {
  income: number;
  expenses: number;
  total: number;
}

const CalendarHeader: React.FC<Props> = ({ income, expenses, total }) => {
  return (
    <View style={styles.container}>
      <View style={styles.column}>
        <AppText style={styles.title}>Income</AppText>
        <AppText style={[styles.amount, styles.income]}>
          $ {income.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText style={styles.title}>Expenses</AppText>
        <AppText style={[styles.amount, styles.expense]}>
          $ {expenses.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText style={styles.title}>Total</AppText>
        <AppText style={[styles.amount, styles.total]}>
          $ {total.toFixed(2)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 5,
    backgroundColor: colors.darkPrimary,
  },
  column: {
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    color: colors.light,
    marginBottom: 4,
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  income: {
    color: colors.secondary,
  },
  expense: {
    color: colors.danger,
  },
  total: {
    color: colors.white,
  },
});

export default CalendarHeader;
