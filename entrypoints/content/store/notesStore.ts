import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import Dexie from 'dexie';

export interface Note {
  id: string;
  noteText: string;
  topic: string;
  timestamp: string;
  videoTitle: string;
  videoUrl: string;
  createdAt: string;
  screenshot?: string;
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
  exportNoteToPDF: (noteId: string) => void;
  exportTopicToPDF: (topic: string) => void;
  exportAllNotesToPDF: () => void;
}

// Define the Dexie database
class NotesDatabase extends Dexie {
  storage: Dexie.Table<{key: string, value: string}, string>;

  constructor() {
    super('WizzlyNotesDB');
    this.version(1).stores({
      storage: 'key'
    });
    this.storage = this.table('storage');
  }
}

const db = new NotesDatabase();

// Create a storage adapter for Zustand persist that uses Dexie
const dexieStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const item = await db.storage.get(name);
      return item?.value || null;
    } catch (error) {
      console.error('Error reading from Dexie:', error);
      return null;
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await db.storage.put({ key: name, value });
    } catch (error) {
      console.error('Error writing to Dexie:', error);
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    try {
      await db.storage.delete(name);
    } catch (error) {
      console.error('Error removing from Dexie:', error);
    }
  }
};

// Debug function to check Dexie DB contents
export const debugCheckDexieDB = async (): Promise<void> => {
  try {
    const allItems = await db.storage.toArray();
    console.log('Dexie DB contents:', allItems);
  } catch (error) {
    console.error('Error accessing Dexie for debug:', error);
  }
};

// Function to verify persistence is working
export const verifyPersistence = async (): Promise<boolean> => {
  try {
    const item = await db.storage.get('wizzly-notes-storage');
    if (item) {
      console.log('Store found in Dexie:', item);
      return true;
    } else {
      console.warn('Store not found in Dexie');
      return false;
    }
  } catch (error) {
    console.error('Error verifying persistence:', error);
    return false;
  }
};

export const captureVideoScreenshot = async (): Promise<string | null> => {
  try {
    const video = document.querySelector('video');
    if (!video || video.paused || video.readyState < 2) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64Image = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64Image);
        } catch (e) {
          console.warn('Error in screenshot capture:', e);
          resolve(null);
        }
      }, 100);
    });
  } catch (error) {
    console.warn('Failed to capture video screenshot:', error);
    return null;
  }
};

export const generateNotePDF = (note: Note) => {
  const htmlContent = createNoteHtml(note);
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 300);
};

export const generateTopicPDF = (topicName: string, notes: Note[]) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Notes: ${topicName}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #111;
        }
        .note-container {
          max-width: 800px;
          margin: 0 auto 30px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .note-header {
          background-color: #f5f5f5;
          padding: 15px;
          border-bottom: 1px solid #ddd;
        }
        .note-title {
          margin: 0;
          font-size: 18px;
        }
        .note-meta {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .note-content {
          padding: 20px;
        }
        .note-text {
          white-space: pre-wrap;
          line-height: 1.5;
        }
        .note-image {
          max-width: 100%;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .note-footer {
          padding: 15px;
          background-color: #f5f5f5;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <h1>Notes for Topic: ${topicName}</h1>
      ${notes.map(note => `
        <div class="note-container">
          <div class="note-header">
            <h2 class="note-title">${note.videoTitle}</h2>
            <div class="note-meta">
              <div>Timestamp: ${note.timestamp}</div>
              <div>URL: ${note.videoUrl}</div>
            </div>
          </div>
          <div class="note-content">
            ${note.screenshot ? `<img class="note-image" src="${note.screenshot}" alt="Video screenshot" />` : ''}
            <div class="note-text">${note.noteText}</div>
          </div>
          <div class="note-footer">
            Created: ${new Date(note.createdAt).toLocaleString()}
          </div>
        </div>
      `).join('')}
    </body>
    </html>
  `;
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const generateAllNotesPDF = (notesByTopic: Record<string, Note[]>) => {
  const topics = Object.keys(notesByTopic).sort();
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>All Notes</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 20px;
          color: #111;
        }
        h2 {
          font-size: 20px;
          margin: 30px 0 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #ddd;
          color: #222;
        }
        .note-container {
          max-width: 800px;
          margin: 0 auto 30px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .note-header {
          background-color: #f5f5f5;
          padding: 15px;
          border-bottom: 1px solid #ddd;
        }
        .note-title {
          margin: 0;
          font-size: 18px;
        }
        .note-meta {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .note-content {
          padding: 20px;
        }
        .note-text {
          white-space: pre-wrap;
          line-height: 1.5;
        }
        .note-image {
          max-width: 100%;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .note-footer {
          padding: 15px;
          background-color: #f5f5f5;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
        .topic-section {
          margin-bottom: 40px;
        }
        .page-break {
          page-break-after: always;
        }
      </style>
    </head>
    <body>
      <h1>All Notes</h1>
      ${topics.map(topic => `
        <div class="topic-section">
          <h2>${topic} (${notesByTopic[topic].length} notes)</h2>
          ${notesByTopic[topic].map(note => `
            <div class="note-container">
              <div class="note-header">
                <h3 class="note-title">${note.videoTitle}</h3>
                <div class="note-meta">
                  <div>Timestamp: ${note.timestamp}</div>
                  <div>URL: ${note.videoUrl}</div>
                </div>
              </div>
              <div class="note-content">
                ${note.screenshot ? `<img class="note-image" src="${note.screenshot}" alt="Video screenshot" />` : ''}
                <div class="note-text">${note.noteText}</div>
              </div>
              <div class="note-footer">
                Created: ${new Date(note.createdAt).toLocaleString()}
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 800);
};

const createNoteHtml = (note: Note) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${note.topic} - ${note.videoTitle}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .note-container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .note-header {
          background-color: #f5f5f5;
          padding: 15px;
          border-bottom: 1px solid #ddd;
        }
        .note-title {
          margin: 0;
          font-size: 20px;
        }
        .note-meta {
          color: #666;
          font-size: 14px;
          margin-top: 5px;
        }
        .note-content {
          padding: 20px;
        }
        .note-text {
          white-space: pre-wrap;
          line-height: 1.5;
        }
        .note-image {
          max-width: 100%;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .note-footer {
          padding: 15px;
          background-color: #f5f5f5;
          border-top: 1px solid #ddd;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="note-container">
        <div class="note-header">
          <h1 class="note-title">${note.topic}</h1>
          <div class="note-meta">
            <div>Video: ${note.videoTitle}</div>
            <div>Timestamp: ${note.timestamp}</div>
            <div>URL: ${note.videoUrl}</div>
          </div>
        </div>
        <div class="note-content">
          ${note.screenshot ? `<img class="note-image" src="${note.screenshot}" alt="Video screenshot" />` : ''}
          <div class="note-text">${note.noteText}</div>
        </div>
        <div class="note-footer">
          Created: ${new Date(note.createdAt).toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;
};

const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => {
      console.log('Initializing notes store');
      return {
      notes: [],
      lastUsedTopic: '',
      
      addNote: (noteData) => set((state) => {
        try {
          const newNote: Note = {
            ...noteData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          };
          console.log('Adding note:', newNote);
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
      
      exportNoteToPDF: (noteId) => {
        try {
          const { notes } = get();
          const note = notes.find(n => n.id === noteId);
          if (note) {
            generateNotePDF(note);
          }
        } catch (error) {
          console.error('Error exporting note to PDF:', error);
        }
      },
      
      exportTopicToPDF: (topic) => {
        try {
          const { notes } = get();
          const topicNotes = notes.filter(n => n.topic === topic);
          if (topicNotes.length > 0) {
            generateTopicPDF(topic, topicNotes);
          }
        } catch (error) {
          console.error('Error exporting topic to PDF:', error);
        }
      },
      
      exportAllNotesToPDF: () => {
        try {
          const notesByTopic = get().getNotesByTopic();
          generateAllNotesPDF(notesByTopic);
        } catch (error) {
          console.error('Error exporting all notes to PDF:', error);
        }
      },
    };
  },
  {
    name: 'wizzly-notes-storage',
    storage: createJSONStorage(() => dexieStorage),
    onRehydrateStorage: () => (state) => {
      console.log('Rehydrating state:', state);
      if (!state) {
        console.error('No state to rehydrate');
        return;
      }
      
      if (!Array.isArray(state.notes) || typeof state.lastUsedTopic !== 'string') {
        console.error('Invalid rehydrated state structure');
        return;
      }
      
      console.log('State rehydrated successfully with', state.notes.length, 'notes');
    },
  }
)
);

// Test function to add a sample entry to the database
export const testDexieDatabase = async (): Promise<void> => {
  try {
    await db.storage.put({ key: 'test-key', value: JSON.stringify({ test: 'value', timestamp: Date.now() }) });
    console.log('Test entry added to Dexie database');
    
    const testItem = await db.storage.get('test-key');
    console.log('Retrieved test entry:', testItem);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error testing Dexie database:', error);
    return Promise.reject(error);
  }
};

export default useNotesStore;