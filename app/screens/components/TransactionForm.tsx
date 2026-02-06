import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { useNavigation } from "@react-navigation/native";
import { TransactionFormProps } from "../../navigation/NavigationTypes";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Formik } from "formik";
import * as Yup from "yup";
import {
  saveNewItem,
  getAccountTypes,
  getIncomeCategories,
  getExpenseCategories,
  deleteCustomItem, // <-- NEW: Imported deletion function
} from "../../data/TransactionData";
import SelectionModal from "./SelectionModal";
import TransactionTypeTabs from "./TransactionTypeTabs";
import { saveTransaction, deleteTransaction } from "../../../utilities/storage";
import { useThemeColors } from "../../../config/theme/colorMode";
import AddNewModal from "./transaction/AddTransactionData";
import RemoveTransactionModal from "./transaction/removetransactionmodal";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../../lib/Supabase-client-config";

const validationSchema = Yup.object().shape({
  activeTab: Yup.string(),
  date: Yup.date().required().label("Date"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .typeError("Amount must be a number"),
  category: Yup.string().when("activeTab", {
    is: (val: string) => val !== "Transfer",
    then: (schema) => schema.required("Category is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  account: Yup.string().required("Account is required").label("Account"),
  description: Yup.string().label("Description"),
});

const TransactionForm: React.FC<TransactionFormProps> = ({ route }) => {
  const navigation = useNavigation();
  const { dateString, transaction } = route.params;
  const { titlecolor, textinputcolor, secondarycolormode, colormode2 } =
    useThemeColors();

  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"category" | "account" | null>(
    null,
  );
  // State to hold the fetched list for the SelectionModal
  const [selectionModalItems, setSelectionModalItems] = useState<string[]>([]);

  const [addNewModalVisible, setAddNewModalVisible] = useState(false);

  // State for the removal modal
  const [removeModalVisible, setRemoveModalVisible] = useState(false);

  const isEditing = !!transaction;

  const handleAddNew = () => {
    setModalVisible(false); // Close the selection modal
    setAddNewModalVisible(true); // Open the add new item modal
  };

  const handleOpenRemoveModal = () => {
    setModalVisible(false); // Close selection modal
    setRemoveModalVisible(true); // Open remove modal
  };

  const initialDate = (() => {
    if (transaction?.date) {
      return new Date(transaction.date);
    }
    if (dateString) {
      return new Date(dateString);
    }
    return new Date();
  })();

  const handleSave = async (values: any, { resetForm }: any) => {
    try {
      const transactionData = {
        ...values,
        date: values.date,
      };

      if (!isEditing) {
        const { id, ...newTransaction } = transactionData;
        await saveTransaction(newTransaction);
      } else {
        await saveTransaction(transactionData);
      }

      Alert.alert(
        "Success",
        isEditing ? "Transaction updated!" : "Transaction saved!",
      );
      console.log("Form Submitted and Saved:", transactionData);

      navigation.goBack();
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert(
        "Error",
        `Could not ${isEditing ? "update" : "save"} transaction.`,
      );
    }
  };

  const handleDelete = async () => {
    if (!transaction?.id) return;

    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTransaction(transaction.id);
              Alert.alert("Success", "Transaction deleted!");
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting transaction:", error);
              Alert.alert("Error", "Failed to delete transaction.");
            }
          },
        },
      ],
    );
  };

  const getFormattedDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString();
    const day = date.getDate().toString();
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    return `${year}-${month}-${day}, ${weekday}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color={titlecolor}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <AppText style={[styles.headerText, { color: titlecolor }]}>
          {isEditing ? "Edit Transaction" : "New Transaction"}
        </AppText>
      </View>

      <Formik
        initialValues={{
          activeTab: transaction?.activeTab || "Expense",
          date: initialDate,
          amount: transaction?.amount || "",
          category: transaction?.category || "",
          account: transaction?.account || "",
          description: transaction?.description || "",
          id: transaction?.id,
        }}
        validationSchema={validationSchema}
        onSubmit={handleSave}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
          resetForm,
        }) => {
          const handleCameraButtonPress = async () => {
            const { granted } =
              await ImagePicker.requestCameraPermissionsAsync();

            if (!granted) {
              Alert.alert("Camera permission required");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              quality: 0.1,
              allowsEditing: true,
              base64: true,
            });

            if (result.canceled) return;

            const base64Image = result.assets[0].base64;

            // Get categories to help the AI categorize accurately
            const userCategories = await getExpenseCategories("expense");

            try {
              const { data, error } = await supabase.functions.invoke("ocr", {
                body: {
                  imageBase64: base64Image,
                  userCategories: userCategories,
                },
              });

              if (error) {
                console.error("OCR error:", error);
                Alert.alert("OCR failed", "Could not process the receipt.");
                return;
              }

              if (
                !data.success ||
                !data.products ||
                data.products.length === 0
              ) {
                Alert.alert(
                  "No items found",
                  "The AI couldn't detect clear products. Try a clearer photo.",
                );
                return;
              }

              console.log("🧾 AI RESULT:", data.products);

              // Navigate to the new BillTransactionForm with the scanned data
              // We cast navigation as any or use the proper type to avoid TS errors
              (navigation as any).navigate("BillTransactionForm", {
                scannedItems: data.products,
              });
            } catch (err) {
              console.error("OCR exception:", err);
              Alert.alert(
                "Error",
                "An unexpected error occurred during scanning.",
              );
            }
          };

          // Function to fetch items and open the SelectionModal
          const fetchAndOpenSelectionModal = async (
            type: "category" | "account",
          ) => {
            setModalType(type);
            let items: string[] = [];

            if (type === "account") {
              items = await getAccountTypes("account");
            } else if (type === "category") {
              items =
                values.activeTab === "Income"
                  ? await getIncomeCategories("income")
                  : await getExpenseCategories("expense");
            }

            setSelectionModalItems(items);
            setModalVisible(true);
          };

          const handleSaveNewItem = async (value: string) => {
            if (!modalType || value.trim().length === 0) return;

            const trimmedValue = value.trim();

            try {
              let categoryType: "account" | "income" | "expense" = "account";

              if (modalType === "account") {
                categoryType = "account";
              } else if (modalType === "category") {
                categoryType =
                  values.activeTab === "Income" ? "income" : "expense";
              }

              await saveNewItem(categoryType, trimmedValue);

              setFieldValue(modalType, trimmedValue);

              await fetchAndOpenSelectionModal(modalType);
            } catch (error) {
              console.error("Error saving new item:", error);
            }
          };

          const handleRemoveItem = async (itemToDelete: string) => {
            if (!modalType) return;

            try {
              let categoryType: "account" | "income" | "expense" = "account";

              if (modalType === "account") {
                categoryType = "account";
              } else if (modalType === "category") {
                categoryType =
                  values.activeTab === "Income" ? "income" : "expense";
              }

              await deleteCustomItem(categoryType, itemToDelete);

              if (values[modalType] === itemToDelete) {
                setFieldValue(modalType, "");
              }

              const updatedItems =
                modalType === "account"
                  ? await getAccountTypes("account")
                  : values.activeTab === "Income"
                    ? await getIncomeCategories("income")
                    : await getExpenseCategories("expense");

              setSelectionModalItems(updatedItems);
            } catch (error) {
              console.error("Error removing item:", error);
            }
          };

          const onChangeDate = (event: any, selectedDate?: Date) => {
            setShowPicker(false);
            if (selectedDate) {
              setFieldValue("date", selectedDate);
            }
          };

          const getModalTitle = () => {
            if (modalType === "account") return "Select Account";
            if (modalType === "category") return "Select Category";
            return "";
          };

          const handleSelectItem = (item: string) => {
            if (modalType) {
              setFieldValue(modalType, item);
            }
            setModalVisible(false);
          };

          return (
            <>
              <ScrollView style={styles.body}>
                <TransactionTypeTabs
                  activeTab={values.activeTab}
                  onTabPress={(tab) => {
                    setFieldValue("activeTab", tab);
                    setFieldValue("category", "");
                  }}
                />
                {/* date */}
                <View
                  style={[
                    styles.fieldContainer,
                    {
                      borderBottomColor: textinputcolor,
                    },
                  ]}
                >
                  <AppText style={[styles.fieldLabel, { color: titlecolor }]}>
                    Date
                  </AppText>
                  <TouchableOpacity
                    style={styles.fieldValueContainer}
                    onPress={() => setShowPicker(true)}
                  >
                    <AppText
                      style={[
                        styles.fieldValue,
                        {
                          color: secondarycolormode,
                        },
                      ]}
                    >
                      {getFormattedDate(values.date)}
                    </AppText>
                    <MaterialCommunityIcons
                      name="reload"
                      size={16}
                      color={secondarycolormode}
                      style={{ marginLeft: 5 }}
                    />
                  </TouchableOpacity>
                  {showPicker && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={values.date}
                      mode={"date"}
                      is24Hour={true}
                      display="default"
                      onChange={onChangeDate}
                      textColor={titlecolor}
                    />
                  )}
                </View>
                {touched.date && errors.date && (
                  <AppText style={styles.errorText}>
                    {errors.date as string}
                  </AppText>
                )}
                <View
                  style={[
                    styles.fieldContainer,
                    {
                      borderBottomColor: textinputcolor,
                    },
                  ]}
                >
                  <AppText style={[styles.fieldLabel, { color: titlecolor }]}>
                    Amount
                  </AppText>
                  <TextInput
                    style={[styles.textInput, { color: titlecolor }]}
                    placeholder="0.00"
                    placeholderTextColor={secondarycolormode}
                    keyboardType="numeric"
                    value={values.amount}
                    onChangeText={handleChange("amount")}
                    onBlur={handleBlur("amount")}
                  />
                </View>
                {touched.amount && errors.amount && (
                  <AppText style={styles.errorText}>{errors.amount}</AppText>
                )}
                {values.activeTab !== "Transfer" && (
                  <>
                    <View
                      style={[
                        styles.fieldContainer,
                        {
                          borderBottomColor: textinputcolor,
                        },
                      ]}
                    >
                      <AppText
                        style={[styles.fieldLabel, { color: titlecolor }]}
                      >
                        Category
                      </AppText>
                      <TouchableOpacity
                        style={styles.fieldValueContainer}
                        onPress={() => fetchAndOpenSelectionModal("category")}
                      >
                        <AppText
                          style={[
                            [
                              styles.fieldValue,
                              {
                                color: titlecolor,
                              },
                            ],
                            !values.category && [
                              styles.placeholderText,
                              {
                                color: secondarycolormode,
                              },
                            ],
                          ]}
                        >
                          {values.category || "Select Category"}
                        </AppText>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          color={secondarycolormode}
                          size={16}
                          style={{ marginLeft: 10 }}
                        />
                      </TouchableOpacity>
                    </View>
                    {touched.category && errors.category && (
                      <AppText style={styles.errorText}>
                        {errors.category}
                      </AppText>
                    )}
                  </>
                )}
                <View
                  style={[
                    styles.fieldContainer,
                    {
                      borderBottomColor: textinputcolor,
                    },
                  ]}
                >
                  <AppText style={[styles.fieldLabel, { color: titlecolor }]}>
                    Account
                  </AppText>
                  <TouchableOpacity
                    style={styles.fieldValueContainer}
                    onPress={() => fetchAndOpenSelectionModal("account")}
                  >
                    <AppText
                      style={[
                        [styles.fieldValue, { color: titlecolor }],
                        !values.account && [
                          styles.placeholderText,
                          { color: secondarycolormode },
                        ],
                      ]}
                    >
                      {values.account || "Select Account"}
                    </AppText>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      color={secondarycolormode}
                      size={16}
                      style={{ marginLeft: 10 }}
                    />
                  </TouchableOpacity>
                </View>
                {touched.account && errors.account && (
                  <AppText style={styles.errorText}>{errors.account}</AppText>
                )}
                <View
                  style={[
                    styles.fieldContainer,
                    {
                      borderBottomColor: textinputcolor,
                    },
                  ]}
                >
                  <AppText style={[styles.fieldLabel, { color: titlecolor }]}>
                    Description
                  </AppText>
                  <TextInput
                    style={[styles.textInput, { color: titlecolor }]}
                    placeholder="Enter Description"
                    placeholderTextColor={secondarycolormode}
                    value={values.description}
                    onChangeText={handleChange("description")}
                    onBlur={handleBlur("description")}
                  />
                </View>
                {touched.description && errors.description && (
                  <AppText style={styles.errorText}>
                    {errors.description}
                  </AppText>
                )}

                <View style={styles.camerasection}>
                  <AppText style={[styles.cameraText, { color: titlecolor }]}>
                    Add your expense / income
                  </AppText>
                  <TouchableOpacity
                    onPress={handleCameraButtonPress}
                    style={[
                      styles.cameraButton,
                      {
                        backgroundColor: colors.secondary,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="camera-outline"
                      size={20}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View style={styles.buttonContainer}>
                {/* Delete Button - Only show when editing */}
                {isEditing && (
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.deleteButton,
                      {
                        backgroundColor: colors.danger,
                      },
                    ]}
                    onPress={handleDelete}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={24}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    { flex: isEditing ? 1.5 : 2.5 },
                  ]}
                  onPress={() => handleSubmit()}
                >
                  <AppText style={styles.buttonText}>
                    {isEditing ? "Update" : "Save"}
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.clearButton,
                    {
                      backgroundColor: secondarycolormode,
                      flex: 1,
                    },
                  ]}
                  onPress={() => resetForm()}
                >
                  <AppText style={[styles.buttonText, { color: colormode2 }]}>
                    Clear
                  </AppText>
                </TouchableOpacity>
              </View>

              <SelectionModal
                isVisible={modalVisible}
                title={getModalTitle()}
                items={selectionModalItems}
                onSelectItem={handleSelectItem}
                onClose={() => setModalVisible(false)}
                onAddPress={handleAddNew}
                onDeletePress={handleOpenRemoveModal}
              />
              <AddNewModal
                visible={addNewModalVisible}
                onClose={() => setAddNewModalVisible(false)}
                onSave={handleSaveNewItem}
                title={`Add New ${
                  modalType === "category" ? "Category" : "Account"
                }`}
              />
              <RemoveTransactionModal
                visible={removeModalVisible}
                onClose={() => setRemoveModalVisible(false)}
                onRemove={handleRemoveItem} // Pass the removal logic
                title={`Remove ${
                  modalType === "category" ? "Category" : "Account"
                }s`}
                items={selectionModalItems}
                modalType={modalType}
                activeTab={values.activeTab}
              />
            </>
          );
        }}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backIcon: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    paddingHorizontal: 10,
  },
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  fieldLabel: {
    fontWeight: "600",
    fontSize: 16,
  },
  fieldValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fieldValue: {
    fontSize: 16,
    color: colors.white,
  },
  placeholderText: {
    color: colors.light,
    fontSize: 16,
  },
  textInput: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    marginLeft: 15,
  },
  camerasection: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraButton: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
  },
  cameraText: {
    color: colors.light,
    fontSize: 18,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 15,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    flex: 1,
  },
  saveButton: {
    backgroundColor: colors.secondary,
  },
  clearButton: {
    backgroundColor: colors.dark,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 1,
    marginBottom: 10,
    textAlign: "right",
  },
});

export default TransactionForm;
