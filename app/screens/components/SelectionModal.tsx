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
import { useThemeColors } from "../../../config/theme/colorMode";

interface Props {
  isVisible: boolean;
  title: string;
  items: string[];
  onSelectItem: (item: string) => void;
  onClose: () => void;
  onAddPress: () => void;
  // NEW PROP: Handler for the Delete button press
  onDeletePress: () => void;
}

const SelectionModal: React.FC<Props> = ({
  isVisible,
  title,
  items,
  onSelectItem,
  onClose,
  onAddPress,
  onDeletePress, // Destructure the new prop
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

        {/* NEW BUTTON CONTAINER: For Add and Delete buttons */}
        <View style={styles.bottomButtonContainer}>
          {/* DELETE Button */}
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.danger }]}
            onPress={() => {
              onClose();
              onDeletePress(); // Call the new delete handler
            }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={24}
              color={colors.white}
            />
          </TouchableOpacity>

          {/* ADD Button */}
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
  // NEW STYLE: Container for Add/Delete buttons
  bottomButtonContainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 10, // Add space between buttons
  },
  // ADD Button style (now takes up remaining space)
  addButton: {
    flex: 3, // Takes up more space
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    backgroundColor: colors.dark,
    minHeight: 50,
  },
  // NEW STYLE: Delete Button style
  deleteButton: {
    flex: 1, // Takes up less space
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    minHeight: 50,
  },
  // Removed unused addButtonText style
});

export default SelectionModal;
