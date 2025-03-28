import { create } from 'zustand';

interface ApiKeyStore {
    apiKey: string;
    setApiKey: (apiKey: string) => void;
    transcript: string;
    setTranscript: (transcript: string) => void;
}

const useStore = create<ApiKeyStore>((set) => ({
    apiKey: '',
    setApiKey: (apiKey: string) => set({ apiKey }),
    transcript: "",
    setTranscript: (transcript: string) => set({ transcript }),
}));

export default useStore;
