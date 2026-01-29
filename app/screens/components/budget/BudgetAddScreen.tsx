import React, { useCallback, useEffect, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { getTransactions } from "../../../../utilities/storage";
import { getAllBudgets } from "../../../../utilities/BudgetStorage";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

type EnhancedBudgetItem = {
  category: string;
  type: "Income" | "Expense";
  items: any[];
  dateContext: {
    currentDate: Date;
    selectedPeriod: string;
    dateRange: { start: Date | null; end: Date | null };
  };
};

const BudgetAddScreen: React.FC = () => {
  const { titlecolor, secondarycolormode } = useThemeColors();

  const [refreshKey, setRefreshKey] = useState(0);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses">(
    "expenses",
  );
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Monthly");

  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });

  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((prev) => prev + 1);
    }, []),
  );

  const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

  // 🔹 Budget modal
  const [selectedBudgetItem, setSelectedBudgetItem] =
    useState<EnhancedBudgetItem | null>(null);

  const normalize = (v: string) => v.toLowerCase().replace(/s$/, "");

  const createDateSpecificPeriod = (
    period: string,
    currentDate: Date,
    dateRange?: { start: Date | null; end: Date | null },
  ) => {
    if (period === "Monthly") {
      return `Monthly-${currentDate.getFullYear()}-${
        currentDate.getMonth() + 1
      }`;
    }
    if (period === "Annually") {
      return `Annually-${currentDate.getFullYear()}`;
    }
    return period;
  };

  useEffect(() => {
    const calculateHeaderTotals = async () => {
      const budgets = await getAllBudgets();
      const transactions = await getTransactions();

      const type = selectedTab === "incomes" ? "Income" : "Expense";

      const dateSpecificPeriod = createDateSpecificPeriod(
        selectedPeriod,
        currentDate,
        dateRange,
      );

      // 🔹 1. Filter transactions for selected period
      const filteredTransactions = transactions.filter((tx) => {
        if (normalize(tx.activeTab) !== normalize(selectedTab)) return false;

        const d = new Date(tx.date);

        switch (selectedPeriod) {
          case "Monthly":
            return (
              d.getMonth() === currentDate.getMonth() &&
              d.getFullYear() === currentDate.getFullYear()
            );
          case "Annually":
            return d.getFullYear() === currentDate.getFullYear();
          case "Period":
            if (!dateRange.start || !dateRange.end) return false;
            return d >= dateRange.start && d <= dateRange.end;
          default:
            return true;
        }
      });

      // 🔹 2. Categories that actually have transactions
      const activeCategories = new Set(
        filteredTransactions.map((tx) => tx.category),
      );

      // 🔹 3. Resolve budgets (generic + date-specific override)
      const resolvedBudgetMap = new Map<string, number>();

      // generic budgets
      budgets.forEach((b) => {
        if (
          b.type === type &&
          b.period === selectedPeriod &&
          b.budget > 0 &&
          activeCategories.has(b.category)
        ) {
          resolvedBudgetMap.set(b.category, Number(b.budget));
        }
      });

      // date-specific override
      budgets.forEach((b) => {
        if (
          b.type === type &&
          b.period === dateSpecificPeriod &&
          b.budget > 0 &&
          activeCategories.has(b.category)
        ) {
          resolvedBudgetMap.set(b.category, Number(b.budget));
        }
      });

      const totalBudget = Array.from(resolvedBudgetMap.values()).reduce(
        (sum, v) => sum + v,
        0,
      );

      const totalSpent = filteredTransactions
        .filter((tx) => resolvedBudgetMap.has(tx.category))
        .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

      setTotalBudget(totalBudget);
      setTotalSpent(totalSpent);

      setTotalBudget(totalBudget);
      setTotalSpent(totalSpent);
    };

    calculateHeaderTotals();
  }, [selectedTab, selectedPeriod, currentDate, dateRange, refreshKey]);

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
  const handleBudgetPress = (item: EnhancedBudgetItem) => {
    setSelectedBudgetItem(item);
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
      <BudgetHeader
        selectedPeriod={selectedPeriod}
        selectedTab={selectedTab}
        totalBudget={totalBudget}
        totalSpent={totalSpent}
      />

      {/* LIST */}
      <BudgetLists
        selectedTab={selectedTab}
        selectedPeriod={selectedPeriod}
        dateRange={dateRange}
        currentDate={currentDate}
        onItemPress={handleBudgetPress}
        refreshKey={refreshKey}
      />

      {/* DATE RANGE MODAL */}
      <DateRangePickerModal
        isVisible={isRangePickerVisible}
        onClose={() => setIsRangePickerVisible(false)}
        onConfirm={handleConfirmRange}
        startDate={dateRange.start || new Date()}
        endDate={dateRange.end || new Date()}
      />

      <BudgetInputModal
        isVisible={!!selectedBudgetItem}
        item={
          selectedBudgetItem
            ? {
                category: selectedBudgetItem.category,
                type: selectedBudgetItem.type,
                budget: selectedBudgetItem.items.length >= 0 ? 0 : 0,
                dateContext: selectedBudgetItem.dateContext,
              }
            : null
        }
        period={selectedPeriod}
        onClose={() => setSelectedBudgetItem(null)}
        onSave={() => {
          setRefreshKey((prev) => prev + 1);
          setSelectedBudgetItem(null);
        }}
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
