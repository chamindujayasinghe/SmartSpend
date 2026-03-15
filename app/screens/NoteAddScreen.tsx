import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useThemeColors } from "../../config/theme/colorMode";
import {
  saveNote,
  getNotes,
  deleteNote,
  Note,
} from "../../utilities/NoteStorage";
import AppText from "../components/AppText";
import AppButton from "../components/AppButton";
import colors from "../../config/colors";
import AppTextInput from "../components/AppTextInput";

const NoteAddScreen = () => {
  const navigation = useNavigation();
  const { colormode1, colormode2, secondarycolormode, textinputcolor } =
    useThemeColors();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [isViewAll, setIsViewAll] = useState(false);

  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);

  const fetchNotes = async () => {
    try {
      const allNotes = await getNotes();

      if (isViewAll) {
        const sortedAll = allNotes.sort((a, b) => b.createdAt - a.createdAt);
        setDisplayedNotes(sortedAll);
      } else {
        const targetDateStr = date.toISOString().split("T")[0];
        const filtered = allNotes.filter((note) => {
          if (!note.date) return false;
          return note.date.split("T")[0] === targetDateStr;
        });
        setDisplayedNotes(filtered);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [date, isViewAll]);

  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [date, isViewAll]),
  );

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      setIsViewAll(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(id);
          fetchNotes();
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Incomplete", "Please add a title to your note.");
      return;
    }

    try {
      await saveNote(title, content, date);
      setContent("");
      setTitle("");
      setIsAddingNote(false);
      setIsViewAll(false);
      fetchNotes();
      Alert.alert("Success", "Note saved successfully");
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Could not save the note.");
    }
  };

  const handleClose = () => {
    setIsAddingNote(false);
    setContent("");
    setTitle("");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!isAddingNote && (
          <TouchableOpacity
            style={[styles.customAddButton]}
            onPress={() => setIsAddingNote(true)}
          >
            <AppText
              style={{ color: colormode1, fontWeight: "bold", fontSize: 18 }}
            >
              Add New
            </AppText>
            <MaterialCommunityIcons name="plus" size={24} color={colormode1} />
          </TouchableOpacity>
        )}

        {!isViewAll && (
          <View style={styles.inputGroup}>
            <AppText style={[styles.label, { color: secondarycolormode }]}>
              Date
            </AppText>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={15}
                color={colors.secondary}
                style={{ marginRight: 10 }}
              />
              <AppText style={{ color: secondarycolormode, fontSize: 16 }}>
                {date.toLocaleDateString()}
              </AppText>
              <MaterialCommunityIcons
                name="reload"
                size={15}
                color={secondarycolormode}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
          </View>
        )}

        {!isAddingNote && (
          <View style={styles.dailyNotesContainer}>
            <AppText style={[styles.sectionHeader, { color: colormode1 }]}>
              {isViewAll
                ? "All Saved Notes"
                : `Notes for ${date.toLocaleDateString()}`}
            </AppText>

            {displayedNotes.length > 0 ? (
              displayedNotes.map((note) => (
                <View
                  key={note.id}
                  style={[styles.noteItem, { backgroundColor: textinputcolor }]}
                >
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(note.id)}
                  >
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={20}
                      color={colors.white}
                    />
                  </TouchableOpacity>

                  <View style={styles.noteContent}>
                    {isViewAll && (
                      <AppText
                        style={{
                          color: colors.secondary,
                          fontSize: 12,
                          marginBottom: 2,
                        }}
                      >
                        {new Date(note.date).toLocaleDateString()}
                      </AppText>
                    )}
                    <AppText
                      style={{
                        color: colormode1,
                        marginBottom: 4,
                        fontSize: 16,
                        fontWeight: "bold",
                      }}
                    >
                      {note.title}
                    </AppText>
                    <AppText
                      style={{ color: secondarycolormode, fontSize: 15 }}
                    >
                      {note.content}
                    </AppText>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyStateContainer}>
                <AppText style={{ color: colors.secondary }}>
                  {isViewAll ? "No notes saved yet." : "No notes for this day."}
                </AppText>
              </View>
            )}
          </View>
        )}

        {isAddingNote && (
          <View
            style={[styles.noteContainer, { borderColor: colors.secondary }]}
          >
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={handleClose}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={28}
                color={colors.danger}
              />
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <AppTextInput
                icon="tag-edit-outline"
                placeholder="Enter Note Title"
                placeholderTextColor={colors.light}
                value={title}
                onChangeText={setTitle}
                style={[
                  styles.titleinput,
                  { backgroundColor: textinputcolor, color: colormode2 },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <AppTextInput
                icon="notebook-edit"
                placeholder="Write your note here..."
                placeholderTextColor={colors.light}
                value={content}
                onChangeText={setContent}
                multiline
                style={[
                  styles.textArea,
                  { backgroundColor: textinputcolor, color: colormode2 },
                ]}
              />
            </View>

            <AppButton
              title="Save Note"
              onPress={handleSubmit}
              textColor={colors.white}
            />
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <AppButton
            title={isViewAll ? "Back to Daily View" : "View All History"}
            textColor={colormode1}
            style={styles.viewNotes}
            onPress={() => setIsViewAll(!isViewAll)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 30,
  },
  customAddButton: {
    alignSelf: "center",
    flexDirection: "row",
    padding: 10,
    fontSize: 16,
    borderColor: colors.secondary,
    justifyContent: "space-between",
    alignItems: "center",
    width: 130,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "transparent",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  noteContainer: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    paddingTop: 35,
    marginBottom: 20,
    position: "relative",
  },
  closeIconContainer: {
    position: "absolute",
    top: -12,
    right: -10,
    backgroundColor: colors.white,
    borderRadius: 15,
    zIndex: 1,
  },
  titleinput: { width: "100%" },
  textArea: {
    height: 120,
    padding: 5,
    width: "100%",
    borderRadius: 15,
  },
  viewNotes: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  dailyNotesContainer: {
    marginTop: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    opacity: 0.8,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: colors.secondary,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    padding: 8,
    borderRadius: 20,
    marginRight: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  noteContent: {
    flex: 1,
  },
  emptyStateContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default NoteAddScreen;
