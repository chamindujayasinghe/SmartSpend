import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { Period } from "./PeriodSelector"; // Import the Period type
import { DateRange } from "../StatsScreen"; // Import DateRange type

interface DateNavigatorProps {
  currentDate: Date;
  selectedPeriod: Period;
  onNavigate: (direction: "previous" | "next") => void;
  dateRange: DateRange; // Add dateRange prop
}

// Helper for formatting short dates
const formatShortDate = (date: Date | null) => {
  if (!date) return "";
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric", // Keep year for clarity
  });
};

const formatDisplayDate = (date: Date, period: Period, range: DateRange) => {
  switch (period) {
    case "Daily":
      return date.toLocaleDateString("default", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    case "Annually":
      return date.getFullYear().toString();

    case "Period":
      // Format the custom range
      if (range.start && range.end) {
        return `${formatShortDate(range.start)} - ${formatShortDate(
          range.end
        )}`;
      }
      return "Select Range"; // Fallback

    default:
    case "Monthly":
      return date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
  }
};

const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  selectedPeriod,
  onNavigate,
  dateRange, // Destructure dateRange
}) => {
  // Hide arrows if "Period" is selected
  const showArrows = selectedPeriod !== "Period";

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
            color={colors.white}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.navArrow} /> // Placeholder for spacing
      )}

      <AppText style={styles.currentDateText}>
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
            color={colors.white}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.navArrow} /> // Placeholder for spacing
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
    width: 35, // Give arrows a fixed width to maintain center alignment
  },
  currentDateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    flex: 1, // Allow text to take up remaining space
  },
});

export default DateNavigator;
