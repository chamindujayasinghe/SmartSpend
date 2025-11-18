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
  Image,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
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
import handleSignInWithGoogle from "../../Authentication/HandleGoogleAuthenticattion";
import { useThemeColors } from "../../config/theme/colorMode";
import { AntDesign } from "@expo/vector-icons";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    secondarycolormode,
    placeholdertext,
    textinputcolor,
    titlecolor,
    googlebutton,
    modal2,
  } = useThemeColors();

  const onGoogleButtonPress = async () => {
    setIsGoogleLoading(true);
    await handleSignInWithGoogle();
    setIsGoogleLoading(false);
  };
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
                <AppText style={[styles.title, { color: titlecolor }]}>
                  Welcome Back
                </AppText>
                <AppText
                  style={[styles.subtitle, { color: secondarycolormode }]}
                >
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
                  style={{ backgroundColor: textinputcolor }}
                  placeholderTextColor={placeholdertext}
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
                  style={{ backgroundColor: textinputcolor }}
                  placeholderTextColor={placeholdertext}
                />
                <AppErrorText visible={touched.password}>
                  {errors.password}
                </AppErrorText>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword")}
                  style={styles.forgotPasswordWrapper}
                >
                  <Text
                    style={[
                      styles.forgotPasswordText,
                      { color: secondarycolormode },
                    ]}
                  >
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
                    textColor={colors.white}
                  />
                )}
                <View style={styles.dividerContainer}>
                  <View
                    style={[
                      styles.dividerLine,
                      {
                        backgroundColor: secondarycolormode,
                      },
                    ]}
                  />
                  <Text
                    style={[styles.dividerText, { color: secondarycolormode }]}
                  >
                    OR
                  </Text>
                  <View
                    style={[
                      styles.dividerLine,
                      {
                        backgroundColor: secondarycolormode,
                      },
                    ]}
                  />
                </View>

                <AppButton
                  title="Continue with Google"
                  style={{
                    marginTop: 5,
                    backgroundColor: googlebutton,
                    shadowColor: colors.white,
                  }}
                  textColor={modal2}
                  onPress={onGoogleButtonPress}
                  disabled={isSubmitting || isGoogleLoading}
                  iconComponent={
                    <Image
                      source={require("../../assets/google.png")}
                      style={styles.googleImage}
                    />
                  }
                />
                <View style={styles.signupWrapper}>
                  <AppText
                    style={[styles.signupText, { color: secondarycolormode }]}
                  >
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
    fontSize: 14,
    textDecorationLine: "underline",
  },
  signupWrapper: {
    alignSelf: "flex-end",
    marginTop: 15,
    flexDirection: "row",
  },
  signupText: {
    fontSize: 18,
    color: colors.light,
  },
  statusMessage: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: "100%",
    textAlign: "center",
  },
  errorText: {
    color: colors.error,
  },
  successText: {
    color: colors.success,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
    color: colors.light,
    fontSize: 14,
  },
  googleImage: {
    width: 20,
    height: 20,
    marginRight: 20,
  },
});

export default Login;
