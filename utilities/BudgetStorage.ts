// utilities/BudgetStorage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { supabase } from "../lib/Supabase-client-config";

export interface BudgetEntry {
  category: string;
  type: "Income" | "Expense";
  period: string;
  budget: number;
  currency: string;
  dateKey?: string;
}

const getDynamicBudgetKey = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) {
    console.warn("No user session found for budget storage.");
    return null;
  }
  return `@budgets_${session.user.id}`;
};

export const getAllBudgets = async (): Promise<BudgetEntry[]> => {
  const BUDGETS_KEY = await getDynamicBudgetKey();
  if (!BUDGETS_KEY) return [];

  try {
    const jsonValue = await AsyncStorage.getItem(BUDGETS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch budgets", e);
    return [];
  }
};

export const saveBudgetEntry = async (newEntry: BudgetEntry): Promise<void> => {
  const BUDGETS_KEY = await getDynamicBudgetKey();

  if (!BUDGETS_KEY) {
    Alert.alert("Error", "User not signed in. Cannot save budget.");
    return;
  }

  try {
    const existingBudgets = await getAllBudgets();
    let updatedBudgets: BudgetEntry[];
    let found = false;

    updatedBudgets = existingBudgets.map((entry) => {
      if (
        entry.category === newEntry.category &&
        entry.type === newEntry.type &&
        entry.period === newEntry.period
      ) {
        found = true;
        return {
          ...entry,
          budget: newEntry.budget,
          currency: newEntry.currency,
        };
      }
      return entry;
    });

    if (!found) {
      updatedBudgets = [...existingBudgets, newEntry];
    }

    const jsonValue = JSON.stringify(updatedBudgets);
    await AsyncStorage.setItem(BUDGETS_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save budget entry", e);
    Alert.alert("Error", "Failed to save the budget.");
  }
};

// --- NEW FUNCTION: DELETE BUDGET ENTRY ---
export const deleteBudgetEntry = async (
  category: string,
  type: "Income" | "Expense",
  period: string,
): Promise<void> => {
  const BUDGETS_KEY = await getDynamicBudgetKey();

  if (!BUDGETS_KEY) {
    Alert.alert("Error", "User not signed in. Cannot delete budget.");
    return;
  }

  try {
    const existingBudgets = await getAllBudgets();

    // Filter OUT the entry we want to delete
    const updatedBudgets = existingBudgets.filter(
      (entry) =>
        !(
          entry.category === category &&
          entry.type === type &&
          entry.period === period
        ),
    );

    const jsonValue = JSON.stringify(updatedBudgets);
    await AsyncStorage.setItem(BUDGETS_KEY, jsonValue);
    console.log(`Deleted budget for ${category} (${period})`);
  } catch (e) {
    console.error("Failed to delete budget entry", e);
    Alert.alert("Error", "Failed to delete the budget.");
  }
};
