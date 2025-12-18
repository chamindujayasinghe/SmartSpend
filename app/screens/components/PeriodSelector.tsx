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
import { useThemeColors } from "../../../config/theme/colorMode";

export type Period = "Daily" | "Weekly" | "Monthly" | "Annually" | "Period";
const periodOptions: Period[] = [
  "Daily",
  "Weekly",
  "Monthly",
  "Annually",
  "Period",
];

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
  const { colormode2, colormode1, secondarycolormode } = useThemeColors();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isResetPressed, setIsResetPressed] = useState(false);

  const handleSelect = (period: Period) => {
    if (period === "Period") {
      onShowRangePicker();
    } else {
      onSelectPeriod(period);
    }
    setIsModalVisible(false);
  };

  const getPeriodInitial = (period: Period) => {
    if (period === "Period") return "P";
    return period.charAt(0);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.periodSelector, { backgroundColor: secondarycolormode }]}
        onPress={() => setIsModalVisible(true)}
      >
        <AppText style={[styles.periodText, { color: colors.secondary }]}>
          {getPeriodInitial(selectedPeriod)}
        </AppText>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={colors.secondary}
        />
      </TouchableOpacity>

      {onReset && (
        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: secondarycolormode },
            isResetPressed && styles.resetButtonPressed,
          ]}
          onPress={onReset}
          onPressIn={() => setIsResetPressed(true)}
          onPressOut={() => setIsResetPressed(false)}
        >
          <AppText style={[styles.resetButtonText, { color: colormode2 }]}>
            Reset
          </AppText>
        </TouchableOpacity>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View
              style={[styles.modalContent, { backgroundColor: colormode2 }]}
            >
              {periodOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.modalOption}
                  onPress={() => handleSelect(option)}
                >
                  <AppText
                    style={[
                      styles.modalOptionText,
                      {
                        color: colormode1,
                      },
                    ]}
                  >
                    {option}
                  </AppText>
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
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 10,
  },
  resetButton: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  resetButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  resetButtonPressed: {
    backgroundColor: colors.secondary,
  },
  periodText: {
    fontWeight: "bold",
    marginRight: 5,
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(59, 59, 59, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
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
    fontSize: 18,
  },
});

export default PeriodSelector;
