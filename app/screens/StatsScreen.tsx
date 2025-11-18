import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import DateRangePickerModal from "./components/DateRangePickerModal";
import DateNavigator from "./components/DateNavigator";
import PeriodSelector, { Period } from "./components/PeriodSelector";
import { getTransactions } from "../../utilities/storage";
import PieChartComponent from "./components/stats/PieChart";
import CategorySummaryListItem, {
  AggregatedCategory,
} from "./components/stats/CategorySummaryListItem";
import { useThemeColors } from "../../config/theme/colorMode";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

const StatsScreen: React.FC = () => {
  const { titlecolor, textinputcolor, secondarycolormode } = useThemeColors();
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
  const [aggregatedData, setAggregatedData] = useState<AggregatedCategory[]>(
    []
  );
  const isFocused = useIsFocused();

  const totalAmount = aggregatedData.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );

  useEffect(() => {
    const fetchAndAggregateTransactions = async () => {
      try {
        const allTransactions = await getTransactions();
        const targetTab = selectedTab === "incomes" ? "Income" : "Expense";

        const filteredTransactions = allTransactions.filter((tx) => {
          if (tx.activeTab !== targetTab) {
            return false;
          }

          const txDate = new Date(tx.date);
          switch (selectedPeriod) {
            case "Daily":
              return txDate.toDateString() === currentDate.toDateString();
            case "Monthly":
              return (
                txDate.getMonth() === currentDate.getMonth() &&
                txDate.getFullYear() === currentDate.getFullYear()
              );
            case "Annually":
              return txDate.getFullYear() === currentDate.getFullYear();
            case "Period":
              if (!dateRange.start || !dateRange.end) return false;
              const startDate = new Date(dateRange.start);
              startDate.setHours(0, 0, 0, 0);
              const endDate = new Date(dateRange.end);
              endDate.setHours(23, 59, 59, 999);
              return txDate >= startDate && txDate <= endDate;
            default:
              return false;
          }
        });

        // 2. AGGREGATION
        const categoryMap = new Map<string, number>();

        filteredTransactions.forEach((tx) => {
          const amount = parseFloat(tx.amount);
          const currentTotal = categoryMap.get(tx.category) || 0;
          categoryMap.set(tx.category, currentTotal + amount);
        });

        // Convert the Map back into an array of objects
        const aggregatedArray = Array.from(
          categoryMap,
          ([category, totalAmount]) => ({
            category,
            totalAmount,
          })
        ).sort((a, b) => b.totalAmount - a.totalAmount);

        setAggregatedData(aggregatedArray);
      } catch (e) {
        console.error("Failed to fetch or aggregate transactions", e);
      }
    };

    if (isFocused) {
      fetchAndAggregateTransactions();
    }
  }, [isFocused, currentDate, selectedPeriod, selectedTab, dateRange]);

  const handleNavigate = (direction: "previous" | "next") => {
    if (selectedPeriod === "Period") return;
    const newDate = new Date(currentDate);
    const amount = direction === "previous" ? -1 : 1;
    switch (selectedPeriod) {
      case "Daily":
        newDate.setDate(newDate.getDate() + amount);
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

  const handleResetDate = () => {
    setCurrentDate(new Date());
    setDateRange({ start: null, end: null });
    if (selectedPeriod === "Period") {
      setSelectedPeriod("Monthly");
    }
  };

  const handleConfirmRange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    setSelectedPeriod("Period");
    setCurrentDate(range.start);
    setIsRangePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={[styles.headerTitle, { color: titlecolor }]}>
          Stats Page
        </AppText>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onReset={handleResetDate}
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
        style={[styles.tabsContainer, { borderBottomColor: textinputcolor }]}
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

      <View style={styles.contentArea}>
        {aggregatedData.length > 0 && (
          <PieChartComponent
            data={aggregatedData}
            title={`${
              selectedTab === "incomes" ? "Incomes" : "Expenses"
            } Distribution`}
            height={240}
          />
        )}

        {aggregatedData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AppText style={[styles.emptyText, { color: secondarycolormode }]}>
              No {selectedTab} found for this period.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={aggregatedData}
            keyExtractor={(item) => item.category}
            renderItem={({ item, index }) => (
              <CategorySummaryListItem
                index={index}
                item={item}
                totalAmount={totalAmount}
              />
            )}
            style={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <DateRangePickerModal
        isVisible={isRangePickerVisible}
        onClose={() => setIsRangePickerVisible(false)}
        onConfirm={handleConfirmRange}
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
    marginBottom: 10,
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
  contentArea: {
    flex: 1,
  },
  list: {
    width: "100%",
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default StatsScreen;
