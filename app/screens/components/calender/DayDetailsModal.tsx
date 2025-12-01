import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import AppText from "../../../components/AppText";
import colors from "../../../../config/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../../navigation/AppNavigator";
import { getTransactions, Transaction } from "../../../../utilities/storage";
import TransactionListItem from "../TransactionListItems";
import { useThemeColors } from "../../../../config/theme/colorMode";

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
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { colormode1, colormode2, secondarycolormode } = useThemeColors();

  useEffect(() => {
    if (visible && date) {
      const fetchTransactionsForDay = async () => {
        try {
          const allTransactions = await getTransactions();
          const selectedDateString = date.toDateString();
          const dailyTransactions = allTransactions.filter((tx) => {
            const txDate = new Date(tx.date);
            return txDate.toDateString() === selectedDateString;
          });
          setTransactions(dailyTransactions);
        } catch (e) {
          console.error("Failed to fetch daily transactions", e);
        }
      };
      fetchTransactionsForDay();
    } else {
      setTransactions([]);
    }
  }, [visible, date]);

  const handleAddPress = () => {
    if (date) {
      navigation.navigate("TransactionForm", {
        dateString: date.toISOString(),
      });
    }
    onClose();
  };
  const handleItemPress = () => {
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
        <Pressable
          style={[
            styles.modalContent,
            {
              backgroundColor: colormode2,
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <AppText style={[styles.modalTitle, { color: colormode1 }]}>
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

          <View style={styles.listContainer}>
            {transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AppText
                  style={[styles.emptyText, { color: secondarycolormode }]}
                >
                  No transactions for this day.
                </AppText>
              </View>
            ) : (
              <FlatList
                data={transactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TransactionListItem
                    onItemPress={handleItemPress}
                    item={item}
                  />
                )}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colormode1 }]}
            onPress={handleAddPress}
          >
            <AppText style={[styles.addButtonText, { color: colormode2 }]}>
              +
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(66, 66, 66, 0.5)",
  },
  modalContent: {
    height: "70%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
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
  addButton: {
    position: "absolute",
    bottom: 40,
    right: 40,
    height: 50,
    width: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 25,
    fontWeight: "bold",
  },
  listContainer: {
    flex: 1,
    width: "100%",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
  },
});

export default DayDetailsModal;
