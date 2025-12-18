import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { supabase } from "../lib/Supabase-client-config";

export interface BudgetEntry {
  category: string;
  type: "Income" | "Expense";
  period: string;
  budget: number;
}

const getDynamicBudgetKey = async (): Promise<string | null> => {
  // Assuming supabase is imported and configured in storage.ts
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

/**
 * Saves or updates a single budget entry for a category/period combination.
 */
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

    // 1. Check if the entry already exists (same category, type, and period)
    updatedBudgets = existingBudgets.map(entry => {
      if (
        entry.category === newEntry.category &&
        entry.type === newEntry.type &&
        entry.period === newEntry.period
      ) {
        found = true;
        return newEntry; // Update the existing entry
      }
      return entry;
    });

    // 2. If it's a new entry, add it to the array
    if (!found) {
      updatedBudgets = [...existingBudgets, newEntry];
    }

    // 3. Save the full list back to AsyncStorage
    const jsonValue = JSON.stringify(updatedBudgets);
    await AsyncStorage.setItem(BUDGETS_KEY, jsonValue);

  } catch (e) {
    console.error("Failed to save budget entry", e);
    Alert.alert("Error", "Failed to save the budget.");
  }
};