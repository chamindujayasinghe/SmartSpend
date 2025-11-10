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
import { saveTransaction } from "../../../utilities/storage";

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

// --- RENDER TABS FUNCTION IS REMOVED FROM HERE ---

const handleCameraButtonPress = () => {
  Alert.alert("Camera", "Open camera or gallery to attach an image.");
};

const TransactionForm: React.FC<TransactionFormProps> = ({ route }) => {
  const navigation = useNavigation();
  const { dateString } = route.params;

  const [showPicker, setShowPicker] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"category" | "account" | null>(
    null
  );

  const handleSave = async (values: any, { resetForm }: any) => {
    try {
      await saveTransaction(values);

      Alert.alert("Success", "Transaction saved!");
      console.log("Form Submitted and Saved:", values);
      resetForm();

      navigation.goBack();
    } catch (error) {
      console.error("Error saving transaction:", error);
      Alert.alert("Error", "Could not save transaction.");
    }
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
            color={colors.white}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <AppText style={styles.headerText}>New Transaction</AppText>
      </View>

      <Formik
        initialValues={{
          activeTab: "Expense",
          date: new Date(dateString),
          amount: "",
          category: "",
          account: "",
          description: "",
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
                {/* --- RENDER TABS REPLACED WITH NEW COMPONENT --- */}
                <TransactionTypeTabs
                  activeTab={values.activeTab}
                  onTabPress={(tab) => {
                    setFieldValue("activeTab", tab);
                    setFieldValue("category", ""); // Clear category on tab change
                  }}
                />

                {/* Date Field */}
                <View style={styles.fieldContainer}>
                  <AppText style={styles.fieldLabel}>Date</AppText>
                  <TouchableOpacity
                    style={styles.fieldValueContainer}
                    onPress={() => setShowPicker(true)}
                  >
                    <AppText style={styles.fieldValue}>
                      {getFormattedDate(values.date)}
                    </AppText>
                    <MaterialCommunityIcons
                      name="reload"
                      size={16}
                      color={colors.light}
                      style={{ marginLeft: 10 }}
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
                      textColor={colors.white}
                    />
                  )}
                </View>
                {touched.date && errors.date && (
                  <AppText style={styles.errorText}>
                    {errors.date as string}
                  </AppText>
                )}

                {/* Amount Field */}
                <View style={styles.fieldContainer}>
                  <AppText style={styles.fieldLabel}>Amount</AppText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="0.00"
                    placeholderTextColor={colors.light}
                    keyboardType="numeric"
                    value={values.amount}
                    onChangeText={handleChange("amount")}
                    onBlur={handleBlur("amount")}
                  />
                </View>
                {touched.amount && errors.amount && (
                  <AppText style={styles.errorText}>{errors.amount}</AppText>
                )}

                {/* Category Field */}
                {values.activeTab !== "Transfer" && (
                  <>
                    <View style={styles.fieldContainer}>
                      <AppText style={styles.fieldLabel}>Category</AppText>
                      <TouchableOpacity
                        style={styles.fieldValueContainer}
                        onPress={() => {
                          setModalType("category");
                          setModalVisible(true);
                        }}
                      >
                        <AppText
                          style={[
                            styles.fieldValue,
                            !values.category && styles.placeholderText,
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

                {/* Account Field */}
                <View style={styles.fieldContainer}>
                  <AppText style={styles.fieldLabel}>Account</AppText>
                  <TouchableOpacity
                    style={styles.fieldValueContainer}
                    onPress={() => {
                      setModalType("account");
                      setModalVisible(true);
                    }}
                  >
                    <AppText
                      style={[
                        styles.fieldValue,
                        !values.account && styles.placeholderText,
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

                {/* Description Field */}
                <View style={styles.fieldContainer}>
                  <AppText style={styles.fieldLabel}>Description</AppText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter Description"
                    placeholderTextColor={colors.light}
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
                  <AppText style={styles.cameraText}>
                    Add your expense / income
                  </AppText>
                  <TouchableOpacity
                    onPress={handleCameraButtonPress}
                    style={styles.cameraButton}
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
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={() => handleSubmit()}
                >
                  <AppText style={styles.buttonText}>Save</AppText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
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
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    paddingHorizontal: 15,
  },
  // --- TAB STYLES REMOVED FROM HERE ---
  fieldContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark,
  },
  fieldLabel: {
    fontSize: 16,
    color: colors.light,
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
    color: colors.white,
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
    backgroundColor: colors.secondary,
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
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: colors.secondary,
    marginRight: 10,
  },
  clearButton: {
    backgroundColor: colors.dark,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    textAlign: "right",
  },
});

export default TransactionForm;
