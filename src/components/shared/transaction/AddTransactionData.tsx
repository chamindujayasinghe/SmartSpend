import React, { useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AppText from "../../../components/AppText";
import { useThemeColors } from "../../../../config/theme/colorMode";
import colors from "../../../../config/colors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
}

const AddNewModal: React.FC<Props> = ({ visible, onClose, onSave, title }) => {
  const [value, setValue] = useState("");
  const { colormode1, colormode2, textinputcolor, secondarycolormode } =
    useThemeColors();

  const handleSave = () => {
    if (value.trim().length === 0) return;
    onSave(value.trim());
    setValue("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colormode2 }]}>
            <View style={styles.header}>
              <AppText style={[styles.headerText, { color: colormode1 }]}>
                {title}
              </AppText>

              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={28}
                  color={colors.danger}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder="Enter name"
              placeholderTextColor={secondarycolormode}
              value={value}
              onChangeText={setValue}
              style={[
                styles.input,
                { borderColor: textinputcolor, color: colormode1 },
              ]}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <AppText style={styles.saveButtonText}>Save</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(92, 92, 92, 0.5)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modal: {
    height: "80%",
    borderRadius: 20,
    padding: 20,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    marginTop: 30,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default AddNewModal;
