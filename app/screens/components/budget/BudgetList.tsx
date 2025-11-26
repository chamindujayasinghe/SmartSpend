import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { DateRange } from "./BudgetAddScreen";
import { getTransactions, Transaction } from "../../../../utilities/storage";
import { useThemeColors } from "../../../../config/theme/colorMode";

interface BudgetListsProps {
  selectedTab: "incomes" | "expenses";
  selectedPeriod: string;
  dateRange: DateRange;
  currentDate: Date;
}

const getWeekRange = (date: Date) => {
  const current = new Date(date);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

const BudgetLists: React.FC<BudgetListsProps> = ({
  selectedTab,
  selectedPeriod,
  dateRange,
  currentDate,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { tabBarColor, titlecolor } = useThemeColors();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);

      const allTransactions = await getTransactions();
      const now = new Date(currentDate);

      const filtered = allTransactions.filter((tx) => {
        const normalize = (v: string) => v.toLowerCase().replace(/s$/, "");
        if (normalize(selectedTab) !== normalize(tx.activeTab)) return false;

        const txDate = new Date(tx.date);

        switch (selectedPeriod) {
          case "Daily":
            return txDate.toDateString() === now.toDateString();

          case "Weekly": {
            const { monday, sunday } = getWeekRange(now);
            return txDate >= monday && txDate <= sunday;
          }

          case "Monthly":
            return (
              txDate.getFullYear() === now.getFullYear() &&
              txDate.getMonth() === now.getMonth()
            );

          case "Annually":
            return txDate.getFullYear() === now.getFullYear();

          case "Period":
            if (!dateRange.start || !dateRange.end) return false;
            const startDate = new Date(dateRange.start);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            return txDate >= startDate && txDate <= endDate;

          default:
            return true;
        }
      });

      setTransactions(filtered);
      setLoading(false);
    };

    fetchTransactions();
  }, [selectedTab, selectedPeriod, dateRange, currentDate]);

  if (loading) {
    return <ActivityIndicator size="large" color={colors.secondary} />;
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.listItem, { borderColor: tabBarColor }]}>
          <AppText style={[styles.amountText, { color: titlecolor }]}>
            {parseFloat(item.amount).toFixed(2)}
          </AppText>
          <AppText style={[styles.categoryText, { color: titlecolor }]}>
            {item.category}
          </AppText>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      contentContainerStyle={{ paddingVertical: 10 }}
    />
  );
};

const styles = StyleSheet.create({
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  amountText: {
    fontWeight: "600",
    fontSize: 16,
  },
  categoryText: {
    fontWeight: "500",
    fontSize: 15,
  },
});

export default BudgetLists;
