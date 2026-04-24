import React, { useState, useEffect } from "react";
import { View, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import AppText from "../../components/AppText";
import { useCurrency } from "../../../config/currencyProvider";
import { useThemeColors } from "../../../config/theme/colorMode";
import colors from "../../../config/colors";

const CurrencyConverter = () => {
  const { currency: globalCurrency } = useCurrency();
  const { titlecolor, secondarycolormode } = useThemeColors();

  const [amount, setAmount] = useState<string>("1");
  const [fromCurrency, setFromCurrency] = useState<string>(
    globalCurrency || "USD",
  );
  const [toCurrency, setToCurrency] = useState<string>("LKR");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {

    setFromCurrency(globalCurrency);
  }, [globalCurrency]);

  useEffect(() => {
    const fetchRates = async () => {
      if (!fromCurrency || !toCurrency) return;
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`,
        );
        const data = await response.json();
        if (data && data.rates && data.rates[toCurrency.toUpperCase()]) {
          setExchangeRate(data.rates[toCurrency.toUpperCase()]);
        } else {
          setExchangeRate(null);
        }
      } catch (error) {
        console.error("Error fetching exchange rates", error);
        setExchangeRate(null);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchRates();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [fromCurrency, toCurrency]);

  const convertedTotal =
    exchangeRate && amount && !isNaN(Number(amount))
      ? (parseFloat(amount) * exchangeRate).toFixed(2)
      : "0.00";

  return (
    <View style={styles.container}>
      <AppText style={[styles.headerText, { color: titlecolor }]}>
        Quick Converter
      </AppText>

      <View style={styles.converterBox}>
        {/* LEFT SIDE: User Input */}
        <View style={styles.side}>
          <TextInput
            style={[
              styles.input,
              { color: titlecolor, borderBottomColor: colors.light },
            ]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Amount"
            placeholderTextColor={colors.light}
          />
          <TextInput
            style={[styles.currencyInput, { color: secondarycolormode }]}
            value={fromCurrency}
            onChangeText={setFromCurrency}
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>

        <View style={styles.iconContainer}>
          {loading ? (
            <ActivityIndicator size="small" color={colors.secondary} />
          ) : (
            <MaterialCommunityIcons
              name="swap-horizontal"
              size={24}
              color={colors.secondary}
            />
          )}
        </View>

        <View style={styles.side}>
          <AppText style={[styles.convertedAmount, { color: titlecolor }]}>
            {convertedTotal}
          </AppText>
          <TextInput
            style={[styles.currencyInput, { color: secondarycolormode }]}
            value={toCurrency}
            onChangeText={setToCurrency}
            autoCapitalize="characters"
            maxLength={3}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(158, 158, 158, 0.2)",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
  },
  converterBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(158, 158, 158, 0.1)",
    padding: 15,
    borderRadius: 12,
  },
  side: {
    flex: 1,
    alignItems: "center",
  },
  input: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 80,
    borderBottomWidth: 1,
    paddingBottom: 5,
    marginBottom: 5,
  },
  convertedAmount: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 80,
    paddingBottom: 6,
    marginBottom: 5,
  },
  currencyInput: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 1,
  },
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CurrencyConverter;
