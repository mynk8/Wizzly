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
    transcript: string;
    setTranscript: (transcript: string) => void;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
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
    transcript: "",
    setTranscript: (transcript) => set({ transcript }),
    theme: 'dark',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
}));

export default useStore;
