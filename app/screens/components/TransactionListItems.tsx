import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { Transaction } from "../../../utilities/storage";

interface TransactionListItemProps {
  item: Transaction;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({ item }) => {
  const isIncome = item.activeTab === "Income";
  const amountColor = isIncome ? colors.secondary : colors.danger;
  const sign = isIncome ? "+" : "-";

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionDetails}>
        <AppText style={styles.categoryText}>{item.category}</AppText>
        <AppText style={styles.accountText}>{item.account}</AppText>
      </View>
      <AppText style={[styles.amountText, { color: amountColor }]}>
        {`${sign}${parseFloat(item.amount).toFixed(2)}`}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
  },
  transactionDetails: {
    flexDirection: "row",
  },
  categoryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  accountText: {
    color: colors.light,
    fontSize: 14,
    marginTop: 4,
    marginLeft: 20,
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TransactionListItem;
