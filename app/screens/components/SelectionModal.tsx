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
  const { isLightMode } = useTheme();
  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View
        style={[
          styles.modalContainer,
          { backgroundColor: isLightMode ? colors.white : colors.darkPrimary },
        ]}
      >
        <View
          style={[
            styles.header,
            { borderBlockColor: isLightMode ? colors.darkbrown : colors.light },
          ]}
        >
          <AppText
            style={[
              styles.title,
              { color: isLightMode ? colors.brown : colors.white },
            ]}
          >
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
              <AppText
                style={[
                  styles.itemText,
                  { color: isLightMode ? colors.brown : colors.light },
                ]}
              >
                {item}
              </AppText>
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
});

export default SelectionModal;
