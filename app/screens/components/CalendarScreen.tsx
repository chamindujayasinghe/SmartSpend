import React, { useState, useMemo, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import CalendarHeader from "./CalenderHeader";

const today = new Date();

interface CalendarCell {
  key: string;
  day: number | null;
  isSunday: boolean;
  isToday: boolean;
  isClicked: boolean;
  fullDate: Date | null;
}

const generateCalendarGrid = (
  date: Date,
  clickedDate: Date | null
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

    grid.push({
      key: `day-${day}`,
      day,
      isSunday,
      isToday,
      isClicked,
      fullDate: cellDate,
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clickedDate, setClickedDate] = useState<Date | null>(today);

  const [income, setIncome] = useState(0);
  const [expenses, setExpense] = useState(0);
  const total = income - expenses;

  useFocusEffect(
    useCallback(() => {
      setClickedDate(today);
      setSelectedDate(today);
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
    }
  };

  const calendarGrid = useMemo(
    () => generateCalendarGrid(selectedDate, clickedDate),
    [selectedDate, clickedDate]
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

  const renderCell = ({ item }: { item: CalendarCell }) => {
    if (item.day === null) {
      return <View style={styles.cell} />;
    }

    return (
      <TouchableOpacity
        style={styles.cell}
        onPress={() => onDayPress(item.fullDate)}
      >
        {item.isClicked ? (
          <View style={styles.clickedBackground}>
            <AppText style={[styles.dayText, styles.clickedText]}>
              {item.day}
            </AppText>
          </View>
        ) : item.isToday ? (
          <View style={styles.todayBackground}>
            <AppText style={[styles.dayText, styles.todayText]}>
              {item.day}
            </AppText>
          </View>
        ) : (
          <AppText
            style={[
              styles.dayText,
              item.isSunday ? styles.sundayText : styles.otherDayText,
            ]}
          >
            {item.day}
          </AppText>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <CalendarHeader income={income} expenses={expenses} total={total} />

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
            {week.map((item) => {
              const cellElement = renderCell({ item });
              return React.cloneElement(cellElement, { key: item.key });
            })}
          </View>
        ))}
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => {}}>
        <AppText style={styles.addButtonText}>+</AppText>
      </TouchableOpacity>
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
  todayText: {
    color: colors.dark,
    fontWeight: "bold",
  },
  todayBackground: {
    backgroundColor: colors.white,
    height: 28,
    width: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-end",
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
  cell: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderRightWidth: 0.5,
    borderColor: colors.dark,
    padding: 5,
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
  },
  sundayText: {
    textAlign: "right",
    color: colors.danger,
  },
  otherDayText: {
    textAlign: "right",
    color: colors.light,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    height: 40,
    width: 40,
    borderRadius: 17.5,
    backgroundColor: colors.light,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: colors.darkPrimary,
    fontSize: 25,
    fontWeight: "bold",
  },
});

export default CalendarScreen;
