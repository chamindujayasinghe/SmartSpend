import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PeriodSelector, { Period } from "../PeriodSelector";
import AppText from "../../../components/AppText";
import DateNavigator from "../DateNavigator";
import DateRangePickerModal from "../DateRangePickerModal";
import colors from "../../../../config/colors";
import { useThemeColors } from "../../../../config/theme/colorMode";
import BudgetHeader from "./BudgetHeader";
import BudgetLists from "./BudgetList";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

const BudgetAddScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses">(
    "incomes"
  );
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Monthly");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

  const handleNavigate = (direction: "previous" | "next") => {
    if (selectedPeriod === "Period") return;

    const newDate = new Date(currentDate);
    const amount = direction === "previous" ? -1 : 1;
    switch (selectedPeriod) {
      case "Daily":
        newDate.setDate(newDate.getDate() + amount);
        break;
      case "Weekly":
        newDate.setDate(newDate.getDate() + amount * 7);
        break;
      case "Annually":
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
      default:
      case "Monthly":
        newDate.setMonth(newDate.getMonth() + amount);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleConfirmRange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    setSelectedPeriod("Period");
    setCurrentDate(range.start);
    setIsRangePickerVisible(false);
  };
  const handleResetDate = () => {
    setCurrentDate(new Date());
    setDateRange({ start: null, end: null });
    setSelectedPeriod("Monthly");
  };
  const { titlecolor, textinputcolor, secondarycolormode } = useThemeColors();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={[styles.headerTitle, { color: titlecolor }]}>
          Budget
        </AppText>
        <PeriodSelector
          onReset={handleResetDate}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onShowRangePicker={() => setIsRangePickerVisible(true)}
        />
      </View>

      <DateNavigator
        currentDate={currentDate}
        selectedPeriod={selectedPeriod}
        onNavigate={handleNavigate}
        dateRange={dateRange}
      />

      <View
        style={[
          styles.tabsContainer,
          { borderBottomColor: secondarycolormode },
        ]}
      >
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("incomes")}
        >
          <AppText
            style={[
              styles.tabText,
              { color: secondarycolormode },
              selectedTab === "incomes" && styles.activeTabText,
            ]}
          >
            Incomes
          </AppText>
          {selectedTab === "incomes" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("expenses")}
        >
          <AppText
            style={[
              styles.tabText,
              { color: secondarycolormode },
              selectedTab === "expenses" && styles.activeTabText,
            ]}
          >
            Expenses
          </AppText>
          {selectedTab === "expenses" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      <BudgetHeader selectedPeriod={selectedPeriod} />

      <BudgetLists
        selectedTab={selectedTab}
        selectedPeriod={selectedPeriod}
        dateRange={dateRange}
        currentDate={currentDate}
      />

      <DateRangePickerModal
        isVisible={isRangePickerVisible}
        onClose={() => setIsRangePickerVisible(false)}
        onConfirm={handleConfirmRange}
        startDate={dateRange.start || new Date()}
        endDate={dateRange.end || new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 18,
    fontWeight: "600",
  },
  activeTabText: {
    color: colors.secondary,
  },
  activeTabIndicator: {
    height: 3,
    width: "70%",
    backgroundColor: colors.secondary,
    position: "absolute",
    bottom: 0,
    borderRadius: 1.5,
  },
});

export default BudgetAddScreen;
