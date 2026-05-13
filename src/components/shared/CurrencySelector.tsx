import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { getSupportedCurrencies } from "react-native-format-currency";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { useThemeColors } from "../../../config/theme/colorMode";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
      <AppText style={[styles.label, { color: colormode1 }]}>
        Select Currency
      </AppText>

      <Dropdown
        style={[
          styles.dropdown,
          { borderBottomColor: colormode1, borderBottomWidth: 1 },
        ]}
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
        renderRightIcon={() => (
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={colors.secondary}
          />
        )}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  dropdown: {
    height: 40,
    width: 120,
    paddingHorizontal: 10,
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
    width: 250,
    marginLeft: -130,
  },
  placeholderStyle: {
    color: colors.light,
    fontSize: 14,
    textAlign: "right",
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
