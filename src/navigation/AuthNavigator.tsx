import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/NavigationTypes";
import Signup from "../features/Authentication/screens/Signup";
import ForgotPasswordScreen from "../features/Authentication/screens/ForgotPasswordScreen";
import NewPasswordScreen from "../features/Authentication/screens/NewPasswordScreen";
import Login from "../features/Authentication/screens/Login";
import VerifyOtpScreen from "../features/Authentication/screens/VerifyOTPScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

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
