import React from "react";
import { View, StyleSheet } from "react-native";
import { PIE_CHART_COLORS } from "../../../../config/piechartcolors";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { useTheme } from "../../../../config/theme/ThemeProvider";

export interface AggregatedCategory {
  category: string;
  totalAmount: number;
  percentage?: number;
}

interface CategorySummaryListItemProps {
  item: AggregatedCategory;
  type: "incomes" | "expenses";
  index: number;
  totalAmount?: number;
}

const CategorySummaryListItem: React.FC<CategorySummaryListItemProps> = ({
  item,
  type,
  index,
  totalAmount,
}) => {
  const { isLightMode } = useTheme();
  const dotColor = PIE_CHART_COLORS[index % PIE_CHART_COLORS.length];
  const amountColor = dotColor;

  const percentage =
    item.percentage ||
    (totalAmount ? (item.totalAmount / totalAmount) * 100 : 0);

  return (
    <View
      style={[
        styles.row,
        { borderBottomColor: isLightMode ? colors.darkbrown : colors.dark },
      ]}
    >
      <View style={styles.categoryContainer}>
        <View style={[styles.colorDot, { backgroundColor: dotColor }]} />
        <AppText
          style={[
            styles.categoryText,
            { color: isLightMode ? colors.brown : colors.white },
          ]}
        >
          {item.category}
        </AppText>
        <AppText
          style={[
            styles.percentageText,
            { color: isLightMode ? colors.darkbrown : colors.light },
          ]}
        >
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
    fontSize: 17,
    fontWeight: "600",
    marginRight: 10,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "400",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CategorySummaryListItem;
