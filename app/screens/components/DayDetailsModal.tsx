// app/screens/components/DayDetailsModal.tsx

import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // <-- Re-added this import

// Navigation imports
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppNavigator";

type NavigationProps = NativeStackNavigationProp<
  AppStackParamList,
  "TransactionForm"
>;

interface DayDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  date: Date | null;
}

const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  visible,
  onClose,
  date,
}) => {
  const navigation = useNavigation<NavigationProps>();

  const handleAddPress = () => {
    if (date) {
      navigation.navigate("TransactionForm", {
        dateString: date.toISOString(),
      });
    }
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          {/* --- THIS IS THE PART THAT WAS MISSING --- */}
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>
              {date?.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </AppText>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={30}
                color={colors.danger}
              />
            </TouchableOpacity>
          </View>

          <AppText style={styles.modalBodyText}>
            Income/Expense details for this day will go here.
          </AppText>

          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <AppText style={styles.addButtonText}>+</AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// Styles (unchanged)
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "70%",
    backgroundColor: colors.darkPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
    flex: 1,
  },
  modalBodyText: {
    fontSize: 16,
    color: colors.light,
  },
  addButton: {
    position: "absolute",
    bottom: 40,
    right: 40,
    height: 40,
    width: 40,
    borderRadius: 20,
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

export default DayDetailsModal;
