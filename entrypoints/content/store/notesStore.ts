import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  noteText: string;
  topic: string;
  timestamp: string;
  videoTitle: string;
  videoUrl: string;
  createdAt: string;
}

interface NotesState {
  notes: Note[];
  lastUsedTopic: string;
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  deleteNote: (id: string) => void;
  getNotesByTopic: () => Record<string, Note[]>;
  setLastUsedTopic: (topic: string) => void;
  clearNotes: () => void;
  importNotes: (notes: Note[]) => void;
}

// Custom storage with error handling
const customStorage = {
  getItem: (name: string): string | null => {
    try {
      const item = localStorage.getItem(name);
      if (!item) return null;
      
      // Validate JSON structure
      const parsed = JSON.parse(item);
      if (!parsed || typeof parsed !== 'object') {
        console.error('Invalid storage data structure');
        return null;
      }
      
      return item;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },
  
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      // If quota exceeded, try to clear some space
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        try {
          // Remove old items if needed
          const oldItems = Object.keys(localStorage).filter(key => 
            key.startsWith('wizzly-') && key !== 'wizzly-notes-storage'
          );
          oldItems.forEach(key => localStorage.removeItem(key));
          // Try setting item again
          localStorage.setItem(name, value);
        } catch (retryError) {
          console.error('Failed to make space in localStorage:', retryError);
        }
      }
    }
  },
  
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};

const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      lastUsedTopic: '',
      
      addNote: (noteData) => set((state) => {
        try {
          const newNote: Note = {
            ...noteData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          };
          return { 
            notes: [...state.notes, newNote],
            lastUsedTopic: noteData.topic
          };
        } catch (error) {
          console.error('Error adding note:', error);
          return state;
        }
      }),
      
      deleteNote: (id) => set((state) => {
        try {
          return {
            notes: state.notes.filter((note) => note.id !== id)
          };
        } catch (error) {
          console.error('Error deleting note:', error);
          return state;
        }
      }),
      
      getNotesByTopic: () => {
        try {
          const { notes } = get();
          return notes.reduce<Record<string, Note[]>>((acc, note) => {
            if (!acc[note.topic]) {
              acc[note.topic] = [];
            }
            acc[note.topic].push(note);
            return acc;
          }, {});
        } catch (error) {
          console.error('Error getting notes by topic:', error);
          return {};
        }
      },
      
      setLastUsedTopic: (topic) => set({ lastUsedTopic: topic }),
      
      clearNotes: () => set({ notes: [], lastUsedTopic: '' }),
      
      importNotes: (importedNotes) => set((state) => {
        try {
          // Validate imported notes structure
          if (!Array.isArray(importedNotes)) {
            throw new Error('Imported notes must be an array');
          }
          
          const validNotes = importedNotes.filter(note => {
            return (
              note &&
              typeof note === 'object' &&
              typeof note.id === 'string' &&
              typeof note.noteText === 'string' &&
              typeof note.topic === 'string' &&
              typeof note.timestamp === 'string' &&
              typeof note.videoTitle === 'string' &&
              typeof note.videoUrl === 'string' &&
              typeof note.createdAt === 'string'
            );
          });
          
          return {
            notes: [...state.notes, ...validNotes]
          };
        } catch (error) {
          console.error('Error importing notes:', error);
          return state;
        }
      }),
    }),
    {
      name: 'wizzly-notes-storage',
      storage: createJSONStorage(() => customStorage),
      onRehydrateStorage: () => (state) => {
        // Validate rehydrated state
        if (state && (!Array.isArray(state.notes) || typeof state.lastUsedTopic !== 'string')) {
          console.error('Invalid rehydrated state structure');
          return { notes: [], lastUsedTopic: '' };
        }
      },
    }
  )
);

export default useNotesStore; 