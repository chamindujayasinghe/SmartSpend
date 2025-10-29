import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from "react-native";
import { Formik } from "formik";
import * as yup from "yup";
import { useState } from "react";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import AppErrorText from "../components/AppErrorText";
import { ForgotPasswordScreenProps } from "../navigation/NavigationTypes";
import handleForgotPassword from "../../Authentication/HandleForgotPassword";
import { ServerStatus } from "../../Authentication/HandleSignIn";
import colors from "../../config/colors";

const validationSchema = yup.object().shape({
  email: yup.string().required().email().label("Email"),
});

const ForgotPasswordScreen = ({ navigation }: ForgotPasswordScreenProps) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Formik
          initialValues={{ email: "" }}
          onSubmit={(values, actions) =>
            handleForgotPassword(values, { ...actions, setStatus })
          }
          validationSchema={validationSchema}
        >
          {({
            handleChange,
            handleSubmit,
            errors,
            touched,
            setFieldTouched,
            isSubmitting,
          }) => (
            <>
              <AppText style={styles.title}>Reset Password</AppText>
              <AppText style={styles.subtitle}>
                Enter your email to receive a reset link
              </AppText>

              {status && (
                <AppText
                  style={[
                    styles.statusMessage,
                    status.type === "error"
                      ? styles.errorText
                      : status.type === "info"
                      ? styles.infoText
                      : styles.successText,
                  ]}
                >
                  {status.message}
                </AppText>
              )}

              <AppTextInput
                icon="email"
                placeholder="Enter Email"
                keyboardType="email-address"
                onBlur={() => setFieldTouched("email")}
                onChangeText={handleChange("email")}
                autoCapitalize="none"
              />
              <AppErrorText visible={touched.email}>
                {errors.email}
              </AppErrorText>

              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color={colors.secondary}
                  style={{ marginTop: 20 }}
                />
              ) : (
                <AppButton
                  title="Send Reset Link"
                  onPress={() => handleSubmit()}
                  disabled={isSubmitting}
                  style={{ marginTop: 20 }}
                />
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
  successText: {
    color: colors.success,
  },
  infoText: {
    color: colors.success,
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
