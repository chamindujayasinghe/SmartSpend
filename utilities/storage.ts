import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import { Alert } from "react-native";
import { supabase } from "../lib/Supabase-client-config";


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

const getDynamicTransactionsKey = async (): Promise<string | null> => {
const { data: { session } } = await supabase.auth.getSession();
if (!session?.user?.id) {
console.warn("No user session found for storage.");
return null;
}
return `@transactions_${session.user.id}`;
};


export const getTransactions = async (): Promise<Transaction[]> => {

const TRANSACTIONS_KEY = await getDynamicTransactionsKey();

if (!TRANSACTIONS_KEY) return [];

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
const TRANSACTIONS_KEY = await getDynamicTransactionsKey();

if (!TRANSACTIONS_KEY) {
Alert.alert("Error", "User not signed in. Cannot save transaction.");
return;
}
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