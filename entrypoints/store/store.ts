import { create } from 'zustand';

export interface Message {
    role: string;
    text: string;
}

export type AppContext = 'youtube' | 'canvas' | 'lesson-planner' | 'general';

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
    
    // Context awareness
    appContext: AppContext;
    setAppContext: (context: AppContext) => void;
    
    // AI state
    isAiLoading: boolean;
    setIsAiLoading: (loading: boolean) => void;
    aiError: string | null;
    setAiError: (error: string | null) => void;
    
    // API Key management
    geminiApiKey: string | null;
    setGeminiApiKey: (key: string | null) => void;
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
    theme: 'light',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    transcript: null,
    setTranscript: (transcript) => set({ transcript }),
    currentVideoId: null,
    setCurrentVideoId: (videoId) => set({ currentVideoId: videoId }),
    
    // Context awareness
    appContext: 'general',
    setAppContext: (context) => set({ appContext: context }),
    
    // AI state
    isAiLoading: false,
    setIsAiLoading: (loading) => set({ isAiLoading: loading }),
    aiError: null,
    setAiError: (error) => set({ aiError: error }),
    
    // API Key management
    geminiApiKey: null,
    setGeminiApiKey: (key) => set({ geminiApiKey: key }),
}));

export default useStore;
