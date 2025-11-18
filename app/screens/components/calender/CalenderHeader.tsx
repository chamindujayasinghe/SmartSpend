import React, { isValidElement } from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { useThemeColors } from "../../../../config/theme/colorMode";

interface Props {
  income: number;
  expenses: number;
  total: number;
}

const CalendarHeader: React.FC<Props> = ({ income, expenses, total }) => {
  const { titlecolor, darksecondary, tabBarColor } = useThemeColors();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tabBarColor,
        },
      ]}
    >
      <View style={styles.column}>
        <AppText style={[styles.title, { color: titlecolor }]}>Income</AppText>
        <AppText style={[styles.amount, { color: darksecondary }]}>
          $ {income.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText style={[styles.title, { color: titlecolor }]}>
          Expenses
        </AppText>
        <AppText style={[styles.amount, styles.expense]}>
          $ {expenses.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText style={[styles.title, { color: titlecolor }]}>Total</AppText>
        <AppText style={[styles.amount, { color: titlecolor }]}>
          $ {total.toFixed(2)}
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    borderRadius: 20,
  },
  column: {
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 7,
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
  },

  expense: {
    color: colors.danger,
  },
});

export default CalendarHeader;
