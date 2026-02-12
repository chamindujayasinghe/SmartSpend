import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  RouteProp,
  useFocusEffect,
} from "@react-navigation/native";
import { useThemeColors } from "../../../../config/theme/colorMode";
import {
  getExpenseCategories,
  getIncomeCategories,
} from "../../../data/TransactionData";
import colors from "../../../../config/colors";
import AppText from "../../../components/AppText";
import BudgetInputModal from "./BudgetInputModal";
import {
  BudgetEntry,
  getAllBudgets,
  saveBudgetEntry,
  deleteBudgetEntry, // <--- Import the delete function
} from "../../../../utilities/BudgetStorage";
import PeriodSelector, { Period } from "../PeriodSelector";

// --- CURRENCY IMPORTS ---
import { useCurrency } from "../../../../config/currencyProvider";
import {
  convertToCurrency,
  getExchangeRates,
} from "../../../../Hooks/Currency";

type BudgetSettingRouteParams = {
  selectedPeriod: Period;
  initialType: "Income" | "Expense";
};

type BudgetSettingScreenRouteProp = RouteProp<
  { BudgetSetting: BudgetSettingRouteParams },
  "BudgetSetting"
>;

interface BudgetItem extends BudgetEntry {}

const BudgetSettingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<BudgetSettingScreenRouteProp>();

  const { selectedPeriod: initialPeriod, initialType } = route.params || {
    selectedPeriod: "Monthly",
    initialType: "Expense",
  };

  const { titlecolor, colormode1, textinputcolor, secondarycolormode } =
    useThemeColors();

  // --- CURRENCY HOOKS ---
  const { currency } = useCurrency();
  const [rates, setRates] = useState<any>(null);

  const [selectedPeriod, setSelectedPeriod] = useState<Period>(initialPeriod);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Income" | "Expense">(initialType);
  const [modalItem, setModalItem] = useState<BudgetItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetDate = () => {
    setSelectedPeriod("Monthly");
  };

  const handleShowRangePicker = () => {
    console.log("Date Range Picker triggered from Budget Settings.");
  };

  const loadCategoriesAndBudgets = useCallback(async () => {
    setIsLoading(true);
    const currentPeriod = selectedPeriod;

    try {
      const [incomeCategories, expenseCategories, savedBudgets, latestRates] =
        await Promise.all([
          getIncomeCategories("income"),
          getExpenseCategories("expense"),
          getAllBudgets(),
          getExchangeRates(),
        ]);

      setRates(latestRates);

      const baseItems: BudgetItem[] = [
        ...incomeCategories.map((cat) => ({
          category: cat,
          type: "Income" as const,
          period: currentPeriod,
          budget: 0.0,
          currency: currency,
        })),
        ...expenseCategories.map((cat) => ({
          category: cat,
          type: "Expense" as const,
          period: currentPeriod,
          budget: 0.0,
          currency: currency,
        })),
      ];

      const updatedItems = baseItems.map((baseItem) => {
        const savedBudget = savedBudgets.find(
          (b) =>
            b.category === baseItem.category &&
            b.type === baseItem.type &&
            b.period === currentPeriod,
        );

        if (savedBudget) {
          const convertedAmount = convertToCurrency(
            savedBudget.budget,
            savedBudget.currency || currency,
            currency,
            latestRates,
          );

          return {
            ...baseItem,
            budget: convertedAmount,
            currency: currency,
          };
        }

        return baseItem;
      });

      setBudgetItems(updatedItems);
    } catch (error) {
      console.error("Failed to load categories or budgets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, refreshKey, currency]);

  useEffect(() => {
    setActiveTab(initialType);
    setSelectedPeriod(initialPeriod);
  }, [initialType, initialPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadCategoriesAndBudgets();
    }, [loadCategoriesAndBudgets]),
  );

  const handleOpenBudgetModal = (item: BudgetItem) => {
    const currentItem =
      budgetItems.find(
        (i) => i.category === item.category && i.type === item.type,
      ) || item;

    setModalItem({ ...currentItem, period: selectedPeriod });
  };

  const handleSaveBudget = async (savedEntry: BudgetEntry) => {
    const entryWithCurrency = {
      ...savedEntry,
      currency: currency,
    };

    await saveBudgetEntry(entryWithCurrency);

    setBudgetItems((prevItems) =>
      prevItems.map((item) =>
        item.category === savedEntry.category &&
        item.type === savedEntry.type &&
        item.period === savedEntry.period
          ? { ...item, budget: savedEntry.budget, currency: currency }
          : item,
      ),
    );

    setRefreshKey((prev) => prev + 1);
    setModalItem(null);
  };

  // --- DELETE HANDLER ---
  const handleDeleteBudget = (item: BudgetItem) => {
    Alert.alert(
      "Delete Budget",
      `Are you sure you want to remove the budget for ${item.category}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // 1. Delete from storage
            await deleteBudgetEntry(item.category, item.type, item.period);

            // 2. Update local state (Reset to 0.00 instead of removing the row)
            setBudgetItems((prevItems) =>
              prevItems.map((i) =>
                i.category === item.category &&
                i.type === item.type &&
                i.period === item.period
                  ? { ...i, budget: 0.0 } // Reset visually to 0
                  : i,
              ),
            );

            setRefreshKey((prev) => prev + 1);
          },
        },
      ],
    );
  };

  const filteredItems = budgetItems.filter((item) => item.type === activeTab);

  const renderItem = ({ item }: { item: BudgetItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { borderBottomColor: textinputcolor }]}
      onPress={() => handleOpenBudgetModal(item)}
    >
      <View style={styles.leftWrapper}>
        {/* DELETE ICON - Only shows if there is a budget > 0 */}
        {item.budget > 0 ? (
          <TouchableOpacity
            onPress={() => handleDeleteBudget(item)}
            style={styles.deleteIcon}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={colors.danger}
            />
          </TouchableOpacity>
        ) : (
          // Spacer to keep alignment consistent even if no delete icon
          <View style={styles.deleteIconPlaceholder} />
        )}

        <View style={styles.leftContent}>
          <AppText style={[styles.itemCategory, { color: colormode1 }]}>
            {item.category}
          </AppText>
        </View>
      </View>

      <View style={styles.rightContent}>
        <AppText style={[styles.budgetAmount, { color: colormode1 }]}>
          {currency} {item.budget.toFixed(2)} / {selectedPeriod.substring(0, 1)}
        </AppText>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={colormode1}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.headerBar, { borderBottomColor: textinputcolor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="chevron-left"
            size={30}
            color={titlecolor}
          />
        </TouchableOpacity>
        <AppText style={[styles.screenTitle, { color: titlecolor }]}>
          Budget Settings
        </AppText>

        <PeriodSelector
          onReset={handleResetDate}
          selectedPeriod={selectedPeriod}
          onSelectPeriod={setSelectedPeriod}
          onShowRangePicker={handleShowRangePicker}
        />
      </View>

      {/* TABS */}
      <View
        style={[styles.tabsContainer, { borderBottomColor: textinputcolor }]}
      >
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab("Income")}
        >
          <AppText
            style={[
              styles.tabText,
              { color: secondarycolormode },
              activeTab === "Income" && {
                color: colors.success,
                fontWeight: "bold",
              },
            ]}
          >
            Incomes
          </AppText>
          {activeTab === "Income" && (
            <View
              style={[
                styles.activeTabIndicator,
                { backgroundColor: colors.success },
              ]}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => setActiveTab("Expense")}
        >
          <AppText
            style={[
              styles.tabText,
              { color: secondarycolormode },
              activeTab === "Expense" && {
                color: colors.danger,
                fontWeight: "bold",
              },
            ]}
          >
            Expenses
          </AppText>
          {activeTab === "Expense" && (
            <View
              style={[
                styles.activeTabIndicator,
                { backgroundColor: colors.danger },
              ]}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <AppText style={[styles.listHeaderText, { color: titlecolor }]}>
          {activeTab} Categories ({filteredItems.length})
        </AppText>
        <AppText style={[styles.listHeaderText, { color: titlecolor }]}>
          Budget ({selectedPeriod})
        </AppText>
      </View>

      {isLoading ? (
        <AppText style={[styles.loadingText, { color: colormode1 }]}>
          Loading budgets...
        </AppText>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => `${item.type}-${item.category}`}
          renderItem={renderItem}
        />
      )}

      <BudgetInputModal
        isVisible={!!modalItem}
        item={modalItem}
        period={selectedPeriod}
        onClose={() => setModalItem(null)}
        onSave={handleSaveBudget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  screenTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginRight: 15,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    marginHorizontal: 15,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    position: "relative",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabIndicator: {
    height: 3,
    width: "60%",
    position: "absolute",
    bottom: 0,
    borderRadius: 1.5,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: 5,
  },
  listHeaderText: {
    fontSize: 14,
    fontWeight: "bold",
    opacity: 0.7,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    opacity: 0.6,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  leftWrapper: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  deleteIcon: {
    marginRight: 15,
    padding: 5,
  },
  deleteIconPlaceholder: {
    width: 30, // Approximate width of delete icon + margin + padding
    marginRight: 15,
  },
  leftContent: {
    flex: 1,
    alignItems: "flex-start",
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemCategory: {
    fontSize: 16,
    fontWeight: "500",
  },
  budgetAmount: {
    fontSize: 16,
    marginRight: 10,
    fontWeight: "600",
  },
});

export default BudgetSettingScreen;
