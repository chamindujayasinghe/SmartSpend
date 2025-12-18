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
import BudgetInputModal from "./BudgetInputModal";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

const BudgetAddScreen: React.FC = () => {
  const { titlecolor, secondarycolormode } = useThemeColors();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses">(
    "expenses"
  );
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Monthly");

  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

  // 🔹 Budget modal
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<{
    category: string;
    type: "Income" | "Expense";
  } | null>(null);

  // 🔹 Date navigation
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
      case "Monthly":
      default:
        newDate.setMonth(newDate.getMonth() + amount);
        break;
    }

    setCurrentDate(newDate);
  };

  // 🔹 Period range confirm
  const handleConfirmRange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    setSelectedPeriod("Period");
    setCurrentDate(range.start);
    setIsRangePickerVisible(false);
  };

  // 🔹 Reset
  const handleResetDate = () => {
    setCurrentDate(new Date());
    setDateRange({ start: null, end: null });
    setSelectedPeriod("Monthly");
  };

  // 🔹 When user taps a category
  const handleBudgetPress = (item: { category: string }) => {
    setSelectedBudgetItem({
      category: item.category,
      type: selectedTab === "incomes" ? "Income" : "Expense",
    });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
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

      {/* DATE NAVIGATOR */}
      <DateNavigator
        currentDate={currentDate}
        selectedPeriod={selectedPeriod}
        onNavigate={handleNavigate}
        dateRange={dateRange}
      />

      {/* TABS */}
      <View
        style={[
          styles.tabsContainer,
          { borderBottomColor: secondarycolormode },
        ]}
      >
        {["incomes", "expenses"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={styles.tabButton}
            onPress={() => setSelectedTab(tab as any)}
          >
            <AppText
              style={[
                styles.tabText,
                { color: secondarycolormode },
                selectedTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "incomes" ? "Incomes" : "Expenses"}
            </AppText>

            {selectedTab === tab && <View style={styles.activeTabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* SUMMARY HEADER */}
      <BudgetHeader selectedPeriod={selectedPeriod} selectedTab={selectedTab} />

      {/* LIST */}
      <BudgetLists
        selectedTab={selectedTab}
        selectedPeriod={selectedPeriod}
        dateRange={dateRange}
        currentDate={currentDate}
        onItemPress={handleBudgetPress}
      />

      {/* DATE RANGE MODAL */}
      <DateRangePickerModal
        isVisible={isRangePickerVisible}
        onClose={() => setIsRangePickerVisible(false)}
        onConfirm={handleConfirmRange}
        startDate={dateRange.start || new Date()}
        endDate={dateRange.end || new Date()}
      />

      {/* BUDGET INPUT MODAL */}
      <BudgetInputModal
        isVisible={!!selectedBudgetItem}
        item={
          selectedBudgetItem
            ? {
                category: selectedBudgetItem.category,
                type: selectedBudgetItem.type,
                budget: 0,
              }
            : null
        }
        period={selectedPeriod}
        onClose={() => setSelectedBudgetItem(null)}
        onSave={() => setSelectedBudgetItem(null)}
      />
    </View>
  );
};

export default BudgetAddScreen;

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
    borderRadius: 2,
  },
});
