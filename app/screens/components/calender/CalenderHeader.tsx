import React, { isValidElement } from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { useTheme } from "../../../../config/theme/ThemeProvider";

interface Props {
  income: number;
  expenses: number;
  total: number;
}

const CalendarHeader: React.FC<Props> = ({ income, expenses, total }) => {
  const { isLightMode } = useTheme();
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isLightMode ? colors.darklight : colors.darkPrimary,
        },
      ]}
    >
      <View style={styles.column}>
        <AppText
          style={[
            styles.title,
            { color: isLightMode ? colors.brown : colors.light },
          ]}
        >
          Income
        </AppText>
        <AppText
          style={[
            styles.amount,
            { color: isLightMode ? colors.darkSecondary : colors.secondary },
          ]}
        >
          $ {income.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText
          style={[
            styles.title,
            { color: isLightMode ? colors.brown : colors.light },
          ]}
        >
          Expenses
        </AppText>
        <AppText style={[styles.amount, styles.expense]}>
          $ {expenses.toFixed(2)}
        </AppText>
      </View>
      <View style={styles.column}>
        <AppText
          style={[
            styles.title,
            { color: isLightMode ? colors.brown : colors.light },
          ]}
        >
          Total
        </AppText>
        <AppText
          style={[
            styles.amount,
            { color: isLightMode ? colors.dark : colors.white },
          ]}
        >
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
    padding: 10,
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
