import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { CalendarCell } from "../../../Hooks/calenderTypes";

interface DayCellProps {
  item: CalendarCell;
  onPress: (date: Date) => void;
}

const DayCell: React.FC<DayCellProps> = React.memo(({ item, onPress }) => {
  if (item.day === null) {
    return <View style={styles.cell} />;
  }

  const handlePress = () => {
    if (item.fullDate) {
      onPress(item.fullDate);
    }
  };

  return (
    <TouchableOpacity style={styles.cell} onPress={handlePress}>
      {item.isToday ? (
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
});

const styles = StyleSheet.create({
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
  sundayText: {
    textAlign: "right",
    color: colors.danger,
  },
  otherDayText: {
    textAlign: "right",
    color: colors.light,
  },
});

export default DayCell;
