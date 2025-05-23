import { create } from 'zustand';

export interface Message {
    role: string;
    text: string;
}

interface StoreState {
    mode: 'chat' | 'voice' | 'notes';
    setMode: (mode: 'chat' | 'voice' | 'notes') => void;
    messages: Message[];
    addMessage: (message: Message) => void;
    updateLastMessage: (text: string) => void;
    resetMessages: () => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    transcript: string | null;
    setTranscript: (transcript: string | null) => void;
    currentVideoId: string | null;
    setCurrentVideoId: (videoId: string | null) => void;
}

const useStore = create<StoreState>((set) => ({
    mode: 'chat',
    setMode: (mode) => set({ mode }),
    messages: [],
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    updateLastMessage: (text) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0) {
            messages[messages.length - 1] = { ...messages[messages.length - 1], text };
        }
        return { messages };
    }),
    resetMessages: () => set({ messages: [] }),
    theme: 'dark',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    transcript: null,
    setTranscript: (transcript) => set({ transcript }),
    currentVideoId: null,
    setCurrentVideoId: (videoId) => set({ currentVideoId: videoId }),
}));

export default useStore;
