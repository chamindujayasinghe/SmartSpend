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
} from "../../../../utilities/BudgetStorage";

// Define the structure for the budget item used by the modal
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
  // Change onSave to accept the full entry data
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

  useEffect(() => {
    if (item && isVisible) {
      if (item.budget === 0) {
        setAmount("");
      } else {
        setAmount(item.budget.toFixed(2));
      }
    }
  }, [item, isVisible]);

  const handleSavePress = async () => {
    if (!item) return;

    const sanitizedAmount = amount.replace(/[^0-9.]/g, "") || "0";
    const numericAmount = parseFloat(sanitizedAmount);

    if (isNaN(numericAmount) || numericAmount < 0) {
      alert("Please enter a valid positive number.");
      return;
    }

    // Determine the period based on the source
    let budgetPeriod = period;

    // If coming from BudgetAddScreen with date context, handle specific period
    if (item.dateContext) {
      const { selectedPeriod, currentDate, dateRange } = item.dateContext;

      // For Monthly budgets from BudgetAddScreen, create specific month-year identifier
      if (selectedPeriod === "Monthly") {
        const month = currentDate.getMonth() + 1; // 0-indexed to 1-indexed
        const year = currentDate.getFullYear();
        budgetPeriod = `Monthly-${year}-${month}`; // e.g., "Monthly-2025-11"
      } else if (selectedPeriod === "Weekly") {
        // For weekly, you might want to store week number or date range
        const weekNumber = getWeekNumber(currentDate);
        const year = currentDate.getFullYear();
        budgetPeriod = `Weekly-${year}-${weekNumber}`; // e.g., "Weekly-2025-45"
      } else if (selectedPeriod === "Annually") {
        const year = currentDate.getFullYear();
        budgetPeriod = `Annually-${year}`; // e.g., "Annually-2025"
      } else if (selectedPeriod === "Daily") {
        const dateStr = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
        budgetPeriod = `Daily-${dateStr}`;
      } else if (
        selectedPeriod === "Period" &&
        dateRange.start &&
        dateRange.end
      ) {
        // For custom date range
        const startStr = dateRange.start.toISOString().split("T")[0];
        const endStr = dateRange.end.toISOString().split("T")[0];
        budgetPeriod = `Period-${startStr}-${endStr}`;
      }
    }

    const newEntry: BudgetEntry = {
      category: item.category,
      type: item.type,
      period: budgetPeriod, // Use the determined period
      budget: numericAmount,
    };

    try {
      await saveBudgetEntry(newEntry);
      onSave(newEntry);

      Alert.alert("Success", `Budget for ${item.category} saved!`);
      onClose();
    } catch (e) {
      console.error("Budget save error:", e);
      Alert.alert("Error", "Could not save budget.");
    }
  };

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo;
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
              ]}
              placeholder="0.00"
              placeholderTextColor={secondarycolormode}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

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
    marginBottom: 20,
    minHeight: 50,
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
