import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  TextInput,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import AppText from "../components/AppText";
import AppErrorText from "../components/AppErrorText";
import { ForgotPasswordScreenProps } from "../navigation/NavigationTypes";
import {
  sendResetPasswordEmail,
  verifyResetPasswordOtp,
} from "../../Authentication/HandleForgotPassword";
import { useThemeColors } from "../../config/theme/colorMode";
import { ServerStatus } from "../../Authentication/HandleSignIn";
import colors from "../../config/colors";
import AppButton from "../components/AppButton";
import AppTextInput from "../components/AppTextInput";
import AsyncStorage from "@react-native-async-storage/async-storage";

const validationSchema = yup.object().shape({
  email: yup.string().required("Email is required").email("Invalid email"),
  otp: yup.string(),
});

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [otpVisible, setOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    placeholder,
    textinputcolor,
    secondarycolormode,
    colormode1,
    colormode2,
  } = useThemeColors();

  const handleSendEmail = async (values: any, setFieldTouched: any) => {
    setFieldTouched("email", true);
    if (!values.email) return;

    const success = await sendResetPasswordEmail(
      values.email,
      setStatus,
      setLoading
    );
    if (success) {
      setOtpVisible(true);
    }
  };

  const handleConfirmOtp = async (values: any) => {
    if (!values.otp || values.otp.length < 6) {
      setStatus({ type: "error", message: "Please enter a valid 6-digit OTP" });
      return;
    }

    await AsyncStorage.setItem("is_resetting_password", "true");

    const success = await verifyResetPasswordOtp(
      values.email,
      values.otp,
      setStatus,
      setLoading
    );

    if (success) {
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Formik
          initialValues={{ email: "", otp: "" }}
          validationSchema={validationSchema}
          onSubmit={() => {}}
        >
          {({ handleChange, values, errors, touched, setFieldTouched }) => (
            <>
              <AppText style={[styles.title, { color: colormode1 }]}>
                Reset Password
              </AppText>
              <AppText style={[styles.subtitle, { color: secondarycolormode }]}>
                Enter your email to receive a verification code
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

              {/* --- Row Container for Email and Send Button --- */}
              <View style={styles.rowContainer}>
                <View style={styles.inputWrapper}>
                  <TextInput
                    placeholder="Enter Email"
                    keyboardType="email-address"
                    onBlur={() => setFieldTouched("email")}
                    onChangeText={handleChange("email")}
                    autoCapitalize="none"
                    style={[
                      styles.defaultTextInput,
                      { backgroundColor: textinputcolor, color: colormode1 },
                    ]}
                    placeholderTextColor={placeholder}
                    value={values.email}
                    editable={!otpVisible}
                  />
                </View>

                <View style={styles.sendButtonWrapper}>
                  {loading && !otpVisible ? (
                    <ActivityIndicator
                      color={colors.secondary}
                      style={{ alignSelf: "center" }}
                    />
                  ) : (
                    <TouchableOpacity
                      style={styles.defaultButton}
                      onPress={() => handleSendEmail(values, setFieldTouched)}
                      disabled={loading}
                    >
                      <Text style={styles.defaultButtonText}>
                        {otpVisible ? "Resend" : "Send"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.errorContainer}>
                <AppErrorText visible={touched.email}>
                  {errors.email}
                </AppErrorText>
              </View>

              {otpVisible && (
                <View style={styles.otpContainer}>
                  <AppTextInput
                    icon="numeric"
                    placeholder="Enter 6-digit OTP"
                    keyboardType="number-pad"
                    onChangeText={handleChange("otp")}
                    placeholderTextColor={placeholder}
                    maxLength={6}
                    style={{ backgroundColor: textinputcolor }}
                  />

                  {loading ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.secondary}
                      style={{ marginTop: 20 }}
                    />
                  ) : (
                    <AppButton
                      title="Confirm"
                      textColor={colors.white}
                      onPress={() => handleConfirmOtp(values)}
                    />
                  )}
                </View>
              )}

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>Back to Login</Text>
              </TouchableOpacity>
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
    padding: 30,
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
    color: colors.light,
    marginBottom: 20,
    textAlign: "center",
  },
  statusMessage: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
  },
  errorText: {
    color: colors.error,
  },
  infoText: {
    color: colors.success,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
  },
  sendButtonWrapper: {
    width: 80,
    height: 50,
    justifyContent: "center",
  },
  defaultTextInput: {
    borderRadius: 10,
    padding: 15,
    width: "100%",
    fontSize: 18,
  },
  defaultButton: {
    backgroundColor: colors.secondary,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    height: 45,
    paddingVertical: 12,
    paddingHorizontal: 10,
    width: "100%",
  },
  confirmButton: {
    marginTop: 20,
  },
  defaultButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  errorContainer: {
    width: "100%",
    marginBottom: 10,
  },
  otpContainer: {
    width: "100%",
    marginTop: 10,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: colors.secondary,
    textDecorationLine: "underline",
    fontSize: 14,
  },
});

export default ForgotPasswordScreen;
