import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Pressable,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../components/AppText";
import colors from "../../../config/colors";
import { useTheme } from "../../../config/theme/ThemeProvider";
import { useThemeColors } from "../../../config/theme/colorMode";

interface Props {
  isVisible: boolean;
  title: string;
  items: string[];
  onSelectItem: (item: string) => void;
  onClose: () => void;
  onAddPress: () => void;
}

const SelectionModal: React.FC<Props> = ({
  isVisible,
  title,
  items,
  onSelectItem,
  onClose,
  onAddPress,
}) => {
  const { colormode1, colormode2 } = useThemeColors();

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={[styles.modalContainer, { backgroundColor: colormode2 }]}>
        <View style={[styles.header, { borderBlockColor: colormode1 }]}>
          <AppText style={[styles.title, { color: colormode1 }]}>
            {title}
          </AppText>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemButton}
              onPress={() => {
                onSelectItem(item);
                onClose();
              }}
            >
              <AppText style={[styles.itemText, { color: colormode1 }]}>
                {item}
              </AppText>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            onClose();
            onAddPress();
          }}
        >
          <MaterialCommunityIcons
            name="plus-circle"
            size={30}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    paddingBottom: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  itemButton: {
    paddingVertical: 15,
  },
  itemText: {
    fontSize: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.dark,
    marginTop: 5,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SelectionModal;
