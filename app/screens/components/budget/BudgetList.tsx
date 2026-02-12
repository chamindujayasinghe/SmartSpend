import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { useThemeColors } from "../../../../config/theme/colorMode";
import { getAllBudgets } from "../../../../utilities/BudgetStorage";
import { getTransactions } from "../../../../utilities/storage";
import { useFocusEffect } from "@react-navigation/native";

import { useCurrency } from "../../../../config/currencyProvider";
import {
  convertToCurrency,
  getExchangeRates,
} from "../../../../Hooks/Currency";

interface Props {
  selectedTab: "incomes" | "expenses";
  selectedPeriod: string;
  currentDate: Date;
  dateRange: { start: Date | null; end: Date | null };
  onItemPress: (item: any) => void;
  refreshKey: number;
}

interface GroupedItem {
  category: string;
  total: number;
  items: any[];
}

// ... (Helper functions createDateSpecificPeriod and getWeekNumber remain the same) ...
const createDateSpecificPeriod = (
  period: string,
  currentDate: Date,
  dateRange?: { start: Date | null; end: Date | null },
): string => {
  if (period === "Monthly") {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    return `Monthly-${year}-${month}`;
  } else if (period === "Weekly") {
    const weekNumber = getWeekNumber(currentDate);
    const year = currentDate.getFullYear();
    return `Weekly-${year}-${weekNumber}`;
  } else if (period === "Annually") {
    const year = currentDate.getFullYear();
    return `Annually-${year}`;
  } else if (period === "Daily") {
    const dateStr = currentDate.toISOString().split("T")[0];
    return `Daily-${dateStr}`;
  } else if (period === "Period" && dateRange?.start && dateRange?.end) {
    const startStr = dateRange.start.toISOString().split("T")[0];
    const endStr = dateRange.end.toISOString().split("T")[0];
    return `Period-${startStr}-${endStr}`;
  }
  return period;
};

const getWeekNumber = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return weekNo;
};

const BudgetLists: React.FC<Props> = ({
  selectedTab,
  selectedPeriod,
  currentDate,
  dateRange,
  onItemPress,
  refreshKey,
}) => {
  const { colormode2, secondarycolormode, textinputcolor } = useThemeColors();

  const { currency } = useCurrency();
  const [data, setData] = useState<GroupedItem[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. ADD STATE FOR RATES
  const [rates, setRates] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [
    selectedTab,
    selectedPeriod,
    currentDate,
    dateRange,
    refreshKey,
    currency,
  ]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedTab, selectedPeriod, currentDate, dateRange, currency]),
  );

  const normalize = (v: string) => v.toLowerCase().replace(/s$/, "");

  const loadData = async () => {
    setLoading(true);
    const [txs, allBudgets, latestRates] = await Promise.all([
      getTransactions(),
      getAllBudgets(),
      getExchangeRates(),
    ]);

    setBudgets(allBudgets);
    setRates(latestRates); // 2. SAVE RATES TO STATE

    const now = currentDate;

    const filtered = txs.filter((tx: any) => {
      if (normalize(tx.activeTab) !== normalize(selectedTab)) return false;
      const d = new Date(tx.date);

      switch (selectedPeriod) {
        case "Daily":
          return d.toDateString() === now.toDateString();
        case "Weekly": {
          const start = new Date(now);
          start.setDate(now.getDate() - now.getDay());
          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          return d >= start && d <= end;
        }
        case "Monthly":
          return (
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear()
          );
        case "Annually":
          return d.getFullYear() === now.getFullYear();
        case "Period":
          if (!dateRange.start || !dateRange.end) return false;
          return d >= dateRange.start && d <= dateRange.end;
        default:
          return true;
      }
    });

    const grouped = Object.values(
      filtered.reduce((acc: any, tx: any) => {
        if (!acc[tx.category]) {
          acc[tx.category] = { category: tx.category, total: 0, items: [] };
        }

        const rawAmount = Number(tx.amount);
        const convertedAmount = convertToCurrency(
          rawAmount,
          tx.currency,
          currency,
          latestRates,
        );

        acc[tx.category].total += convertedAmount;
        acc[tx.category].items.push(tx);
        return acc;
      }, {}),
    ) as GroupedItem[];

    const type = selectedTab === "incomes" ? "Income" : "Expense";

    const sortedData = grouped.sort((a, b) => {
      // Sorting logic remains the same...
      const dateSpecificPeriod = createDateSpecificPeriod(
        selectedPeriod,
        currentDate,
        dateRange,
      );
      const hasBudgetA = allBudgets.some(
        (bug) =>
          bug.category === a.category &&
          bug.type === type &&
          (bug.period === selectedPeriod ||
            bug.period === dateSpecificPeriod) &&
          bug.budget > 0,
      );
      const hasBudgetB = allBudgets.some(
        (bug) =>
          bug.category === b.category &&
          bug.type === type &&
          (bug.period === selectedPeriod ||
            bug.period === dateSpecificPeriod) &&
          bug.budget > 0,
      );
      if (hasBudgetA && !hasBudgetB) return -1;
      if (!hasBudgetA && hasBudgetB) return 1;
      return 0;
    });

    setData(sortedData);
    setLoading(false);
  };

  const getBudget = (category: string) => {
    const type = selectedTab === "incomes" ? "Income" : "Expense";
    const dateSpecificPeriod = createDateSpecificPeriod(
      selectedPeriod,
      currentDate,
      dateRange,
    );

    const dateSpecificBudget = budgets.find(
      (b: any) =>
        b.category === category &&
        b.type === type &&
        b.period === dateSpecificPeriod,
    );

    if (dateSpecificBudget) {
      return dateSpecificBudget;
    }

    return budgets.find(
      (b: any) =>
        b.category === category &&
        b.type === type &&
        b.period === selectedPeriod,
    );
  };

  const handleItemPress = (item: GroupedItem) => {
    // ... same as before
    const enhancedItem = {
      category: item.category,
      type:
        selectedTab === "incomes" ? ("Income" as const) : ("Expense" as const),
      items: item.items,
      dateContext: {
        currentDate,
        selectedPeriod,
        dateRange,
      },
    };
    onItemPress(enhancedItem);
  };

  const renderItem = ({ item }: { item: GroupedItem }) => {
    const budgetEntry = getBudget(item.category);
    const spent = item.total; // This is already converted in loadData

    // 3. CONVERT THE BUDGET AMOUNT
    let convertedBudget = 0;

    if (budgetEntry && budgetEntry.budget > 0) {
      convertedBudget = convertToCurrency(
        budgetEntry.budget,
        budgetEntry.currency || currency, // Use stored currency or fallback
        currency, // Target app currency
        rates, // Rates from state
      );
    }

    // Use 'convertedBudget' instead of 'budgetEntry.budget' for logic below
    if (convertedBudget === 0) {
      if (spent === 0) return null;

      return (
        <TouchableOpacity
          onPress={() => handleItemPress(item)}
          style={[styles.simpleCard, { backgroundColor: secondarycolormode }]}
        >
          <AppText style={[styles.category, { color: colormode2 }]}>
            {item.category}
          </AppText>
          <AppText style={[styles.amountText, { color: colormode2 }]}>
            {currency} {spent.toFixed(2)}
          </AppText>
        </TouchableOpacity>
      );
    }

    const budget = convertedBudget; // Use the converted value
    const remaining = budget - spent;
    const isExpense = selectedTab === "expenses";
    const percent = Math.min((spent / budget) * 100, 100);

    return (
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={[
          styles.budgetCard,
          { backgroundColor: secondarycolormode, borderColor: textinputcolor },
        ]}
      >
        <View style={styles.cardRow}>
          <View style={styles.left}>
            <AppText style={[styles.category, { color: colormode2 }]}>
              {item.category}
            </AppText>
            <AppText style={[styles.amountText, { color: colormode2 }]}>
              {currency} {budget.toFixed(2)}
            </AppText>
          </View>

          <View style={styles.right}>
            <View
              style={[styles.progressBg, { backgroundColor: textinputcolor }]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${percent}%`,
                    backgroundColor:
                      item.total > budget ? colors.danger : colors.secondary,
                  },
                ]}
              />
              <AppText style={styles.percentText}>
                {percent.toFixed(0)}%
              </AppText>
            </View>

            <View style={styles.amountRow}>
              <View>
                {isExpense ? (
                  <AppText style={[styles.amountRowtxt, { color: colormode2 }]}>
                    Expense
                  </AppText>
                ) : (
                  <AppText style={[styles.amountRowtxt, { color: colormode2 }]}>
                    Income
                  </AppText>
                )}
                <AppText style={[styles.amountText, { color: colormode2 }]}>
                  {currency} {spent.toFixed(2)}
                </AppText>
              </View>
              <View>
                <AppText style={[styles.amountRowtxt, { color: colormode2 }]}>
                  Remaining
                </AppText>
                <AppText
                  style={[
                    styles.amountText,
                    {
                      color:
                        item.total > budget ? colors.error : colors.secondary,
                    },
                  ]}
                >
                  {currency} {remaining.toFixed(2)}
                </AppText>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.secondary} />;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.category}
      renderItem={renderItem}
    />
  );
};

export default BudgetLists;

const styles = StyleSheet.create({
  simpleCard: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  budgetCard: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  left: {
    marginRight: 15,
    width: 80,
  },
  right: { flex: 1 },
  category: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBg: {
    height: 20,
    borderRadius: 15,
    overflow: "hidden",
    justifyContent: "center",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  percentText: {
    position: "absolute",
    right: 8,
    fontSize: 14,
    color: colors.white,
    fontWeight: "bold",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  amountRowtxt: {
    fontSize: 12,
  },
});
