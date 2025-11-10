// app/components/SelectionModal.tsx

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

interface Props {
  isVisible: boolean;
  title: string;
  items: string[];
  onSelectItem: (item: string) => void;
  onClose: () => void;
}

const SelectionModal: React.FC<Props> = ({
  isVisible,
  title,
  items,
  onSelectItem,
  onClose,
}) => {
  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <AppText style={styles.title}>{title}</AppText>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons
              name="close"
              size={24}
              color={colors.light}
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
              <AppText style={styles.itemText}>{item}</AppText>
            </TouchableOpacity>
          )}
        />
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
    backgroundColor: colors.dark, // Use your app's dark color
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
    borderBottomColor: colors.light,
    paddingBottom: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.white,
  },
  itemButton: {
    paddingVertical: 15,
  },
  itemText: {
    fontSize: 16,
    color: colors.white,
  },
});

export default SelectionModal;
