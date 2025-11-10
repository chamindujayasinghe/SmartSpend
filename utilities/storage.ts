import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { Alert } from "react-native";

const TRANSACTIONS_KEY = "@transactions";

interface TransactionData {
  activeTab: string;
  date: Date;
  amount: string;
  category: string;
  account: string;
  description: string;
}

export interface Transaction extends TransactionData {
  id: string;
}


export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error("Failed to fetch transactions", e);
    return [];
  }
};

export const saveTransaction = async (
  newTransaction: TransactionData
): Promise<void> => {
  try {
    const existingTransactions = await getTransactions();

    const transactionToAdd: Transaction = {
      ...newTransaction,
      id: uuidv4(),
    };

    const updatedTransactions = [...existingTransactions, transactionToAdd];

    const jsonValue = JSON.stringify(updatedTransactions);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, jsonValue);
  } catch (e) {
    console.error("Failed to save transaction", e);
    Alert.alert("Error", "Failed to save the transaction.");
  }
};