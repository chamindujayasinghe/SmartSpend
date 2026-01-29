// src/screens/budget/BudgetInputModal.tsx

import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColors } from "../../../../config/theme/colorMode";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import {
  BudgetEntry,
  saveBudgetEntry,
  getAllBudgets,
} from "../../../../utilities/BudgetStorage";

interface BudgetItem {
  category: string;
  type: "Income" | "Expense";
  budget: number;
  dateContext?: {
    currentDate: Date;
    selectedPeriod: string;
    dateRange: { start: Date | null; end: Date | null };
  };
}

interface BudgetInputModalProps {
  isVisible: boolean;
  item: BudgetItem | null;
  period: string;
  onClose: () => void;
  onSave: (entry: BudgetEntry) => void;
}

const BudgetInputModal: React.FC<BudgetInputModalProps> = ({
  isVisible,
  item,
  period,
  onClose,
  onSave,
}) => {
  const {
    titlecolor,
    colormode1,
    colormode2,
    secondarycolormode,
    textinputcolor,
  } = useThemeColors();

  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item && isVisible) {
      setError(null);
      loadExistingBudget();
    }
  }, [item, isVisible]);

  const getWeekNumber = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return weekNo;
  };

  const calculatePeriodKey = () => {
    if (!item?.dateContext) return period;

    const { selectedPeriod, currentDate, dateRange } = item.dateContext;
    if (selectedPeriod === "Monthly") {
      return `Monthly-${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
    } else if (selectedPeriod === "Weekly") {
      return `Weekly-${currentDate.getFullYear()}-${getWeekNumber(currentDate)}`;
    } else if (selectedPeriod === "Annually") {
      return `Annually-${currentDate.getFullYear()}`;
    } else if (selectedPeriod === "Daily") {
      return `Daily-${currentDate.toISOString().split("T")[0]}`;
    } else if (
      selectedPeriod === "Period" &&
      dateRange.start &&
      dateRange.end
    ) {
      const startStr = dateRange.start.toISOString().split("T")[0];
      const endStr = dateRange.end.toISOString().split("T")[0];
      return `Period-${startStr}-${endStr}`;
    }
    return selectedPeriod;
  };

  const loadExistingBudget = async () => {
    if (!item) return;
    const targetPeriod = calculatePeriodKey();
    const allBudgets = await getAllBudgets();

    const existingEntry = allBudgets.find(
      (b: any) =>
        b.category === item.category &&
        b.type === item.type &&
        b.period === targetPeriod,
    );

    if (existingEntry && existingEntry.budget > 0) {
      setAmount(existingEntry.budget.toString());
    } else {
      setAmount("");
    }
  };

  const handleSavePress = async () => {
    if (!item) return;

    const sanitizedAmount = amount.replace(/[^0-9.]/g, "") || "0";
    const numericAmount = parseFloat(sanitizedAmount);

    // Strict Validation: Must be a number and greater than 0
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a budget greater than 0");
      return;
    }

    const budgetPeriod = calculatePeriodKey();

    const newEntry: BudgetEntry = {
      category: item.category,
      type: item.type,
      period: budgetPeriod,
      budget: numericAmount,
    };

    try {
      await saveBudgetEntry(newEntry);
      onSave(newEntry);
      onClose();
    } catch (e) {
      console.error("Budget save error:", e);
      setError("Could not save budget. Please try again.");
    }
  };

  if (!item) return null;

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: colormode2 }]}
          >
            <View style={styles.header}>
              <AppText style={[styles.headerTitle, { color: titlecolor }]}>
                Set Budget for {item.category}
              </AppText>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={colors.danger}
                />
              </TouchableOpacity>
            </View>

            <AppText style={[styles.periodText, { color: secondarycolormode }]}>
              {period} Budget
            </AppText>

            <TextInput
              style={[
                styles.input,
                { backgroundColor: textinputcolor, color: colormode1 },
                error
                  ? { borderBottomColor: colors.danger, borderBottomWidth: 1 }
                  : null,
              ]}
              placeholder="0.00"
              placeholderTextColor={secondarycolormode}
              keyboardType="numeric"
              value={amount}
              onChangeText={(text) => {
                setAmount(text);
                if (error) setError(null);
              }}
            />

            {error && <AppText style={styles.errorText}>{error}</AppText>}

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.secondary }]}
              onPress={handleSavePress}
            >
              <AppText style={styles.saveButtonText}>Set Budget</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  periodText: {
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 10, // Reduced to accommodate error text
    minHeight: 50,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 15,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default BudgetInputModal;
