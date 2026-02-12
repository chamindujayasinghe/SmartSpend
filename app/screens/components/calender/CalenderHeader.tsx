import React, { isValidElement } from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { useThemeColors } from "../../../../config/theme/colorMode";
import { useCurrency } from "../../../../config/currencyProvider";

interface Props {
  income: number;
  expenses: number;
  total: number;
}

const CalendarHeader: React.FC<Props> = ({ income, expenses, total }) => {
  const { colormode2, secondarycolormode } = useThemeColors();
  const { currency } = useCurrency();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: secondarycolormode,
        },
      ]}
    >
      <View style={styles.column}>
        <AppText style={[styles.title, { color: colormode2 }]}>Income</AppText>
        <AppText style={[styles.amount, { color: colors.secondary }]}>
          {currency} {income.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText style={[styles.title, { color: colormode2 }]}>
          Expenses
        </AppText>
        <AppText style={[styles.amount, styles.expense]}>
          {currency} {expenses.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText style={[styles.title, { color: colormode2 }]}>Total</AppText>
        <AppText style={[styles.amount, { color: colormode2 }]}>
          {currency} {total.toFixed(2)}
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
