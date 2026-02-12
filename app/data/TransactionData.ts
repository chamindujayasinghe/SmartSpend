import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

// --- Default Data ---
export const DEFAULT_ACCOUNT_TYPES = ["Bank Accounts", "Card", "Cash"];
export const DEFAULT_INCOME_CATEGORIES = [
  "Allowance",
  "Salary",
  "Bonus",
  "Petty Cash",
];
export const DEFAULT_EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Clothes",
  "Groceries",
  "Sports",
  "Drinks",
  "Others",
];

const CUSTOM_ACCOUNTS_KEY = "@custom_accounts";
const CUSTOM_INCOME_CATEGORIES_KEY = "@custom_income_categories";
const CUSTOM_EXPENSE_CATEGORIES_KEY = "@custom_expense_categories";

const getCustomDataKey = (type: "account" | "income" | "expense"): string => {
  switch (type) {
    case "account":
      return CUSTOM_ACCOUNTS_KEY;
    case "income":
      return CUSTOM_INCOME_CATEGORIES_KEY;
    case "expense":
      return CUSTOM_EXPENSE_CATEGORIES_KEY;
    default:
      throw new Error("Invalid custom data type");
  }
};

export const getItems = async (
  type: "account" | "income" | "expense",
): Promise<string[]> => {
  try {
    const KEY = getCustomDataKey(type);
    const defaultItems = type === "account"
      ? DEFAULT_ACCOUNT_TYPES
      : type === "income"
      ? DEFAULT_INCOME_CATEGORIES
      : DEFAULT_EXPENSE_CATEGORIES;

    const jsonValue = await AsyncStorage.getItem(KEY);
    const customItems: string[] = jsonValue ? JSON.parse(jsonValue) : [];

    // Combine default items and custom items, ensuring no duplicates
    const combinedSet = new Set([...defaultItems, ...customItems]);
    return Array.from(combinedSet);
  } catch (e) {
    console.error(`Failed to fetch ${type} items`, e);
    // Fallback to only default items on error
    return type === "account"
      ? DEFAULT_ACCOUNT_TYPES
      : type === "income"
      ? DEFAULT_INCOME_CATEGORIES
      : DEFAULT_EXPENSE_CATEGORIES;
  }
};

/**
 * Saves a new item (category or account) to AsyncStorage.
 * @param type The type of data to save ("account", "income", or "expense").
 * @param newItem The string value to save.
 */
export const saveNewItem = async (
  type: "account" | "income" | "expense",
  newItem: string,
): Promise<void> => {
  try {
    const KEY = getCustomDataKey(type);

    // Fetch all current items (defaults + custom). We only update custom list in storage.
    const currentItems = await getItems(type);

    // Check for duplicates before saving.
    if (
      currentItems.map((item) => item.toLowerCase()).includes(
        newItem.toLowerCase(),
      )
    ) {
      Alert.alert("Duplicate Item", `${newItem} already exists.`);
      return;
    }

    // Get only the *custom* items list (which is stored in AsyncStorage)
    const jsonValue = await AsyncStorage.getItem(KEY);
    const customItems: string[] = jsonValue ? JSON.parse(jsonValue) : [];

    const updatedCustomItems = [...customItems, newItem];
    const newJsonValue = JSON.stringify(updatedCustomItems);

    await AsyncStorage.setItem(KEY, newJsonValue);
    Alert.alert("Success", `${newItem} saved successfully!`);
  } catch (e) {
    console.error(`Failed to save new ${type} item`, e);
    Alert.alert("Error", `Failed to save ${newItem}.`);
  }
};
export const deleteCustomItem = async (
  type: "account" | "income" | "expense",
  itemToDelete: string,
): Promise<void> => {
  try {
    const KEY = getCustomDataKey(type); // Assuming getCustomDataKey exists from previous step

    // 1. Fetch the custom items (stored list)
    const jsonValue = await AsyncStorage.getItem(KEY);
    // Assume customItems only contains custom entries, NOT the defaults
    const customItems: string[] = jsonValue ? JSON.parse(jsonValue) : [];

    // 2. Filter out the item to delete (case-insensitive check)
    const updatedCustomItems = customItems.filter(
      (item) => item.toLowerCase() !== itemToDelete.toLowerCase(),
    );

    // 3. Save the updated list
    const newJsonValue = JSON.stringify(updatedCustomItems);
    await AsyncStorage.setItem(KEY, newJsonValue);

    Alert.alert("Success", `${itemToDelete} removed successfully!`);
  } catch (e) {
    console.error(`Failed to delete ${type} item`, e);
    Alert.alert("Error", `Failed to delete ${itemToDelete}.`);
  }
};

// Re-export the utility functions for use in the component
// The component will use getItems/saveNewItem instead of the static arrays
export {
  getItems as getAccountTypes,
  getItems as getExpenseCategories,
  getItems as getIncomeCategories,
};
