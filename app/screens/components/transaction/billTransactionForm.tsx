import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeColors } from "../../../../config/theme/colorMode";
import {
  getAccountTypes,
  getExpenseCategories,
} from "../../../data/TransactionData";
import { saveTransaction } from "../../../../utilities/storage";
import AppText from "../../../components/AppText";
import SelectionModal from "../SelectionModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import colors from "../../../../config/colors";
import { BillTransactionFormProps } from "../../../navigation/NavigationTypes";
import { useCurrency } from "../../../../config/currencyProvider";

interface ScannedItem {
  product_name: string;
  amount: string;
  category: string;
}

const BillTransactionForm: React.FC<BillTransactionFormProps> = ({ route }) => {
  const navigation = useNavigation<BillTransactionFormProps["navigation"]>();
  const { scannedItems, selectedDate } = route.params;
  const { titlecolor, textinputcolor, secondarycolormode, colormode2 } =
    useThemeColors();

  const [date, setDate] = useState(
    selectedDate ? new Date(selectedDate) : new Date(),
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [account, setAccount] = useState("");

  const [items, setItems] = useState<ScannedItem[]>(
    scannedItems?.map((item: any) => ({
      product_name: item.product_name || "",
      amount: item.amount ? item.amount.toString() : "",
      category: item.category || "others",
    })) || [],
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [modalItems, setModalItems] = useState<string[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const { currency } = useCurrency();

  const handleUpdateItem = (
    index: number,
    field: keyof ScannedItem,
    value: string,
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const openCategoryModal = async (index: number) => {
    const categories = await getExpenseCategories("expense");
    setModalItems(categories);
    setActiveItemIndex(index);
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    if (!account) return Alert.alert("", "Please select an account");
    if (items.length === 0) return Alert.alert("", "No items to save");

    try {
      for (const item of items) {
        await saveTransaction({
          date: date,
          amount: item.amount,
          category: item.category,
          account: account,
          description: item.product_name,
          activeTab: "Expense",
          currency: currency,
        });
      }
      Alert.alert("Success", "All items saved!");
      navigation.popToTop();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save items");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color={titlecolor}
          />
        </TouchableOpacity>
        <AppText style={[styles.headerText, { color: titlecolor }]}>
          Scanned Bill
        </AppText>
      </View>

      <View style={styles.topSelectors}>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.selectorRow, { borderBottomColor: textinputcolor }]}
        >
          <AppText style={[styles.labelText, { color: titlecolor }]}>
            Date
          </AppText>
          <View style={styles.valueContainer}>
            <AppText style={[styles.valueText, { color: secondarycolormode }]}>
              {date.toLocaleDateString()}
            </AppText>
            <MaterialCommunityIcons
              name="reload"
              size={18}
              color={secondarycolormode}
              style={{ marginLeft: 5 }}
            />
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            const accs = await getAccountTypes("account");
            setModalItems(accs);
            setActiveItemIndex(null);
            setModalVisible(true);
          }}
          style={[styles.selectorRow, { borderBottomColor: textinputcolor }]}
        >
          <AppText style={[styles.labelText, { color: titlecolor }]}>
            Account
          </AppText>
          <View style={styles.valueContainer}>
            <AppText style={[styles.valueText, { color: secondarycolormode }]}>
              {account || "Select Account"}
            </AppText>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={secondarycolormode}
              style={{ marginLeft: 5 }}
            />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {items.map((item, index) => (
          <View key={index} style={styles.cardContainer}>
            {/* Product Card */}
            <View
              style={[
                styles.productCard,
                {
                  backgroundColor: secondarycolormode,
                },
              ]}
            >
              <View style={styles.cardRow}>
                <TextInput
                  style={[styles.productInput, { color: colormode2 }]}
                  value={item.product_name}
                  onChangeText={(val) =>
                    handleUpdateItem(index, "product_name", val)
                  }
                />
                <TextInput
                  style={[styles.amountInput, { color: colormode2 }]}
                  value={item.amount}
                  keyboardType="numeric"
                  onChangeText={(val) => handleUpdateItem(index, "amount", val)}
                />
              </View>

              <View style={styles.cardRow}>
                <TouchableOpacity
                  style={styles.categoryPicker}
                  onPress={() => openCategoryModal(index)}
                >
                  <AppText style={[styles.categoryText, { color: colormode2 }]}>
                    {item.category}
                  </AppText>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={16}
                    color={colormode2}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Delete Button */}
            <TouchableOpacity
              style={styles.deleteAction}
              onPress={() => removeItem(index)}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={24}
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cancelBtn, { backgroundColor: secondarycolormode }]}
          onPress={() => navigation.goBack()}
        >
          <AppText style={[styles.btnText, { color: colormode2 }]}>
            Cancel
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.secondary }]}
          onPress={handleConfirm}
        >
          <AppText style={styles.btnText}>Confirm</AppText>
        </TouchableOpacity>
      </View>

      <SelectionModal
        isVisible={modalVisible}
        title={activeItemIndex !== null ? "Select Category" : "Select Account"}
        items={modalItems}
        onSelectItem={(val) => {
          if (activeItemIndex !== null) {
            handleUpdateItem(activeItemIndex, "category", val);
          } else {
            setAccount(val);
          }
          setModalVisible(false);
        }}
        onClose={() => setModalVisible(false)}
        onAddPress={() => {}}
        onDeletePress={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginTop: 10,
  },
  headerText: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  content: { flex: 1, paddingHorizontal: 15 },
  topSelectors: { marginBottom: 20, paddingHorizontal: 15 },
  labelText: {
    fontSize: 15,
    fontWeight: "600",
  },

  valueText: {
    fontSize: 15,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  cardContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "stretch",
  },
  productCard: {
    flex: 1,
    borderWidth: 1,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    padding: 15,
  },
  deleteAction: {
    backgroundColor: colors.danger || "#ff4444",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  productInput: { flex: 2, fontSize: 15, fontWeight: "500" },
  amountInput: { flex: 1, textAlign: "right", fontSize: 15 },
  categoryText: { fontSize: 15 },
  categoryPicker: { flexDirection: "row", alignItems: "center", gap: 5 },
  footer: { flexDirection: "row", padding: 20, gap: 10, marginBottom: 10 },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#555",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

export default BillTransactionForm;
