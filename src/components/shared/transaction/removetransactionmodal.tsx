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
import {
  DEFAULT_ACCOUNT_TYPES,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from "../../../data/TransactionData";

interface Props {
  visible: boolean;
  onClose: () => void;
  onRemove: (value: string) => Promise<void>;
  title: string;
  items: string[];
  modalType: "category" | "account" | null;
  activeTab: string;
}

const isDefaultItem = (
  item: string,
  type: "category" | "account",
  activeTab: string,
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

  const [listItems, setListItems] = useState<string[]>(items);

  useEffect(() => {
    setListItems(items);
  }, [items]);

  const handleRemove = async (item: string) => {
    if (!modalType) return;

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
            await onRemove(item);
            setListItems((prevItems) => prevItems.filter((i) => i !== item));
          },
        },
      ],
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
                const isDefault = modalType
                  ? isDefaultItem(item, modalType, activeTab)
                  : false;

                return (
                  <View style={styles.itemRow}>
                    <AppText style={[styles.itemText, { color: colormode1 }]}>
                      {item}
                    </AppText>
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
    borderBottomColor: colors.light,
  },
  itemText: {
    fontSize: 16,
    flex: 1,
  },
  deleteIcon: {
    paddingLeft: 10,
    paddingVertical: 5,
  },
});

export default RemoveTransactionModal;
