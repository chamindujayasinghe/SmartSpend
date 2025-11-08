import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "@supabase/supabase-js";

import MainTabNavigator from "./MainTabNavigator";
import TransactionForm from "../screens/components/TransactionForm";

export type AppStackParamList = {
  MainTabs: { user: User };
  TransactionForm: { dateString: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

interface AppNavigatorProps {
  user: User;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({ user }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {(props) => <MainTabNavigator {...props} user={user} />}
      </Stack.Screen>

      <Stack.Screen
        name="TransactionForm"
        component={TransactionForm}
        options={{ animation: "slide_from_bottom" }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
