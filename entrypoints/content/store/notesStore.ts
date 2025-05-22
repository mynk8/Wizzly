import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
}

const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      lastUsedTopic: '',
      
      addNote: (noteData) => set((state) => {
        const newNote: Note = {
          ...noteData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        return { 
          notes: [...state.notes, newNote],
          lastUsedTopic: noteData.topic
        };
      }),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      })),
      
      getNotesByTopic: () => {
        const { notes } = get();
        return notes.reduce<Record<string, Note[]>>((acc, note) => {
          if (!acc[note.topic]) {
            acc[note.topic] = [];
          }
          acc[note.topic].push(note);
          return acc;
        }, {});
      },
      
      setLastUsedTopic: (topic) => set({ lastUsedTopic: topic }),
    }),
    {
      name: 'wizzly-notes-storage',
    }
  )
);

export default useNotesStore; 