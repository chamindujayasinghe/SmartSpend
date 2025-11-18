import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import AppText from "../components/AppText";
import AppErrorText from "../components/AppErrorText";
import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import { useThemeColors } from "../../config/theme/colorMode";
import colors from "../../config/colors";
import { ServerStatus } from "../../Authentication/HandleSignIn";
import { updateUserPassword } from "../../Authentication/HandleForgotPassword";
import { NewPasswordScreenProps } from "../navigation/NavigationTypes";
import AsyncStorage from "@react-native-async-storage/async-storage";

const validationSchema = yup.object().shape({
  password: yup
    .string()
    .required("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: yup
    .string()
    .required("Please confirm your password")
    .oneOf([yup.ref("password")], "Passwords must match"),
});

type Props = NewPasswordScreenProps;

const NewPasswordScreen = ({ navigation }: Props) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { titlecolor, secondarycolormode, placeholdertext, textinputcolor } =
    useThemeColors();

  const handlePasswordReset = async (values: any) => {
    const success = await updateUserPassword(
      values.password,
      setStatus,
      setLoading
    );

    if (success) {
      await AsyncStorage.removeItem("is_resetting_password");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Formik
          initialValues={{ password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handlePasswordReset}
        >
          {({
            handleChange,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldTouched,
          }) => (
            <>
              <AppText style={[styles.title, { color: titlecolor }]}>
                New Password
              </AppText>
              <AppText style={[styles.subtitle, { color: secondarycolormode }]}>
                Set your new password below
              </AppText>

              {status && (
                <AppText
                  style={[
                    styles.statusMessage,
                    status.type === "error"
                      ? styles.errorText
                      : styles.infoText,
                  ]}
                >
                  {status.message}
                </AppText>
              )}

              <View style={styles.inputContainer}>
                <AppTextInput
                  icon="lock"
                  placeholder="New Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  isPassword={true}
                  onBlur={() => setFieldTouched("password")}
                  onChangeText={handleChange("password")}
                  value={values.password}
                  style={{ backgroundColor: textinputcolor }}
                  placeholderTextColor={placeholdertext}
                />
                <AppErrorText visible={touched.password}>
                  {errors.password}
                </AppErrorText>

                <AppTextInput
                  icon="lock-check"
                  placeholder="Confirm Password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  isPassword={true}
                  style={{ backgroundColor: textinputcolor }}
                  onBlur={() => setFieldTouched("confirmPassword")}
                  onChangeText={handleChange("confirmPassword")}
                  value={values.confirmPassword}
                  placeholderTextColor={placeholdertext}
                />
                <AppErrorText visible={touched.confirmPassword}>
                  {errors.confirmPassword}
                </AppErrorText>
              </View>

              {loading ? (
                <ActivityIndicator
                  size="large"
                  color={colors.secondary}
                  style={styles.loader}
                />
              ) : (
                <View style={styles.buttonContainer}>
                  <AppButton
                    title="Reset Password"
                    onPress={handleSubmit as any}
                    textColor={colors.white}
                  />
                </View>
              )}
            </>
          )}
        </Formik>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
  statusMessage: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
    overflow: "hidden",
  },
  errorText: {
    color: colors.error,
  },
  infoText: {
    color: colors.success,
  },
});

export default NewPasswordScreen;
