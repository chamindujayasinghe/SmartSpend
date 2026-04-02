import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { User } from "@supabase/supabase-js";
import { useAppScreenLogic } from "../../Hooks/useAppScreen";
import { useThemeColors } from "../../config/theme/colorMode";
import { getTransactions, Transaction } from "../../utilities/storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCurrency } from "../../config/currencyProvider";
import { convertToCurrency, getExchangeRates } from "../../Hooks/Currency";

interface HomeScreenProps {
  user: User;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const { fullName } = useAppScreenLogic(user);
  const { colormode1 } = useThemeColors();

  // 1. Pull the live global currency directly from your Context
  const { currency: globalCurrency } = useCurrency();

  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    [],
  );
  const [exchangeRates, setExchangeRates] = useState<any>(null); // State to hold API rates

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        // Fetch Transactions
        const allTransactions = await getTransactions();
        const sortedTransactions = allTransactions.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setRecentTransactions(sortedTransactions.slice(0, 5));

        // Fetch Exchange Rates for conversion
        const rates = await getExchangeRates();
        setExchangeRates(rates);
      };

      fetchData();
    }, []),
  );

  // Helper function to render each transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    // 2. Convert the amount from the saved transaction currency to the new global currency
    const convertedAmount = convertToCurrency(
      parseFloat(item.amount), // Convert string to number for math
      item.currency, // The currency it was originally saved in
      globalCurrency, // The user's current global setting
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
                item.activeTab === "Income" ? colors.secondary : colors.danger,
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
      {/* Date Box */}
      <View style={[styles.dateBox, { borderColor: colormode1 }]}>
        <AppText style={[styles.dateText, { color: colormode1 }]}>
          {todayDate}
        </AppText>
      </View>

      {/* Recent Transactions Section */}
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
  transactionDescription: {
    fontSize: 14,
    color: colors.light,
    marginTop: 4,
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
