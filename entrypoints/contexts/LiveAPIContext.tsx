import { createContext, useContext } from "react";
import { useLiveAPI, UseLiveAPIResults } from "../hooks/use-live-api";
import { LiveClientOptions } from "../lib/multimodal-live-types";

const LiveAPIContext = createContext<UseLiveAPIResults | undefined>(undefined);

export type LiveAPIProviderProps = {
  options: LiveClientOptions;
  children: React.ReactNode;
};

export const LiveAPIProvider = ({ options, children }: LiveAPIProviderProps) => {
  const liveAPI = useLiveAPI(options);

  return (
    <LiveAPIContext.Provider value={liveAPI}>
      {children}
    </LiveAPIContext.Provider>
  );
};

export const useLiveAPIContext = () => {
  const context = useContext(LiveAPIContext);
  if (!context) {
    throw new Error("useLiveAPIContext must be used within a LiveAPIProvider");
  }
  return context;
};