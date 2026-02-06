import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { User } from "@supabase/supabase-js";

import MainTabNavigator from "./MainTabNavigator";
import TransactionForm from "../screens/components/TransactionForm";
import { Transaction } from "../../utilities/storage";
import BudgetSettingScreen from "../screens/components/budget/BudgetSettingScreen";
import BillTransactionForm from "../screens/components/transaction/billTransactionForm";

export type AppStackParamList = {
  MainTabs: { user: User };
  TransactionForm: { dateString?: string; transaction?: Transaction };
  BillTransactionForm: { scannedItems: any[] };
  BudgetSetting: { selectedPeriod: string; initialType: "Income" | "Expense" };
  BudgetEdit: {
    category: string;
    type: "Income" | "Expense";
    initialBudget: number;
    selectedPeriod: string;
  };
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
        options={{ animation: "none" }}
      />

      <Stack.Screen
        name="BudgetSetting"
        component={BudgetSettingScreen}
        options={{ animation: "none" }}
      />

      <Stack.Screen
        name="BillTransactionForm"
        component={BillTransactionForm}
        options={{ animation: "slide_from_bottom", headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
