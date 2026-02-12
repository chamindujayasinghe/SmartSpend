import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_KEY = "EXCHANGE_RATES_CACHE";
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

export const getExchangeRates = async () => {
    try {
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
            const { rates, timestamp } = JSON.parse(cachedData);
            const now = Date.now();

            if (now - timestamp < CACHE_EXPIRY) {
                console.log("Using Cached Rates (Offline Mode)");
                return rates;
            }
        }

        console.log("Fetching New Rates from API...");
        const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
        const data = await response.json();

        if (data && data.rates) {
            const ratesToSave = {
                rates: data.rates,
                timestamp: Date.now(),
            };
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(ratesToSave));
            return data.rates;
        }

        return null;
    } catch (error) {
        console.error("Exchange rate fetch failed", error);
        const cachedData = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedData) {
            return JSON.parse(cachedData).rates;
        }
        return null;
    }
};

export const convertToCurrency = (
    amount: number,
    fromCurrency: string,
    targetCurrency: string,
    rates: any,
) => {
    if (fromCurrency === targetCurrency) return amount;
    if (!rates) return amount;

    const fromRate = rates[fromCurrency];
    const targetRate = rates[targetCurrency];

    if (!fromRate || !targetRate) return amount;

    return (amount / fromRate) * targetRate;
};
