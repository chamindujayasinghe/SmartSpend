import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currencyCode: string) => Promise<void>;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, _setCurrency] = useState("USD");

  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const saved = await AsyncStorage.getItem("user_currency");
        if (saved) _setCurrency(saved);
      } catch (error) {
        console.error("Failed to load currency", error);
      }
    };
    loadCurrency();
  }, []);

  const updateCurrency = async (newCurrency: string) => {
    try {
      console.log("Saving to AsyncStorage:", newCurrency);
      _setCurrency(newCurrency);
      await AsyncStorage.setItem("user_currency", newCurrency);

      const check = await AsyncStorage.getItem("user_currency");
      console.log("Verified in Storage:", check);
    } catch (error) {
      console.error("Failed to save currency", error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: updateCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
