import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { getSupportedCurrencies } from "react-native-format-currency";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { useThemeColors } from "../../../config/theme/colorMode";

interface CurrencySelectorProps {
  value: string;
  onSelect: (currencyCode: string) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onSelect,
}) => {
  const currencyList = useMemo(() => {
    return getSupportedCurrencies()
      .map((item) => {
        const symbol = (item as any).symbol || "";
        return {
          label: symbol ? `${item.code} (${symbol})` : item.code,
          fullName: `${item.name} (${item.code})`,
          value: item.code,
        };
      })
      .sort((a, b) => {
        if (a.value === "LKR") return -1;
        if (b.value === "LKR") return 1;
        return a.fullName.localeCompare(b.fullName);
      });
  }, []);
  const { colormode1, secondarycolormode, colormode2 } = useThemeColors();

  return (
    <View style={styles.container}>
      <Dropdown
        style={[styles.dropdown, { borderColor: colormode1 }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={[
          styles.selectedTextStyle,
          { color: secondarycolormode },
        ]}
        inputSearchStyle={styles.inputSearchStyle}
        containerStyle={[
          styles.listContainer,
          { backgroundColor: secondarycolormode },
        ]}
        itemTextStyle={[styles.itemText, {}]}
        activeColor={colors.secondary}
        data={currencyList}
        search
        searchPlaceholder="Search..."
        searchField="fullName"
        labelField="label"
        valueField="value"
        placeholder="Select"
        value={value}
        onChange={(item) => onSelect(item.value)}
        dropdownPosition="bottom"
        renderItem={(item) => (
          <View style={styles.itemCustom}>
            <AppText style={[styles.itemTextCustom, { color: colormode2 }]}>
              {item.fullName}
            </AppText>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginBottom: 10,
    alignItems: "center",
    width: "100%",
  },
  dropdown: {
    height: 45,
    width: 120,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
  },
  selectedTextStyle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  listContainer: {
    borderRadius: 12,
    marginTop: 5,
    width: 280,
    marginLeft: -80,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  placeholderStyle: {
    color: colors.light,
    fontSize: 14,
    textAlign: "center",
  },
  inputSearchStyle: {
    height: 45,
    fontSize: 15,
    borderRadius: 10,
    color: colors.black,
    backgroundColor: "#f2f2f2",
    margin: 8,
  },
  itemCustom: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  itemTextCustom: {
    color: colors.black,
    fontSize: 15,
  },
  itemText: {
    color: colors.black,
  },
});

export default CurrencySelector;
