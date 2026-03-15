// utilities/handlebackup.ts

import { Alert } from "react-native";
import { supabase } from "../lib/Supabase-client-config";
import {
    getTransactions,
    saveRestoredTransactions,
} from "../utilities/storage";
import { getAllBudgets, saveRestoredBudgets } from "../utilities/BudgetStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const backupDataToCloud = async (): Promise<boolean> => {
    try {
        // 1. Verify user session
        const { data: { session }, error: sessionError } = await supabase.auth
            .getSession();

        if (sessionError || !session?.user?.id) {
            Alert.alert(
                "Backup Failed",
                "You must be logged in to backup your data.",
            );
            return false;
        }

        const userId = session.user.id;

        // 2. Fetch local data from AsyncStorage
        const localTransactions = await getTransactions();
        const localBudgets = await getAllBudgets();

        // 3. Format data for Supabase (attach the user_id)
        const transactionsToBackup = localTransactions.map((tx) => ({
            id: tx.id,
            user_id: userId,
            activeTab: tx.activeTab,
            date: new Date(tx.date).toISOString(),
            amount: tx.amount,
            category: tx.category,
            account: tx.account,
            description: tx.description,
            currency: tx.currency,
        }));

        const budgetsToBackup = localBudgets.map((bg) => ({
            user_id: userId,
            category: bg.category,
            type: bg.type,
            period: bg.period,
            budget: bg.budget,
            currency: bg.currency,
            dateKey: bg.dateKey || null,
        }));

        // 4. Upload Transactions (Upsert handles both new inserts and existing updates)
        if (transactionsToBackup.length > 0) {
            const { error: txError } = await supabase
                .from("transactions")
                .upsert(transactionsToBackup, { onConflict: "id" });

            if (txError) {
                throw new Error(`Transactions error: ${txError.message}`);
            }
        }

        // 5. Upload Budgets (Wipe existing cloud budgets for this user, then insert fresh)
        if (budgetsToBackup.length > 0) {
            const { error: deleteError } = await supabase
                .from("budgets")
                .delete()
                .eq("user_id", userId);

            if (deleteError) {
                throw new Error(
                    `Failed to clear old budgets: ${deleteError.message}`,
                );
            }

            const { error: bgError } = await supabase
                .from("budgets")
                .insert(budgetsToBackup);

            if (bgError) throw new Error(`Budgets error: ${bgError.message}`);
        }

        Alert.alert(
            "Success",
            "Your financial data has been backed up securely.",
        );
        return true;
    } catch (error: any) {
        console.error("Backup process failed:", error);
        Alert.alert(
            "Backup Error",
            error.message || "An unexpected error occurred.",
        );
        return false;
    }
};

export const restoreDataFromCloud = async (): Promise<boolean> => {
    try {
        const { data: { session }, error: sessionError } = await supabase.auth
            .getSession();

        if (sessionError || !session?.user?.id) {
            Alert.alert(
                "Restore Failed",
                "You must be logged in to restore your data.",
            );
            return false;
        }

        const userId = session.user.id;

        // 1. Fetch Transactions from Supabase
        const { data: cloudTransactions, error: txError } = await supabase
            .from("transactions")
            .select("*")
            .eq("user_id", userId);

        if (txError) {
            throw new Error(`Failed to fetch transactions: ${txError.message}`);
        }

        // 2. Fetch Budgets from Supabase
        const { data: cloudBudgets, error: bgError } = await supabase
            .from("budgets")
            .select("*")
            .eq("user_id", userId);

        if (bgError) {
            throw new Error(`Failed to fetch budgets: ${bgError.message}`);
        }

        // 3. Format data to match your local interfaces
        const localTransactions = (cloudTransactions || []).map((tx) => ({
            id: tx.id,
            activeTab: tx.activeTab,
            date: tx.date, // Ensure your app handles stringified dates if needed
            amount: tx.amount,
            category: tx.category,
            account: tx.account,
            description: tx.description,
            currency: tx.currency,
        }));

        const localBudgets = (cloudBudgets || []).map((bg) => ({
            category: bg.category,
            type: bg.type,
            period: bg.period,
            budget: bg.budget,
            currency: bg.currency,
            dateKey: bg.dateKey || undefined,
        }));

        // 4. Save to local storage using your new helper functions!
        await saveRestoredTransactions(localTransactions);
        await saveRestoredBudgets(localBudgets);

        Alert.alert(
            "Success",
            "Your financial data has been successfully restored!",
        );
        return true;
    } catch (error: any) {
        console.error("Restore process failed:", error);
        Alert.alert(
            "Restore Error",
            error.message || "An unexpected error occurred.",
        );
        return false;
    }
};
