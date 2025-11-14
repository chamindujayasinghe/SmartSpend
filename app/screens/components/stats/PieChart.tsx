import React from "react";
import { View, StyleSheet } from "react-native";
import { G, Path, Svg } from "react-native-svg";
import AppText from "../../../components/AppText";
import { AggregatedCategory } from "./CategorySummaryListItem";
import colors from "../../../../config/colors";
import { PIE_CHART_COLORS } from "../../../../config/piechartcolors";

interface PieChartComponentProps {
  data: AggregatedCategory[];
  title?: string;
  height?: number;
  type: "incomes" | "expenses";
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({
  data,
  title,
  height = 250,
  type,
}) => {
  const filteredData = data.filter((item) => item.totalAmount > 0);
  const total = filteredData.reduce((sum, item) => sum + item.totalAmount, 0);
  const chartSize = height - 50;
  const center = chartSize / 2;
  const radius = center - 10;

  let startAngle = 0;

  if (filteredData.length === 0) {
    return (
      <View style={styles.container}>
        {title && <AppText style={styles.title}>{title}</AppText>}
        <View style={[styles.chartContainer, { height }]}>
          <AppText style={styles.noDataText}>
            No data available for chart
          </AppText>
        </View>
      </View>
    );
  }

  const segments = filteredData.map((item, index) => {
    const percentage = item.totalAmount / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

    // Large arc flag
    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    const segment = {
      path: pathData,
      color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
      percentage,
      startAngle,
      endAngle,
    };

    startAngle = endAngle;
    return segment;
  });

  return (
    <View style={styles.container}>
      {title && <AppText style={styles.title}>{title}</AppText>}
      <View style={[styles.chartContainer, { height }]}>
        <Svg width={chartSize} height={chartSize}>
          <G>
            {segments.map((segment, index) => (
              <Path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke={colors.white}
                strokeWidth={1}
              />
            ))}
          </G>
        </Svg>
      </View>
      {/* Legends removed from here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 10,
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  noDataText: {
    color: colors.light,
    fontSize: 16,
    textAlign: "center",
  },
});

export default PieChartComponent;
