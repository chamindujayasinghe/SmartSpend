import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { User } from "@supabase/supabase-js";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import { useThemeColors } from "../../config/theme/colorMode";
import { getTransactions, Transaction } from "../../utilities/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCurrency } from "../../config/currencyProvider";
import { convertToCurrency, getExchangeRates } from "../../Hooks/Currency";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../../lib/Supabase-client-config"; // Make sure this path is correct!

interface HomeScreenProps {
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const { fullName } = useAppScreenLogic(user);
  const { colormode1, secondarycolormode } = useThemeColors();
  const { currency: globalCurrency } = useCurrency();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [exchangeRates, setExchangeRates] = useState<any>(null);

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const allTransactions = await getTransactions();
        const rates = await getExchangeRates();
        setExchangeRates(rates);

        const sortedTransactions = [...allTransactions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setRecentTransactions(sortedTransactions.slice(0, 5));

        await checkAndFetchMonthlyInsight(allTransactions, rates);
      };

      fetchData();
    }, [globalCurrency]),
  );

  const getWeeklyBoundaries = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToThisMonday = now.getDate() - day + (day === 0 ? -6 : 1);

    const thisMonday = new Date(now.setDate(diffToThisMonday));
    thisMonday.setHours(0, 0, 0, 0);

    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(lastMonday.getDate() - 7);

    return { thisMonday, lastMonday };
  };

  const checkAndFetchMonthlyInsight = async (
    transactions: Transaction[],
    rates: any,
  ) => {
    try {
      const now = new Date();

      // 1. Check if there are ANY transactions for the current month
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const hasCurrentMonthData = transactions.some((tx) => {
        const d = new Date(tx.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      if (!hasCurrentMonthData) {
        setAiInsight("Add expenses to get AI insight");
        return;
      }

      // 2. Identify the "Monday" of this week to use as a cache key
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const thisMonday = new Date(now.setDate(diff))
        .toISOString()
        .split("T")[0];

      const savedWeek = await AsyncStorage.getItem("@last_insight_monday");
      const savedText = await AsyncStorage.getItem("@weekly_ai_insight");

      // If it's still the same week, use cached insight
      if (savedWeek === thisMonday && savedText) {
        setAiInsight(savedText);
        return;
      }

      // 3. Prepare data for the last 2 months
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      const currentMonthExpenses: Record<string, number> = {};
      const lastMonthExpenses: Record<string, number> = {};

      transactions.forEach((tx) => {
        if (tx.activeTab !== "Expense") return;
        const txDate = new Date(tx.date);
        const amt = convertToCurrency(
          parseFloat(tx.amount),
          tx.currency,
          globalCurrency,
          rates,
        );

        if (
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        ) {
          currentMonthExpenses[tx.category] =
            (currentMonthExpenses[tx.category] || 0) + amt;
        } else if (
          txDate.getMonth() === prevMonth &&
          txDate.getFullYear() === prevMonthYear
        ) {
          lastMonthExpenses[tx.category] =
            (lastMonthExpenses[tx.category] || 0) + amt;
        }
      });

      setIsGeneratingInsight(true);

      const { data, error } = await supabase.functions.invoke(
        "generate-insight",
        {
          body: {
            globalCurrency,
            lastMonthExpenses,
            currentMonthExpenses,
          },
        },
      );

      if (data?.insight) {
        await AsyncStorage.setItem("@last_insight_monday", thisMonday);
        await AsyncStorage.setItem("@weekly_ai_insight", data.insight);
        setAiInsight(data.insight);
      }
    } catch (error) {
      setAiInsight("Keep tracking to see your progress!");
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleForceRefresh = async () => {
    await AsyncStorage.removeItem("@last_insight_week");
    await AsyncStorage.removeItem("@last_insight_monday");
    await AsyncStorage.removeItem("@weekly_ai_insight");

    const allTransactions = await getTransactions();
    const rates = await getExchangeRates();

    await checkAndFetchMonthlyInsight(allTransactions, rates);
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const convertedAmount = convertToCurrency(
      parseFloat(item.amount),
      item.currency,
      globalCurrency,
      exchangeRates,
    );

    return (
      <View style={[styles.transactionCard, { borderColor: colormode1 }]}>
        <AppText style={[styles.transactionCategory, { color: colormode1 }]}>
          {item.category}
        </AppText>
        <AppText
          style={[
            styles.transactionAmount,
            {
              color:
                item.activeTab === "Income" ? colors.secondary : colors.error,
            },
          ]}
        >
          {item.activeTab === "Income" ? "+" : "-"}
          {globalCurrency}{" "}
          {convertedAmount ? convertedAmount.toFixed(2) : item.amount}
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dateBox, { borderColor: colormode1 }]}>
        <AppText style={[styles.dateText, { color: colormode1 }]}>
          {todayDate}
        </AppText>
      </View>

      <View
        style={[
          styles.insightContainer,
          {
            backgroundColor: "rgba(255,255,255,0.05)",
            borderColor: colormode1,
          },
        ]}
      >
        <View style={styles.insightHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialCommunityIcons
              name="robot-outline"
              size={24}
              color={colors.secondary}
            />
            <AppText style={[styles.insightTitle, { color: colormode1 }]}>
              Weekly Gamified Insight
            </AppText>
          </View>

          <TouchableOpacity
            onPress={handleForceRefresh}
            disabled={isGeneratingInsight}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={22}
              color={isGeneratingInsight ? colors.light : colors.secondary}
            />
          </TouchableOpacity>
        </View>

        {isGeneratingInsight ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.secondary} />
            <AppText
              style={[styles.loadingText, { color: secondarycolormode }]}
            >
              Analyzing this week's spending...
            </AppText>
          </View>
        ) : (
          <AppText style={[styles.insightText, { color: secondarycolormode }]}>
            {aiInsight ||
              "Add more transactions to get personalized financial advice next week!"}
          </AppText>
        )}
      </View>

      <View style={styles.transactionsContainer}>
        <AppText style={[styles.sectionTitle, { color: colormode1 }]}>
          Recent Transactions
        </AppText>

        {recentTransactions.length > 0 ? (
          <FlatList
            data={recentTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <AppText style={styles.emptyText}>No recent transactions.</AppText>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    width: "100%",
    backgroundColor: "transparent",
  },
  dateBox: {
    backgroundColor: "transparent",
    paddingHorizontal: 25,
    marginTop: 10,
    paddingBottom: 5,
  },
  dateText: {
    fontSize: 20,
    fontWeight: "600",
  },
  insightContainer: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 25,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    fontStyle: "italic",
  },
  transactionsContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 30,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  listContainer: {
    paddingBottom: 20,
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderWidth: 0.2,
    borderBottomWidth: 1,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: "bold",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: colors.light,
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default HomeScreen;
