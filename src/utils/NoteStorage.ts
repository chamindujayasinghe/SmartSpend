import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "user_notes_data";

export interface Note {
    id: string;
    title: string;
    content: string;
    date: string;
    createdAt: number;
}

// Get all notes
export const getNotes = async (): Promise<Note[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(NOTES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Failed to fetch notes", e);
        return [];
    }
};

// Add a new note
export const saveNote = async (
    title: string,
    content: string,
    date: Date,
): Promise<void> => {
    try {
        // 1. Defensive check: If date is missing, default to now
        const validDate = date instanceof Date ? date : new Date();

        const existingNotes = await getNotes();

        const newNote: Note = {
            id: Date.now().toString(),
            title: title || "Untitled",
            content: content || "",
            date: validDate.toISOString(),
            createdAt: Date.now(),
        };

        const updatedNotes = [newNote, ...existingNotes];
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (e) {
        console.error("Failed to save note", e);
        throw e;
    }
};

export const deleteNote = async (id: string): Promise<void> => {
    try {
        const existingNotes = await getNotes();
        const updatedNotes = existingNotes.filter((note) => note.id !== id);
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updatedNotes));
    } catch (e) {
        console.error("Failed to delete note", e);
    }
};
