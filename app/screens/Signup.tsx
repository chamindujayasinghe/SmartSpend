import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as yup from "yup";
import { SignupScreenProps } from "../navigation/NavigationTypes";
import AppText from "../components/AppText";
import colors from "../../config/colors";
import { Formik } from "formik";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import AppErrorText from "../components/AppErrorText";
import handleSignUp, { ServerStatus } from "../../Authentication/HandleSignUp";

const validationSchema = yup.object().shape({
  firstname: yup
    .string()
    .required("Please enter the firstname")
    .label("First Name"),
  lastname: yup
    .string()
    .required("Please enter the lastname")
    .label("Last Name"),
  email: yup
    .string()
    .email()
    .required("Please enter an email")
    .label("Email")
    .lowercase(),
  password: yup
    .string()
    .required("Please enter a password")
    .min(6)
    .max(12)
    .matches(/(.*\d.*){2,}/, "Password must contain at least 2 numbers")
    .label("Password"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), undefined], "Passwords must match")
    .required("Please confirm your password")
    .label("Confirm Password"),
});

const Signup = ({ navigation }: SignupScreenProps) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AppText style={styles.title}>Welcome to Smart Spend</AppText>
          <AppText style={styles.subtitle}>Create your free account.</AppText>
          {status && (
            <AppText
              style={[
                styles.statusMessage,
                status.type === "error" ? styles.errorText : styles.successText,
              ]}
            >
              {status.message}
            </AppText>
          )}
          <Formik
            initialValues={{
              firstname: "",
              lastname: "",
              email: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={(values, actions) =>
              handleSignUp(values, { ...actions, setStatus }, navigation)
            }
            validationSchema={validationSchema}
          >
            {({
              handleChange,
              handleSubmit,
              errors,
              setFieldTouched,
              touched,
              isSubmitting,
            }) => (
              <>
                <AppTextInput
                  icon="account"
                  keyboardType="default"
                  placeholder="Enter First Name"
                  onChangeText={handleChange("firstname")}
                  onBlur={() => setFieldTouched("firstname")}
                />
                <AppErrorText visible={touched.firstname}>
                  {errors.firstname}
                </AppErrorText>
                <AppTextInput
                  icon="account"
                  keyboardType="default"
                  placeholder="Enter your Last Name"
                  onChangeText={handleChange("lastname")}
                  onBlur={() => setFieldTouched("lastname")}
                />
                <AppErrorText visible={touched.lastname}>
                  {errors.lastname}
                </AppErrorText>
                <AppTextInput
                  icon="email"
                  keyboardType="default"
                  placeholder="Enter Your Email"
                  onChangeText={handleChange("email")}
                  onBlur={() => setFieldTouched("email")}
                />
                <AppErrorText visible={touched.email}>
                  {errors.email}
                </AppErrorText>
                <AppTextInput
                  isPassword
                  icon="lock"
                  keyboardType="default"
                  placeholder="Enter A Password"
                  onChangeText={handleChange("password")}
                  onBlur={() => setFieldTouched("password")}
                />
                <AppErrorText visible={touched.password}>
                  {errors.password}
                </AppErrorText>
                <AppTextInput
                  isPassword
                  icon="lock"
                  keyboardType="default"
                  placeholder="Confirm Password"
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={() => setFieldTouched("confirmPassword")}
                />
                <AppErrorText visible={touched.confirmPassword}>
                  {errors.confirmPassword}
                </AppErrorText>

                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.secondary}
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <AppButton
                    title="Signup"
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  />
                )}
                <View style={styles.signinWrapper}>
                  <AppText style={styles.signinText}>
                    Already have an account?
                  </AppText>
                  <TouchableOpacity
                    style={{ paddingLeft: 5 }}
                    onPress={() => navigation.navigate("Login")}
                  >
                    <Text
                      style={[
                        styles.signinText,
                        {
                          color: colors.secondary,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      login
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: 30,
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.light,
    marginBottom: 20,
  },
  signinWrapper: {
    alignSelf: "flex-end",
    marginTop: 15,
    flexDirection: "row",
  },
  signinText: {
    fontSize: 14,
    color: colors.light,
  },
  statusMessage: {
    width: "80%",
    textAlign: "center",
    fontWeight: "bold",
    flexWrap: "wrap",
  },
  errorText: {
    color: colors.error,
    fontSize: 17,
  },
  successText: {
    color: colors.success,
    fontSize: 17,
  },
});

export default Signup;
