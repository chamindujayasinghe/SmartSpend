import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
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
} from "../../../../utilities/BudgetStorage";
import PeriodSelector, { Period } from "../PeriodSelector";

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

  const [selectedPeriod, setSelectedPeriod] = useState<Period>(initialPeriod);

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Income" | "Expense">(initialType);
  const [modalItem, setModalItem] = useState<BudgetItem | null>(null);

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
      const incomeCategories = await getIncomeCategories("income");
      const expenseCategories = await getExpenseCategories("expense");

      const savedBudgets = await getAllBudgets();

      const baseItems: BudgetItem[] = [
        ...incomeCategories.map((cat) => ({
          category: cat,
          type: "Income" as const,
          period: currentPeriod,
          budget: 0.0,
        })),
        ...expenseCategories.map((cat) => ({
          category: cat,
          type: "Expense" as const,
          period: currentPeriod,
          budget: 0.0,
        })),
      ];

      const updatedItems = baseItems.map((baseItem) => {
        const savedBudget = savedBudgets.find(
          (b) =>
            b.category === baseItem.category &&
            b.type === baseItem.type &&
            b.period === currentPeriod
        );

        return savedBudget
          ? { ...baseItem, budget: savedBudget.budget }
          : baseItem;
      });

      setBudgetItems(updatedItems);
    } catch (error) {
      console.error("Failed to load categories or budgets:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    setActiveTab(initialType);
    setSelectedPeriod(initialPeriod);
  }, [initialType, initialPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadCategoriesAndBudgets();
    }, [loadCategoriesAndBudgets])
  );

  const handleOpenBudgetModal = (item: BudgetItem) => {
    const currentItem =
      budgetItems.find(
        (i) => i.category === item.category && i.type === item.type
      ) || item;

    setModalItem({ ...currentItem, period: selectedPeriod });
  };

  const handleSaveBudget = (savedEntry: BudgetEntry) => {
    setBudgetItems((prevItems) =>
      prevItems.map((item) =>
        item.category === savedEntry.category &&
        item.type === savedEntry.type &&
        item.period === savedEntry.period
          ? { ...item, budget: savedEntry.budget }
          : item
      )
    );

    setModalItem(null);
  };

  const filteredItems = budgetItems.filter((item) => item.type === activeTab);

  const renderItem = ({ item }: { item: BudgetItem }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { borderBottomColor: textinputcolor }]}
      onPress={() => handleOpenBudgetModal(item)}
    >
      <View style={styles.leftContent}>
        <AppText style={[styles.itemCategory, { color: colormode1 }]}>
          {item.category}
        </AppText>
      </View>

      <View style={styles.rightContent}>
        <AppText style={[styles.budgetAmount, { color: colormode1 }]}>
          $ {item.budget.toFixed(2)} / {selectedPeriod.substring(0, 1)}
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
