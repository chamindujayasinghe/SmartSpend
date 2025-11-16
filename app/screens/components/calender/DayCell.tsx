import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarCell } from "../../../../Hooks/calenderTypes";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { useTheme } from "../../../../config/theme/ThemeProvider";

interface DayCellProps {
  item: CalendarCell;
  onPress: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = React.memo(({ item, onPress }) => {
  const { isLightMode } = useTheme();
  if (item.day === null) {
    return <View style={styles.cell} />;
  }

  const handlePress = () => {
    if (item.fullDate) {
      onPress(item.fullDate);
    }
  };

  const { day, isToday, isSunday, income = 0, expense = 0 } = item;
  const hasIncome = income > 0;
  const hasExpense = expense > 0;

  return (
    <TouchableOpacity
      style={[
        styles.cell,
        { borderColor: isLightMode ? colors.brown : colors.dark },
      ]}
      onPress={handlePress}
    >
      <View style={styles.dayNumberContainer}>
        {isToday ? (
          <View
            style={[
              styles.todayBackground,
              { backgroundColor: isLightMode ? colors.brown : colors.white },
            ]}
          >
            <AppText
              style={[
                styles.dayText,
                [
                  styles.todayText,
                  { color: isLightMode ? colors.white : colors.black },
                ],
              ]}
            >
              {day}
            </AppText>
          </View>
        ) : (
          <AppText
            style={[
              styles.dayText,
              isSunday
                ? styles.sundayText
                : [
                    styles.otherDayText,
                    { color: isLightMode ? colors.brown : colors.light },
                  ],
            ]}
          >
            {day}
          </AppText>
        )}
      </View>

      {(hasIncome || hasExpense) && (
        <View>
          {hasIncome && (
            <AppText style={[styles.summaryText, styles.incomeText]}>
              {income.toFixed(0)}
            </AppText>
          )}
          {hasExpense && (
            <AppText style={[styles.summaryText, styles.expenseText]}>
              {expense.toFixed(0)}
            </AppText>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cell: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    padding: 4,
    minHeight: 60,
    justifyContent: "space-between",
    flexDirection: "column",
  },
  dayNumberContainer: {
    alignSelf: "flex-end",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  todayText: {
    color: colors.dark,
    fontWeight: "bold",
  },
  todayBackground: {
    backgroundColor: colors.white,
    height: 28,
    width: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  sundayText: {
    textAlign: "right",
    color: colors.danger,
  },
  otherDayText: {
    textAlign: "right",
    color: colors.light,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: "bold",
    alignSelf: "flex-end",
  },
  incomeText: {
    color: colors.secondary,
  },
  expenseText: {
    color: colors.danger,
  },
});

export default DayCell;
