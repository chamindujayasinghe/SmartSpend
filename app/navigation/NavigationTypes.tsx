import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "./AppNavigator";

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { email: string };
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

export type TransactionFormProps = NativeStackScreenProps<
  AppStackParamList,
  "TransactionForm"
>;
