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
  ACCOUNT_TYPES,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "../../data/TransactionData";
import SelectionModal from "./SelectionModal";
import TransactionTypeTabs from "./TransactionTypeTabs";
import { saveTransaction, deleteTransaction } from "../../../utilities/storage"; // Import deleteTransaction
import { useTheme } from "../../../config/theme/ThemeProvider";

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

const handleCameraButtonPress = () => {
  Alert.alert("Camera", "Open camera or gallery to attach an image.");
};

const TransactionForm: React.FC<TransactionFormProps> = ({ route }) => {
  const { isLightMode } = useTheme();
  const navigation = useNavigation();
  const { dateString, transaction } = route.params;

  const [showPicker, setShowPicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"category" | "account" | null>(
    null
  );
  const [isCameraPressed, setIsCameraPressed] = useState(false);

  const isEditing = !!transaction;

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
        isEditing ? "Transaction updated!" : "Transaction saved!"
      );
      console.log("Form Submitted and Saved:", transactionData);
      resetForm();

      navigation.goBack();
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert(
        "Error",
        `Could not ${isEditing ? "update" : "save"} transaction.`
      );
    }
  };

  // Add delete function
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
      ]
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
            color={isLightMode ? colors.brown : colors.white}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <AppText
          style={[
            styles.headerText,
            { color: isLightMode ? colors.brown : colors.white },
          ]}
        >
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
          const onChangeDate = (event: any, selectedDate?: Date) => {
            setShowPicker(false);
            if (selectedDate) {
              setFieldValue("date", selectedDate);
            }
          };

          const getModalItems = () => {
            if (modalType === "account") {
              return ACCOUNT_TYPES;
            }
            if (modalType === "category") {
              return values.activeTab === "Income"
                ? INCOME_CATEGORIES
                : EXPENSE_CATEGORIES;
            }
            return [];
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
                      borderBottomColor: isLightMode
                        ? colors.darkbrown
                        : colors.dark,
                    },
                  ]}
                >
                  <AppText
                    style={[
                      styles.fieldLabel,
                      { color: isLightMode ? colors.brown : colors.white },
                    ]}
                  >
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
                          color: isLightMode ? colors.darkbrown : colors.light,
                        },
                      ]}
                    >
                      {getFormattedDate(values.date)}
                    </AppText>
                    <MaterialCommunityIcons
                      name="reload"
                      size={16}
                      color={colors.light}
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
                      textColor={isLightMode ? colors.lightbrown : colors.white}
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
                      borderBottomColor: isLightMode
                        ? colors.darkbrown
                        : colors.dark,
                    },
                  ]}
                >
                  <AppText
                    style={[
                      styles.fieldLabel,
                      { color: isLightMode ? colors.brown : colors.white },
                    ]}
                  >
                    Amount
                  </AppText>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isLightMode ? colors.brown : colors.white },
                    ]}
                    placeholder="0.00"
                    placeholderTextColor={
                      isLightMode ? colors.darkbrown : colors.light
                    }
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
                          borderBottomColor: isLightMode
                            ? colors.darkbrown
                            : colors.dark,
                        },
                      ]}
                    >
                      <AppText
                        style={[
                          styles.fieldLabel,
                          { color: isLightMode ? colors.brown : colors.white },
                        ]}
                      >
                        Category
                      </AppText>
                      <TouchableOpacity
                        style={styles.fieldValueContainer}
                        onPress={() => {
                          setModalType("category");
                          setModalVisible(true);
                        }}
                      >
                        <AppText
                          style={[
                            [
                              styles.fieldValue,
                              {
                                color: isLightMode
                                  ? colors.brown
                                  : colors.white,
                              },
                            ],
                            !values.category && [
                              styles.placeholderText,
                              {
                                color: isLightMode
                                  ? colors.darkbrown
                                  : colors.light,
                              },
                            ],
                          ]}
                        >
                          {values.category || "Select Category"}
                        </AppText>
                        <MaterialCommunityIcons
                          name="chevron-down"
                          color={colors.light}
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
                      borderBottomColor: isLightMode
                        ? colors.darkbrown
                        : colors.dark,
                    },
                  ]}
                >
                  <AppText
                    style={[
                      styles.fieldLabel,
                      { color: isLightMode ? colors.brown : colors.white },
                    ]}
                  >
                    Account
                  </AppText>
                  <TouchableOpacity
                    style={styles.fieldValueContainer}
                    onPress={() => {
                      setModalType("account");
                      setModalVisible(true);
                    }}
                  >
                    <AppText
                      style={[
                        [
                          styles.fieldValue,
                          {
                            color: isLightMode ? colors.brown : colors.white,
                          },
                        ],
                        !values.account && [
                          styles.placeholderText,
                          {
                            color: isLightMode
                              ? colors.darkbrown
                              : colors.light,
                          },
                        ],
                      ]}
                    >
                      {values.account || "Select Account"}
                    </AppText>
                    <MaterialCommunityIcons
                      name="chevron-down"
                      color={colors.light}
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
                      borderBottomColor: isLightMode
                        ? colors.darkbrown
                        : colors.dark,
                    },
                  ]}
                >
                  <AppText
                    style={[
                      styles.fieldLabel,
                      { color: isLightMode ? colors.brown : colors.white },
                    ]}
                  >
                    Description
                  </AppText>
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: isLightMode ? colors.brown : colors.white },
                    ]}
                    placeholder="Enter Description"
                    placeholderTextColor={
                      isLightMode ? colors.darkbrown : colors.light
                    }
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
                  <AppText
                    style={[
                      styles.cameraText,
                      { color: isLightMode ? colors.brown : colors.light },
                    ]}
                  >
                    Add your expense / income
                  </AppText>
                  <TouchableOpacity
                    onPress={handleCameraButtonPress}
                    onPressIn={() => setIsCameraPressed(true)}
                    onPressOut={() => setIsCameraPressed(false)}
                    style={[
                      styles.cameraButton,
                      {
                        backgroundColor: isCameraPressed
                          ? colors.secondary
                          : isLightMode
                          ? colors.lightbrown
                          : colors.dark,
                        borderColor: isCameraPressed
                          ? colors.secondary
                          : isLightMode
                          ? colors.brown
                          : colors.light,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="camera-outline"
                      size={20}
                      color={
                        isCameraPressed
                          ? colors.white
                          : isLightMode
                          ? colors.brown
                          : colors.white
                      }
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
                        backgroundColor: isLightMode
                          ? colors.danger
                          : colors.danger,
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
                  style={[styles.button, styles.saveButton]}
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
                      backgroundColor: isLightMode
                        ? colors.darkbrown
                        : colors.dark,
                    },
                  ]}
                  onPress={() => resetForm()}
                >
                  <AppText style={styles.buttonText}>Clear</AppText>
                </TouchableOpacity>
              </View>

              <SelectionModal
                isVisible={modalVisible}
                title={getModalTitle()}
                items={getModalItems()}
                onSelectItem={handleSelectItem}
                onClose={() => setModalVisible(false)}
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
    borderWidth: 2,
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
    gap: 10, // Add gap between buttons
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50, // Ensure consistent height
  },
  deleteButton: {
    backgroundColor: colors.danger,
    flex: 0.5, // Make delete button smaller
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
