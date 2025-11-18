// navigation/AuthNavigator.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./NavigationTypes";
import Login from "../screens/Login";
import Signup from "../screens/Signup";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import VerifyOtpScreen from "../screens/VerifyOTPScreen";
import NewPasswordScreen from "../screens/NewPasswordScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Accept a prop to control start screen
const AuthNavigator = ({
  initialRouteName = "Login",
}: {
  initialRouteName?: keyof AuthStackParamList;
}) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor: "transparent" },
      animation: "none",
      gestureEnabled: false,
    }}
  >
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Signup" component={Signup} />
    <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
