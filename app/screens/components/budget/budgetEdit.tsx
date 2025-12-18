import React, { useState, useMemo, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useThemeColors } from "../../../../config/theme/colorMode";
import AppText from "../../../components/AppText";
import { BudgetEditScreenProps } from "../../../navigation/NavigationTypes";
import DateNavigator from "../DateNavigator";
import colors from "../../../../config/colors";
import { Period } from "../PeriodSelector";
import BudgetInputModal from "./BudgetInputModal";
import { getAllBudgets } from "../../../../utilities/BudgetStorage";

// Interface to track overrides keyed by their unique period ID
interface OverrideData {
  [key: string]: number;
}

const BudgetEditScreen: React.FC = () => {
  const navigation = useNavigation<BudgetEditScreenProps["navigation"]>();
  const route = useRoute<BudgetEditScreenProps["route"]>();

  const { category, initialBudget, type } = route.params;
  const selectedPeriod = route.params.selectedPeriod as Period;

  const { titlecolor, colormode1, textinputcolor, secondarycolormode } =
    useThemeColors();

  // --- State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [defaultBudget, setDefaultBudget] = useState(initialBudget);
  const [overrides, setOverrides] = useState<OverrideData>({});

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeItem, setActiveItem] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [isEditingDefault, setIsEditingDefault] = useState(false);

  // --- Dynamic List Data Generation ---
  const listData = useMemo(() => {
    const currentYear = currentDate.getFullYear();

    switch (selectedPeriod) {
      case "Daily":
        return Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(currentDate);
          d.setDate(currentDate.getDate() + i);
          return {
            // Unique ID including year/month/day
            id: `day-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`,
            label: d.toLocaleDateString("default", {
              weekday: "short",
              day: "numeric",
            }),
          };
        });

      case "Weekly":
        return Array.from({ length: 4 }).map((_, i) => {
          const d = new Date(currentDate);
          d.setDate(currentDate.getDate() + i * 7);
          // Unique ID reflecting the specific week starting date
          const id = `week-${d.getFullYear()}-${
            d.getMonth() + 1
          }-${d.getDate()}`;
          return { id, label: `Week ${i + 1}` };
        });

      case "Annually":
        const startYear = currentDate.getFullYear();
        return Array.from({ length: 10 }).map((_, i) => ({
          id: `year-${startYear + i}`,
          label: (startYear + i).toString(),
        }));

      case "Monthly":
      default:
        // IMPORTANT: IDs now include the specific year (e.g., "Jan-2025")
        // This prevents Feb 2025 edits from changing Feb 2026
        return [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ].map((m) => ({ id: `${m}-${currentYear}`, label: m }));
    }
  }, [selectedPeriod, currentDate]);

  // --- DateNavigator Logic ---
  const handleDateNavigate = (direction: "previous" | "next") => {
    const newDate = new Date(currentDate);
    const multiplier = direction === "next" ? 1 : -1;

    switch (selectedPeriod) {
      case "Daily":
        newDate.setDate(currentDate.getDate() + multiplier);
        break;
      case "Weekly":
        newDate.setDate(currentDate.getDate() + multiplier * 7);
        break;
      case "Annually":
      case "Monthly":
      default:
        // Both Annually and Monthly views use the navigator to switch the YEAR
        newDate.setFullYear(currentDate.getFullYear() + multiplier);
        break;
    }
    setCurrentDate(newDate);
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // --- Handle Modal Logic ---
  const handleOpenModal = (
    item: { id: string; label: string } | null,
    isDefault: boolean
  ) => {
    setIsEditingDefault(isDefault);
    setActiveItem(item);
    setModalVisible(true);
  };

  const handleSaveBudget = (savedEntry: { budget: number }) => {
    if (isEditingDefault) {
      setDefaultBudget(savedEntry.budget);
    } else if (activeItem) {
      setOverrides((prev) => ({
        ...prev,
        [activeItem.id]: savedEntry.budget,
      }));
    }
    setModalVisible(false);
  };
  useEffect(() => {
    const loadOverrides = async () => {
      const allBudgets = await getAllBudgets();

      const relevant = allBudgets.filter(
        (b) =>
          b.category === category &&
          b.type === type &&
          b.period === selectedPeriod &&
          b.periodKey
      );

      const map: OverrideData = {};
      relevant.forEach((b) => {
        map[b.periodKey!] = b.budget;
      });

      setOverrides(map);
    };

    loadOverrides();
  }, [category, type, selectedPeriod]);

  const renderItem = ({ item }: { item: { id: string; label: string } }) => {
    const hasOverride = overrides[item.id] !== undefined;
    const currentAmount = hasOverride ? overrides[item.id] : defaultBudget;

    return (
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: textinputcolor }]}
        onPress={() => handleOpenModal(item, false)}
      >
        <View style={[styles.badge]}>
          <AppText
            style={[
              styles.badgeText,
              { color: hasOverride ? colors.success : secondarycolormode },
            ]}
          >
            {item.label}
          </AppText>
        </View>
        <AppText style={[styles.amountText, { color: colormode1 }]}>
          {formatCurrency(currentAmount)}
        </AppText>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: textinputcolor }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons
              name="chevron-left"
              size={32}
              color={titlecolor}
            />
          </TouchableOpacity>
          <AppText style={[styles.headerTitle, { color: titlecolor }]}>
            Budget Edit <AppText style={styles.categorytxt}>{category}</AppText>
          </AppText>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons
            name="delete-outline"
            size={26}
            color={titlecolor}
          />
        </TouchableOpacity>
      </View>

      {/* Date Navigator Wrapper */}
      <View style={styles.navigatorWrapper}>
        <DateNavigator
          currentDate={currentDate}
          // Force navigator to show Year switcher if selectedPeriod is Monthly
          selectedPeriod={
            selectedPeriod === "Monthly" ? "Annually" : selectedPeriod
          }
          onNavigate={handleDateNavigate}
          dateRange={{ start: null, end: null }}
        />
      </View>

      {/* Global Default Budget Row */}
      <TouchableOpacity
        style={[styles.defaultRow, { borderBottomColor: textinputcolor }]}
        onPress={() => handleOpenModal(null, true)}
      >
        <AppText style={[styles.defaultLabel, { color: colormode1 }]}>
          Default Budget ({selectedPeriod})
        </AppText>
        <AppText style={[styles.amountText, { color: colormode1 }]}>
          {formatCurrency(defaultBudget)}
        </AppText>
      </TouchableOpacity>

      {/* List of sub-periods (Months, Days, Weeks, or Years) */}
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Budget Input Modal */}
      <BudgetInputModal
        isVisible={isModalVisible}
        period={selectedPeriod}
        periodKey={activeItem?.id ?? null}
        item={
          {
            category,
            type,
            budget: isEditingDefault
              ? defaultBudget
              : activeItem
              ? overrides[activeItem.id] ?? defaultBudget
              : defaultBudget,
            period: selectedPeriod,
          } as any
        }
        onClose={() => setModalVisible(false)}
        onSave={handleSaveBudget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 5 },
  categorytxt: { color: colors.secondary },
  navigatorWrapper: { paddingVertical: 10 },
  defaultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
  },
  defaultLabel: { fontSize: 17, fontWeight: "500" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
  },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 80,
    alignItems: "center",
  },
  badgeText: { fontSize: 14, fontWeight: "600" },
  amountText: { fontSize: 17, fontWeight: "600" },
  listContainer: { paddingBottom: 20 },
});

export default BudgetEditScreen;
