import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const formatDate = (date: Date) => {
  return date.toLocaleDateString("default", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const modifyDate = (
  date: Date,
  unit: "day" | "month" | "year",
  amount: number
) => {
  const newDate = new Date(date);
  if (unit === "day") {
    newDate.setDate(newDate.getDate() + amount);
  } else if (unit === "month") {
    newDate.setMonth(newDate.getMonth() + amount);
  } else if (unit === "year") {
    newDate.setFullYear(newDate.getFullYear() + amount);
  }
  return newDate;
};

interface DatePickerProps {
  label: string;
  date: Date;
  setDate: (date: Date) => void;
}

const SimpleDatePicker: React.FC<DatePickerProps> = ({
  label,
  date,
  setDate,
}) => {
  return (
    <View style={styles.pickerContainer}>
      <AppText style={styles.pickerLabel}>{label}</AppText>
      <View style={styles.pickerControls}>
        <View style={styles.pickerColumn}>
          <TouchableOpacity onPress={() => setDate(modifyDate(date, "day", 1))}>
            <MaterialCommunityIcons
              name="chevron-up"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
          <AppText style={styles.pickerValue}>{date.getDate()}</AppText>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "day", -1))}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.pickerColumn}>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "month", 1))}
          >
            <MaterialCommunityIcons
              name="chevron-up"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
          <AppText style={styles.pickerValue}>
            {date.toLocaleString("default", { month: "short" })}
          </AppText>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "month", -1))}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.pickerColumn}>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "year", 1))}
          >
            <MaterialCommunityIcons
              name="chevron-up"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
          <AppText style={styles.pickerValue}>{date.getFullYear()}</AppText>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "year", -1))}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={28}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface DateRangePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (range: { start: Date; end: Date }) => void;
}

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleConfirm = () => {
    if (startDate > endDate) {
      onConfirm({ start: endDate, end: startDate });
    } else {
      onConfirm({ start: startDate, end: endDate });
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalBackdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <AppText style={styles.modalTitle}>Select Date Range</AppText>

              <SimpleDatePicker
                label="Start Date"
                date={startDate}
                setDate={setStartDate}
              />
              <SimpleDatePicker
                label="End Date"
                date={endDate}
                setDate={setEndDate}
              />

              <View style={styles.summaryContainer}>
                <AppText style={styles.summaryText}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </AppText>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onClose}
                >
                  <AppText style={styles.buttonText}>Cancel</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={handleConfirm}
                >
                  <AppText style={styles.buttonText}>Confirm</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.dark,
    borderRadius: 15,
    padding: 20,
    width: "90%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: colors.light,
    marginBottom: 10,
  },
  pickerControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: colors.primary,
    borderRadius: 10,
    padding: 10,
  },
  pickerColumn: {
    alignItems: "center",
  },
  pickerValue: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  summaryContainer: {
    marginVertical: 15,
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
    alignItems: "center",
  },
  summaryText: {
    color: colors.secondary,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.light,
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: colors.secondary,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.dark,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DateRangePickerModal;
