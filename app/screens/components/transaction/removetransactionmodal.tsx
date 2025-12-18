import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../../components/AppText";
import { useThemeColors } from "../../../../config/theme/colorMode";
import colors from "../../../../config/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DEFAULT_ACCOUNT_TYPES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "../../../data/TransactionData";

interface Props {
  visible: boolean;
  onClose: () => void;
  // Handler passed from TransactionForm to call deleteCustomItem
  onRemove: (value: string) => Promise<void>;
  title: string;
  // The full combined list (default + custom) currently fetched
  items: string[];
  modalType: "category" | "account" | null;
  activeTab: string;
}

// Function to check if an item is a default item
const isDefaultItem = (
  item: string,
  type: "category" | "account",
  activeTab: string
) => {
  let defaultList: string[] = [];
  if (type === "account") {
    defaultList = DEFAULT_ACCOUNT_TYPES;
  } else if (type === "category") {
    defaultList =
      activeTab === "Income"
        ? DEFAULT_INCOME_CATEGORIES
        : DEFAULT_EXPENSE_CATEGORIES;
  }

  // Check if the item is present in the default list
  return defaultList.map((i) => i.toLowerCase()).includes(item.toLowerCase());
};

const RemoveTransactionModal: React.FC<Props> = ({
  visible,
  onClose,
  onRemove,
  title,
  items,
  modalType,
  activeTab,
}) => {
  const { colormode1, colormode2, secondarycolormode } = useThemeColors();

  // State to hold the list we display in the modal, mainly for refreshing after deletion
  const [listItems, setListItems] = useState<string[]>(items);

  // Update list when props.items changes (when TransactionForm re-fetches data)
  useEffect(() => {
    setListItems(items);
  }, [items]);

  const handleRemove = async (item: string) => {
    if (!modalType) return;

    // Safety check to confirm deletion
    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to permanently remove "${item}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Call the external removal logic
            await onRemove(item);

            // Optimistically update the local state list immediately for smooth UX
            setListItems((prevItems) => prevItems.filter((i) => i !== item));

            // Note: onClose is NOT called here because the user might want to delete multiple items.
            // The user must manually close the modal.
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colormode2 }]}>
            <View style={styles.header}>
              <AppText style={[styles.headerText, { color: colormode1 }]}>
                {title}
              </AppText>

              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={colors.danger}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={listItems}
              keyExtractor={(item) => item}
              contentContainerStyle={{ paddingBottom: 20 }}
              renderItem={({ item }) => {
                // Determine if the item is a default and should not be deletable
                const isDefault = modalType
                  ? isDefaultItem(item, modalType, activeTab)
                  : false;

                return (
                  <View style={styles.itemRow}>
                    <AppText style={[styles.itemText, { color: colormode1 }]}>
                      {item}
                    </AppText>
                    {/* Only show delete icon if it's NOT a default item */}
                    {!isDefault && (
                      <TouchableOpacity
                        style={styles.deleteIcon}
                        onPress={() => handleRemove(item)}
                      >
                        <MaterialCommunityIcons
                          name="delete-circle"
                          size={24}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    )}
                    {/* Optionally show a lock/info icon for default items */}
                    {isDefault && (
                      <MaterialCommunityIcons
                        name="lock"
                        size={18}
                        color={secondarycolormode}
                      />
                    )}
                  </View>
                );
              }}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(92, 92, 92, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modal: {
    height: "80%",
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.light, // Use a generic light color
  },
  itemText: {
    fontSize: 16,
    flex: 1, // Allows text to take up space
  },
  deleteIcon: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
});

export default RemoveTransactionModal;
