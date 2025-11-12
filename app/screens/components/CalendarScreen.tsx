import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import CalendarHeader from "./CalenderHeader";
import DayDetailsModal from "./DayDetailsModal";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";
import DayCell from "./DayCell";
import { CalendarCell } from "../../../Hooks/calenderTypes";
import { getTransactions, Transaction } from "../../../utilities/storage";

const today = new Date();

type NavigationProps = NativeStackNavigationProp<
  AppStackParamList,
  "TransactionForm"
>;

const generateCalendarGrid = (
  date: Date,
  clickedDate: Date | null,
  dailyAggregates: Map<number, { income: number; expense: number }>
): CalendarCell[] => {
  const grid: CalendarCell[] = [];
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDayOfMonth; i++) {
    grid.push({
      key: `empty-${i}`,
      day: null,
      isSunday: false,
      isToday: false,
      isClicked: false,
      fullDate: null,
      income: 0,
      expense: 0,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const isSunday = cellDate.getDay() === 0;
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const isClicked =
      clickedDate !== null &&
      day === clickedDate.getDate() &&
      month === clickedDate.getMonth() &&
      year === clickedDate.getFullYear();

    // --- GET AGGREGATE DATA FOR THIS DAY ---
    const agg = dailyAggregates.get(day) || { income: 0, expense: 0 };

    grid.push({
      key: `day-${day}`,
      day,
      isSunday,
      isToday,
      isClicked: false,
      fullDate: cellDate,
      // --- ADD INCOME/EXPENSE DATA ---
      income: agg.income,
      expense: agg.expense,
    });
  }

  const totalCells = grid.length;
  const cellsToFill = 7 - (totalCells % 7);
  if (cellsToFill < 7) {
    for (let i = 0; i < cellsToFill; i++) {
      grid.push({
        key: `empty-end-${i}`,
        day: null,
        isSunday: false,
        isToday: false,
        isClicked: false,
        fullDate: null,
        income: 0,
        expense: 0,
      });
    }
  }
  return grid;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
};

const CalendarScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clickedDate, setClickedDate] = useState<Date | null>(today);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  useFocusEffect(
    useCallback(() => {
      setClickedDate(today);
      setSelectedDate(today);

      // Fetch all transactions
      const fetchAllData = async () => {
        try {
          const transactions = await getTransactions();
          setAllTransactions(transactions);
        } catch (e) {
          console.error("Failed to fetch transactions", e);
        }
      };

      fetchAllData();
    }, [])
  );

  const goToPreviousMonth = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setSelectedDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const onDayPress = (date: Date | null) => {
    if (date) {
      setClickedDate(date);
      setIsModalVisible(true);
    }
  };
  const handleAddPress = () => {
    navigation.navigate("TransactionForm", { dateString: today.toISOString() });
  };

  const dailyAggregates = useMemo(() => {
    const aggregates = new Map<number, { income: number; expense: number }>();
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth();

    const monthTransactions = allTransactions.filter((tx) => {
      const txDate = new Date(tx.date);
      return (
        txDate.getFullYear() === currentYear &&
        txDate.getMonth() === currentMonth
      );
    });

    for (const tx of monthTransactions) {
      const day = new Date(tx.date).getDate();
      const amount = parseFloat(tx.amount) || 0;

      const dayAgg = aggregates.get(day) || { income: 0, expense: 0 };

      if (tx.activeTab === "Income") {
        dayAgg.income += amount;
      } else {
        dayAgg.expense += amount;
      }

      aggregates.set(day, dayAgg);
    }

    return aggregates;
  }, [allTransactions, selectedDate]);
  const monthlyTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const agg of dailyAggregates.values()) {
      income += agg.income;
      expense += agg.expense;
    }
    const total = income - expense;
    return { income, expense, total };
  }, [dailyAggregates]);

  const calendarGrid = useMemo(
    () => generateCalendarGrid(selectedDate, clickedDate, dailyAggregates),
    [selectedDate, clickedDate, dailyAggregates]
  );
  const monthYearTitle = useMemo(
    () => formatMonthYear(selectedDate),
    [selectedDate]
  );

  const calendarRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < calendarGrid.length; i += 7) {
      rows.push(calendarGrid.slice(i, i + 7));
    }
    return rows;
  }, [calendarGrid]);

  const renderDayHeaders = () => (
    <View style={styles.dayHeadersContainer}>
      {DAY_NAMES.map((day, index) => (
        <AppText
          key={day}
          style={[styles.dayHeaderText, index === 0 && styles.dayHeaderSunday]}
        >
          {day}
        </AppText>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <CalendarHeader
        income={monthlyTotals.income}
        expenses={monthlyTotals.expense}
        total={monthlyTotals.total}
      />

      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={styles.arrowButton}
        >
          <AppText style={styles.arrowText}>{"<"}</AppText>
        </TouchableOpacity>
        <AppText style={styles.monthTitle}>{monthYearTitle}</AppText>
        <TouchableOpacity onPress={goToNextMonth} style={styles.arrowButton}>
          <AppText style={styles.arrowText}>{">"}</AppText>
        </TouchableOpacity>
      </View>

      {renderDayHeaders()}

      <View style={styles.gridContainer}>
        {calendarRows.map((week, index) => (
          <View key={`week-${index}`} style={styles.row}>
            {week.map((item) => (
              <DayCell key={item.key} item={item} onPress={onDayPress} />
            ))}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
        <AppText style={styles.addButtonText}>+</AppText>
      </TouchableOpacity>

      <DayDetailsModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        date={clickedDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  monthTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    color: colors.secondary,
    fontSize: 20,
    fontWeight: "bold",
  },
  gridContainer: {
    flex: 1,
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: colors.dark,
    flexDirection: "column",
  },
  row: {
    flex: 1,
    flexDirection: "row",
  },
  dayHeadersContainer: {
    flexDirection: "row",
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
    paddingHorizontal: 5,
  },
  clickedText: {
    color: colors.white,
    fontWeight: "bold",
  },
  clickedBackground: {
    backgroundColor: colors.secondary,
    height: 28,
    width: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
  },
  dayHeaderText: {
    flex: 1,
    textAlign: "center",
    color: colors.light,
    fontSize: 13,
    fontWeight: "600",
  },
  dayHeaderSunday: {
    color: colors.danger,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    height: 45,
    width: 45,
    borderRadius: 17.5,
    backgroundColor: colors.dark,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.light,
  },
  addButtonText: {
    color: colors.light,
    fontSize: 30,
  },
});

export default CalendarScreen;
