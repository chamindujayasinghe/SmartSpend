import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PeriodSelector, { Period } from "../PeriodSelector";
import AppText from "../../../components/AppText";
import DateNavigator from "../DateNavigator";
import DateRangePickerModal from "../DateRangePickerModal";
import colors from "../../../../config/colors";

export type DateRange = {
  start: Date | null;
  end: Date | null;
};

const BudgetAddScreen: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTab, setSelectedTab] = useState<"incomes" | "expenses">(
    "incomes"
  );
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("Monthly");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [isRangePickerVisible, setIsRangePickerVisible] = useState(false);

  const handleNavigate = (direction: "previous" | "next") => {
    if (selectedPeriod === "Period") return;

    const newDate = new Date(currentDate);
    const amount = direction === "previous" ? -1 : 1;
    switch (selectedPeriod) {
      case "Daily":
        newDate.setDate(newDate.getDate() + amount);
        break;
      case "Annually":
        newDate.setFullYear(newDate.getFullYear() + amount);
        break;
      default:
      case "Monthly":
        newDate.setMonth(newDate.getMonth() + amount);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleConfirmRange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    setSelectedPeriod("Period");
    setCurrentDate(range.start);
    setIsRangePickerVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Budget</AppText>
        <PeriodSelector
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onShowRangePicker={() => setIsRangePickerVisible(true)}
        />
      </View>

      <DateNavigator
        currentDate={currentDate}
        selectedPeriod={selectedPeriod}
        onNavigate={handleNavigate}
        dateRange={dateRange}
      />

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("incomes")}
        >
          <AppText
            style={[
              styles.tabText,
              selectedTab === "incomes" && styles.activeTabText,
            ]}
          >
            Incomes
          </AppText>
          {selectedTab === "incomes" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setSelectedTab("expenses")}
        >
          <AppText
            style={[
              styles.tabText,
              selectedTab === "expenses" && styles.activeTabText,
            ]}
          >
            Expenses
          </AppText>
          {selectedTab === "expenses" && (
            <View style={styles.activeTabIndicator} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentArea}>
        {selectedTab === "incomes" && (
          <AppText style={styles.contentText}>Incomes Content Here</AppText>
        )}
        {selectedTab === "expenses" && (
          <AppText style={styles.contentText}>Expenses Content Here</AppText>
        )}
      </View>

      <DateRangePickerModal
        isVisible={isRangePickerVisible}
        onClose={() => setIsRangePickerVisible(false)}
        onConfirm={handleConfirmRange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.white,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 18,
    color: colors.light,
    fontWeight: "600",
  },
  activeTabText: {
    color: colors.secondary,
  },
  activeTabIndicator: {
    height: 3,
    width: "70%",
    backgroundColor: colors.secondary,
    position: "absolute",
    bottom: 0,
    borderRadius: 1.5,
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentText: {
    color: colors.white,
    fontSize: 18,
  },
});

export default BudgetAddScreen;
