import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import colors from "../../config/colors";
import AppTextInput from "../components/AppTextInput";
import AppButton from "../components/AppButton";
import AppText from "../components/AppText";
import { Formik } from "formik";
import * as yup from "yup";
import AppErrorText from "../components/AppErrorText";
import { LoginScreenProps } from "../navigation/NavigationTypes";
import { useState } from "react";
import handleSignIn, { ServerStatus } from "../../Authentication/HandleSignIn";

const validationSchema = yup.object().shape({
  email: yup.string().required().email().label("Email"),
  password: yup
    .string()
    .required()
    .min(6)
    .max(12)
    .label("Password")
    .matches(/(.*\d.*){2,}/, "Password must contain at least 2 numbers"),
});

const Login = ({ navigation }: LoginScreenProps) => {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={(values, actions) =>
              handleSignIn(values, { ...actions, setStatus })
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
                <AppText style={styles.title}>Welcome Back</AppText>
                <AppText style={styles.subtitle}>
                  Login to your account to continue
                </AppText>
                {status && (
                  <AppText
                    style={[
                      styles.statusMessage,
                      status.type === "error"
                        ? styles.errorText
                        : styles.successText,
                    ]}
                  >
                    {status.message}
                  </AppText>
                )}
                <AppTextInput
                  icon="email"
                  placeholder="Enter Email"
                  keyboardType="default"
                  onBlur={() => setFieldTouched("email")}
                  onChangeText={handleChange("email")}
                />
                <AppErrorText visible={touched.email}>
                  {errors.email}
                </AppErrorText>
                <AppTextInput
                  icon="lock"
                  placeholder="Enter Password"
                  isPassword
                  keyboardType="default"
                  onBlur={() => setFieldTouched("password")}
                  onChangeText={handleChange("password")}
                />
                <AppErrorText visible={touched.password}>
                  {errors.password}
                </AppErrorText>
                <TouchableOpacity style={styles.forgotPasswordWrapper}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
                {isSubmitting ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.secondary}
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <AppButton
                    title="Login"
                    onPress={() => handleSubmit()}
                    disabled={isSubmitting}
                  />
                )}
                <View style={styles.signupWrapper}>
                  <AppText style={styles.signupText}>
                    Don't you have an account?
                  </AppText>
                  <TouchableOpacity
                    style={{ paddingLeft: 5 }}
                    onPress={() => navigation.navigate("Signup")}
                  >
                    <Text
                      style={[
                        styles.signupText,
                        {
                          color: colors.secondary,
                          textDecorationLine: "underline",
                        },
                      ]}
                    >
                      signup
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
  },
  scrollContent: {
    padding: 30,
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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
  },
  forgotPasswordWrapper: {
    alignSelf: "flex-end",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: colors.light,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  signupWrapper: {
    alignSelf: "flex-end",
    marginTop: 15,
    flexDirection: "row",
  },
  signupText: {
    fontSize: 14,
    color: colors.light,
  },
  statusMessage: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    width: "100%",
    textAlign: "center",
    fontWeight: "bold",
  },
  errorText: {
    color: "white",
    backgroundColor: "#dc2626", // Red
  },
  successText: {
    color: "white",
    backgroundColor: "#16a34a", // Green
  },
});

export default Login;
