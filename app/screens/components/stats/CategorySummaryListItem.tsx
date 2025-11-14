import React from "react";
import { View, StyleSheet } from "react-native";
import { PIE_CHART_COLORS } from "../../../../config/piechartcolors";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";

export interface AggregatedCategory {
  category: string;
  totalAmount: number;
  percentage?: number; // Add optional percentage prop
}

interface CategorySummaryListItemProps {
  item: AggregatedCategory;
  type: "incomes" | "expenses";
  index: number;
  totalAmount?: number; // Add totalAmount prop to calculate percentage
}

const CategorySummaryListItem: React.FC<CategorySummaryListItemProps> = ({
  item,
  type,
  index,
  totalAmount,
}) => {
  const dotColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length];
  const amountColor = dotColor;

  // Calculate percentage if not provided
  const percentage =
    item.percentage ||
    (totalAmount ? (item.totalAmount / totalAmount) * 100 : 0);

  return (
    <View style={styles.row}>
      <View style={styles.categoryContainer}>
        <View style={[styles.colorDot, { backgroundColor: dotColor }]} />
        <AppText style={styles.categoryText}>{item.category}</AppText>
        <AppText style={styles.percentageText}>
          ({percentage.toFixed(1)}%)
        </AppText>
      </View>
      <AppText style={[styles.amountText, { color: amountColor }]}>
        {item.totalAmount.toFixed(2)}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  percentageText: {
    color: colors.light,
    fontSize: 14,
    fontWeight: "400",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default CategorySummaryListItem;
