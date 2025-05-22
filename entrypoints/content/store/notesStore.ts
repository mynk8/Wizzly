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
  screenshot?: string; // Base64 encoded screenshot
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

// Create IndexedDB database for notes
const DB_NAME = 'wizzly-notes-db';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB');
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

// Custom storage adapter for IndexedDB
const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await openDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(name);
        
        request.onerror = () => {
          console.error('Error reading from IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve(request.result ? JSON.stringify(request.result) : null);
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
      return null;
    }
  },
  
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await openDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id: name, data: JSON.parse(value) });
        
        request.onerror = () => {
          console.error('Error writing to IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
    }
  },
  
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await openDatabase();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(name);
        
        request.onerror = () => {
          console.error('Error removing from IndexedDB:', request.error);
          reject(request.error);
        };
        
        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Error accessing IndexedDB:', error);
    }
  },
};

// Function to capture screenshot of video - modified to improve reliability
export const captureVideoScreenshot = async (): Promise<string | null> => {
  try {
    const video = document.querySelector('video');
    if (!video || video.paused || video.readyState < 2) return null;
    
    // Create canvas with video dimensions
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    
    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    // Force a draw with timeout to ensure the frame is captured
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

// Generate PDF for a note
export const generateNotePDF = (note: Note) => {
  // Create HTML content for the PDF
  const htmlContent = createNoteHtml(note);
  
  // Open a new window and write the HTML content
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for resources to load, then print
  setTimeout(() => {
    printWindow.print();
    // Don't close the window so the user can see the print dialog
  }, 300);
};

// Generate PDF for a topic
export const generateTopicPDF = (topicName: string, notes: Note[]) => {
  // Create HTML content for all notes in the topic
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
  
  // Open a new window and write the HTML content
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for resources to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

// Generate PDF for all notes
export const generateAllNotesPDF = (notesByTopic: Record<string, Note[]>) => {
  const topics = Object.keys(notesByTopic).sort();
  
  // Create HTML content for all notes organized by topic
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
  
  // Open a new window and write the HTML content
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) return;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for resources to load, then print
  setTimeout(() => {
    printWindow.print();
  }, 800);
};

// Helper function to create HTML for a single note
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
    }),
    {
      name: 'wizzly-notes-storage',
      storage: createJSONStorage(() => indexedDBStorage),
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