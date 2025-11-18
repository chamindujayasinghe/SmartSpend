import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { Transaction } from "../../../utilities/storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import { useThemeColors } from "../../../config/theme/colorMode";

type NavigationProps = NativeStackNavigationProp<
  AppStackParamList,
  "TransactionForm"
>;

interface TransactionListItemProps {
  item: Transaction;
  onItemPress?: () => void;
}

const TransactionListItem: React.FC<TransactionListItemProps> = ({
  item,
  onItemPress,
}) => {
  const isIncome = item.activeTab === "Income";
  const amountColor = isIncome ? colors.secondary : colors.danger;
  const sign = isIncome ? "+" : "-";
  const navigation = useNavigation<NavigationProps>();

  const { titlecolor, secondarycolormode, textinputcolor } = useThemeColors();

  const handlePress = () => {
    if (onItemPress) {
      onItemPress();
    }

    navigation.navigate("TransactionForm", {
      dateString: new Date(item.date).toISOString(),
      transaction: item,
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View
        style={[styles.transactionRow, { borderBottomColor: textinputcolor }]}
      >
        <View style={styles.transactionDetails}>
          <AppText style={[styles.categoryText, { color: titlecolor }]}>
            {item.category}
          </AppText>
          <AppText style={[styles.accountText, { color: secondarycolormode }]}>
            {item.account}
          </AppText>
        </View>
        <AppText style={[styles.amountText, { color: amountColor }]}>
          {`${sign}${parseFloat(item.amount).toFixed(2)}`}
        </AppText>
      </View>
    </TouchableOpacity>
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
