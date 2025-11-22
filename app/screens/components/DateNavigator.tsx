import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../components/AppText";
import { Period } from "./PeriodSelector";
import { DateRange } from "../StatsScreen";
import { useThemeColors } from "../../../config/theme/colorMode";

interface DateNavigatorProps {
  currentDate: Date;
  selectedPeriod: Period;
  onNavigate: (direction: "previous" | "next") => void;
  dateRange: DateRange;
}

// Utility to format date in short style
const formatShortDate = (date: Date | null) => {
  if (!date) return "";
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Utility to get week range (Monday → Sunday)
const getWeekRange = (date: Date) => {
  const current = new Date(date);
  const day = current.getDay(); // Sunday = 0, Monday = 1, ...
  const diffToMonday = day === 0 ? -6 : 1 - day; // Sunday goes back 6 days

  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
};

// Format display based on period
const formatDisplayDate = (date: Date, period: Period, range: DateRange) => {
  switch (period) {
    case "Daily":
      return date.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    case "Weekly": {
      const { monday, sunday } = getWeekRange(date);
      return `${formatShortDate(monday)} - ${formatShortDate(sunday)}`;
    }

    case "Monthly":
      return date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });

    case "Annually":
      return date.getFullYear().toString();

    case "Period":
      if (range.start && range.end) {
        return `${formatShortDate(range.start)} - ${formatShortDate(
          range.end
        )}`;
      }
      return "Select Range";

    default:
      return "";
  }
};

const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  selectedPeriod,
  onNavigate,
  dateRange,
}) => {
  const showArrows = selectedPeriod !== "Period";
  const { titlecolor } = useThemeColors();

  return (
    <View style={styles.navigatorContainer}>
      {showArrows ? (
        <TouchableOpacity
          onPress={() => onNavigate("previous")}
          style={styles.navArrow}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color={titlecolor}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.navArrow} />
      )}

      <AppText style={[styles.currentDateText, { color: titlecolor }]}>
        {formatDisplayDate(currentDate, selectedPeriod, dateRange)}
      </AppText>

      {showArrows ? (
        <TouchableOpacity
          onPress={() => onNavigate("next")}
          style={styles.navArrow}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={30}
            color={titlecolor}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.navArrow} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navigatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 5,
  },
  navArrow: {
    padding: 5,
    width: 35,
  },
  currentDateText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
});

export default DateNavigator;
