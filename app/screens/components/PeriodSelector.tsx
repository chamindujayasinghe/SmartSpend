import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";

export type Period = "Daily" | "Monthly" | "Annually" | "Period";
const periodOptions: Period[] = ["Daily", "Monthly", "Annually", "Period"];

interface PeriodSelectorProps {
  selectedPeriod: Period;
  onSelectPeriod: (period: Period) => void;
  onReset: () => void;
  onShowRangePicker: () => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onSelectPeriod,
  onReset,
  onShowRangePicker,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResetPressed, setIsResetPressed] = useState(false);

  const handleSelect = (period: Period) => {
    if (period === "Period") {
      onShowRangePicker(); // Trigger modal show instead of setting state
    } else {
      onSelectPeriod(period);
    }
    setIsModalVisible(false);
  };

  const getPeriodInitial = (period: Period) => {
    if (period === "Period") return "P"; // Use "P" for Period
    return period.charAt(0);
  };

  return (
    // Wrap both buttons in a single View to align them
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.periodSelector}
        onPress={() => setIsModalVisible(true)}
      >
        <AppText style={styles.periodText}>
          {getPeriodInitial(selectedPeriod)}
        </AppText>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={colors.white}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.resetButton,
          isResetPressed && styles.resetButtonPressed,
        ]}
        onPress={onReset}
        onPressIn={() => setIsResetPressed(true)}
        onPressOut={() => setIsResetPressed(false)}
      >
        <AppText style={styles.resetButtonText}>Reset</AppText>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContent}>
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelect(option)}
                >
                  <AppText style={styles.modalOptionText}>{option}</AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  periodSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
  },
  resetButton: {
    backgroundColor: colors.dark,
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 16,
  },
  resetButtonPressed: {
    backgroundColor: colors.secondary,
  },
  periodText: {
    color: colors.secondary,
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.dark,
    borderRadius: 15,
    padding: 10,
    width: "60%",
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 15,
    alignItems: "center",
  },
  modalOptionText: {
    color: colors.white,
    fontSize: 18,
  },
});

export default PeriodSelector;
