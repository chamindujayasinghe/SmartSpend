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

    const newEntry: BudgetEntry = {
      category: item.category,
      type: item.type,
      period: period,
      budget: numericAmount,
    };

    try {
      // 1. Save to persistent storage
      await saveBudgetEntry(newEntry);

      // 2. Notify the parent screen (BudgetSettingScreen) to update its list
      onSave(newEntry);

      Alert.alert("Success", `Budget for ${item.category} saved!`);
      onClose();
    } catch (e) {
      console.error("Budget save error:", e);
      Alert.alert("Error", "Could not save budget.");
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
