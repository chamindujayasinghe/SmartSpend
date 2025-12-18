import React, { useEffect, useState } from "react";
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

interface Props {
  selectedTab: "incomes" | "expenses";
  selectedPeriod: string;
  currentDate: Date;
  dateRange: { start: Date | null; end: Date | null };
  onItemPress: (item: any) => void;
}

interface GroupedItem {
  category: string;
  total: number;
  items: any[];
}

const BudgetLists: React.FC<Props> = ({
  selectedTab,
  selectedPeriod,
  currentDate,
  dateRange,
  onItemPress,
}) => {
  const { colormode2, secondarycolormode, textinputcolor } = useThemeColors();

  const [data, setData] = useState<GroupedItem[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedTab, selectedPeriod, currentDate, dateRange]);

  const normalize = (v: string) => v.toLowerCase().replace(/s$/, "");

  const loadData = async () => {
    setLoading(true);
    const txs = await getTransactions();
    const allBudgets = await getAllBudgets();
    setBudgets(allBudgets);

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
        acc[tx.category].total += Number(tx.amount);
        acc[tx.category].items.push(tx);
        return acc;
      }, {})
    ) as GroupedItem[];

    // --- START SORTING LOGIC ---
    const type = selectedTab === "incomes" ? "Income" : "Expense";

    const sortedData = grouped.sort((a, b) => {
      const hasBudgetA = allBudgets.some(
        (bug) =>
          bug.category === a.category &&
          bug.type === type &&
          bug.period === selectedPeriod &&
          bug.budget > 0
      );
      const hasBudgetB = allBudgets.some(
        (bug) =>
          bug.category === b.category &&
          bug.type === type &&
          bug.period === selectedPeriod &&
          bug.budget > 0
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
    return budgets.find(
      (b: any) =>
        b.category === category &&
        b.type === type &&
        b.period === selectedPeriod
    );
  };

  const renderItem = ({ item }: { item: GroupedItem }) => {
    const budgetEntry = getBudget(item.category);
    const spent = item.total;

    if (!budgetEntry || !budgetEntry.budget || budgetEntry.budget === 0) {
      if (spent === 0) return null;

      return (
        <TouchableOpacity
          onPress={() => onItemPress(item.items[0])}
          style={[styles.simpleCard, { backgroundColor: secondarycolormode }]}
        >
          <AppText style={[styles.category, { color: colormode2 }]}>
            {item.category}
          </AppText>
          <AppText style={[styles.amountText, { color: colormode2 }]}>
            {spent.toFixed(2)}
          </AppText>
        </TouchableOpacity>
      );
    }

    const budget = budgetEntry.budget;
    const remaining = budget - spent;
    const isExpense = selectedTab === "expenses";
    const percent = Math.min((spent / budget) * 100, 100);
    return (
      <TouchableOpacity
        onPress={() => onItemPress(item.items[0])}
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
              {budget.toFixed(2)}
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
                  <AppText style={styles.amountRowtxt}>Expense</AppText>
                ) : (
                  <AppText>Income</AppText>
                )}
                <AppText style={[styles.amountText, { color: colormode2 }]}>
                  {spent.toFixed(2)}
                </AppText>
              </View>
              <View>
                <AppText style={styles.amountRowtxt}>Remaining</AppText>
                <AppText
                  style={[
                    styles.amountText,
                    {
                      color:
                        item.total > budget ? colors.error : colors.secondary,
                    },
                  ]}
                >
                  {remaining.toFixed(2)}
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
  },
  right: { flex: 2 },
  category: {
    fontSize: 16,
    fontWeight: "bold",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBg: {
    height: 26,
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
