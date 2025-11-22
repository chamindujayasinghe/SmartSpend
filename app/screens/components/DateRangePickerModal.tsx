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
import { useThemeColors } from "../../../config/theme/colorMode";

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
  const { titlecolor, modal3, secondarycolormode } = useThemeColors();
  return (
    <View style={styles.pickerContainer}>
      <AppText style={[styles.pickerLabel, { color: secondarycolormode }]}>
        {label}
      </AppText>
      <View style={[styles.pickerControls, { backgroundColor: modal3 }]}>
        <View style={styles.pickerColumn}>
          <TouchableOpacity onPress={() => setDate(modifyDate(date, "day", 1))}>
            <MaterialCommunityIcons
              name="chevron-up"
              size={28}
              color={titlecolor}
            />
          </TouchableOpacity>
          <AppText style={[styles.pickerValue, { color: titlecolor }]}>
            {date.getDate()}
          </AppText>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "day", -1))}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={28}
              color={titlecolor}
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
              color={titlecolor}
            />
          </TouchableOpacity>
          <AppText style={[styles.pickerValue, { color: titlecolor }]}>
            {date.toLocaleString("default", { month: "short" })}
          </AppText>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "month", -1))}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={28}
              color={titlecolor}
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
              color={titlecolor}
            />
          </TouchableOpacity>
          <AppText style={[styles.pickerValue, { color: titlecolor }]}>
            {date.getFullYear()}
          </AppText>
          <TouchableOpacity
            onPress={() => setDate(modifyDate(date, "year", -1))}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={28}
              color={titlecolor}
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
  startDate: Date;
  endDate: Date;
}

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isVisible,
  onClose,
  onConfirm,
  startDate,
  endDate,
}) => {
  const { modal, titlecolor, modal3, darksecondary, secondarycolormode } =
    useThemeColors();

  const [internalStartDate, setInternalStartDate] = useState(startDate);
  const [internalEndDate, setInternalEndDate] = useState(endDate);

  // Reset modal state whenever parent startDate/endDate changes
  React.useEffect(() => {
    setInternalStartDate(startDate);
    setInternalEndDate(endDate);
  }, [startDate, endDate]);

  const handleConfirm = () => {
    if (internalStartDate > internalEndDate) {
      onConfirm({ start: internalEndDate, end: internalStartDate });
    } else {
      onConfirm({ start: internalStartDate, end: internalEndDate });
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
            <View style={[styles.modalContent, { backgroundColor: modal }]}>
              <AppText style={[styles.modalTitle, { color: titlecolor }]}>
                Select Date Range
              </AppText>

              <SimpleDatePicker
                label="Start Date"
                date={internalStartDate}
                setDate={setInternalStartDate}
              />
              <SimpleDatePicker
                label="End Date"
                date={internalEndDate}
                setDate={setInternalEndDate}
              />

              <View
                style={[styles.summaryContainer, { backgroundColor: modal3 }]}
              >
                <AppText style={[styles.summaryText, { color: darksecondary }]}>
                  {formatDate(startDate)} - {formatDate(endDate)}
                </AppText>
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    [
                      styles.cancelButton,
                      { backgroundColor: secondarycolormode },
                    ],
                  ]}
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
    borderRadius: 15,
    padding: 20,
    width: "90%",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  pickerControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 10,
    padding: 10,
  },
  pickerColumn: {
    alignItems: "center",
  },
  pickerValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  summaryContainer: {
    marginVertical: 15,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  summaryText: {
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
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: colors.secondary,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default DateRangePickerModal;
