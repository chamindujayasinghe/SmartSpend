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

const validationSchema = Yup.object().shape({
  date: Yup.date().required().label("Date"),
  amount: Yup.number()
    .required("Amount is required")
    .positive("Amount must be positive")
    .typeError("Amount must be a number"),
  category: Yup.string().required("Category is required").label("Category"),
  account: Yup.string().required("Account is required").label("Account"),
  description: Yup.string().label("Description"),
});

// --- MODIFIED: This component is now inside TransactionForm or passed props ---
const renderTabs = (
  activeTab: string,
  setFieldValue: (field: string, value: any) => void
) => (
  <View style={styles.tabContainer}>
    {["Income", "Expense", "Transfer"].map((tab) => (
      <TouchableOpacity
        key={tab}
        style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
        onPress={() => setFieldValue("activeTab", tab)}
      >
        <AppText
          style={[styles.tabText, activeTab === tab && styles.activeTabText]}
        >
          {tab}
        </AppText>
      </TouchableOpacity>
    ))}
  </View>
);

const handleCameraButtonPress = () => {
  Alert.alert("Camera", "Open camera or gallery to attach an image.");
};

const TransactionForm: React.FC<TransactionFormProps> = ({ route }) => {
  const navigation = useNavigation();
  const { dateString } = route.params;

  const [showPicker, setShowPicker] = useState(false);

  const handleSave = (values: any) => {
    console.log("Form Submitted:", values);
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

          return (
            <>
              {/* Added ScrollView in case form gets long */}
              <ScrollView style={styles.body}>
                {renderTabs(values.activeTab, setFieldValue)}

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
                      value={values.date} // --- Use date from Formik values
                      mode={"date"}
                      is24Hour={true}
                      display="default"
                      onChange={onChangeDate} // --- Use the new handler
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
                <View style={styles.fieldContainer}>
                  <AppText style={styles.fieldLabel}>Category</AppText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Select Category"
                    placeholderTextColor={colors.light}
                    value={values.category}
                    onChangeText={handleChange("category")}
                    onBlur={handleBlur("category")}
                  />
                  <MaterialCommunityIcons
                    name="chevron-down"
                    color={colors.light}
                    size={16}
                  />
                </View>
                {touched.category && errors.category && (
                  <AppText style={styles.errorText}>{errors.category}</AppText>
                )}

                {/* Account Field */}
                <View style={styles.fieldContainer}>
                  <AppText style={styles.fieldLabel}>Account</AppText>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Select Account"
                    placeholderTextColor={colors.light}
                    value={values.account}
                    onChangeText={handleChange("account")}
                    onBlur={handleBlur("account")}
                  />
                  <MaterialCommunityIcons
                    name="chevron-down"
                    color={colors.light}
                    size={16}
                  />
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
            </>
          );
        }}
      </Formik>
    </View>
  );
};

// --- MODIFIED: Styles ---
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
  tabContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.dark,
    marginRight: 10,
  },
  activeTabButton: {
    borderColor: colors.secondary,
  },
  tabText: {
    color: colors.light,
  },
  activeTabText: {
    color: colors.secondary,
    fontWeight: "bold",
  },
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
  textInput: {
    flex: 1,
    textAlign: "right",
    fontSize: 16,
    color: colors.white,
    marginLeft: 15,
  },
  camerasection: {
    marginTop: 30,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
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
