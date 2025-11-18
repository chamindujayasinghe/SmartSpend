import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "./AppNavigator";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string };
  NewPassword: undefined; // <--- Add this line
};

export type LoginScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "Login"
>;

export type SignupScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "Signup"
>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "ForgotPassword"
>;

// Add this Prop Type for your NewPasswordScreen
export type NewPasswordScreenProps = NativeStackScreenProps<
  AuthStackParamList,
  "NewPassword"
>;

export type TransactionFormProps = NativeStackScreenProps<
  AppStackParamList,
  "TransactionForm"
>;
