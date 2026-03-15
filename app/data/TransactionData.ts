import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

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

    const combinedSet = new Set([...defaultItems, ...customItems]);
    return Array.from(combinedSet);
  } catch (e) {
    console.error(`Failed to fetch ${type} items`, e);
    return type === "account"
      ? DEFAULT_ACCOUNT_TYPES
      : type === "income"
      ? DEFAULT_INCOME_CATEGORIES
      : DEFAULT_EXPENSE_CATEGORIES;
  }
};

export const saveNewItem = async (
  type: "account" | "income" | "expense",
  newItem: string,
): Promise<void> => {
  try {
    const KEY = getCustomDataKey(type);

    const currentItems = await getItems(type);

    if (
      currentItems.map((item) => item.toLowerCase()).includes(
        newItem.toLowerCase(),
      )
    ) {
      Alert.alert("Duplicate Item", `${newItem} already exists.`);
      return;
    }

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
    const KEY = getCustomDataKey(type);

    const jsonValue = await AsyncStorage.getItem(KEY);

    const customItems: string[] = jsonValue ? JSON.parse(jsonValue) : [];

    const updatedCustomItems = customItems.filter(
      (item) => item.toLowerCase() !== itemToDelete.toLowerCase(),
    );

    const newJsonValue = JSON.stringify(updatedCustomItems);
    await AsyncStorage.setItem(KEY, newJsonValue);

    Alert.alert("Success", `${itemToDelete} removed successfully!`);
  } catch (e) {
    console.error(`Failed to delete ${type} item`, e);
    Alert.alert("Error", `Failed to delete ${itemToDelete}.`);
  }
};

export {
  getItems as getAccountTypes,
  getItems as getExpenseCategories,
  getItems as getIncomeCategories,
};
