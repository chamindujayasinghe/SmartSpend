import React from "react";
import { View, StyleSheet } from "react-native";
import { G, Path, Svg } from "react-native-svg";
import AppText from "../../../components/AppText";
import { AggregatedCategory } from "./CategorySummaryListItem";
import colors from "../../../../config/colors";
import { PIE_CHART_COLORS } from "../../../../config/piechartcolors";
import { useTheme } from "../../../../config/theme/ThemeProvider";

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
  const { isLightMode } = useTheme();
  const filteredData = data.filter((item) => item.totalAmount > 0);
  const total = filteredData.reduce((sum, item) => sum + item.totalAmount, 0);
  const chartSize = height - 50;
  const center = chartSize / 2;
  const radius = center - 10;

  let startAngle = 0;

  const segments = filteredData.map((item, index) => {
    const percentage = item.totalAmount / total;
    const angle = percentage * 360;
    const endAngle = startAngle + angle;

    if (filteredData.length === 1) {
      const pathData = `
        M ${center} ${center}
        m -${radius} 0
        a ${radius} ${radius} 0 1 0 ${radius * 2} 0
        a ${radius} ${radius} 0 1 0 -${radius * 2} 0
      `;

      const segment = {
        path: pathData,
        color: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length],
        percentage,
        startAngle: 0,
        endAngle: 360,
      };

      return segment;
    }

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startAngleRad);
    const y1 = center + radius * Math.sin(startAngleRad);
    const x2 = center + radius * Math.cos(endAngleRad);
    const y2 = center + radius * Math.sin(endAngleRad);

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
      {title && (
        <AppText
          style={[
            styles.title,
            { color: isLightMode ? colors.brown : colors.white },
          ]}
        >
          {title}
        </AppText>
      )}
      <View style={[styles.chartContainer, { height }]}>
        <Svg width={chartSize} height={chartSize}>
          <G>
            {segments.map((segment, index) => (
              <Path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke={colors.white}
                strokeWidth={0.5}
              />
            ))}
          </G>
        </Svg>
      </View>
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
