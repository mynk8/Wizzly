import { createContext, useContext } from "react";
import { IGenAI, useGenAI } from "../hooks/use-chat-api";
import { ReactNode } from "react";

const GenAIContext = createContext<IGenAI | undefined>(undefined);

export const GenAIProvider = ({
  apiKey,
  children,
}:
  {
    apiKey: string,
    children: ReactNode
  }) => {
  const genAI = useGenAI({ apiKey });
  return <GenAIContext.Provider value={genAI}>{children}</GenAIContext.Provider>;
};

export const useGenAIContext = () => {
  const ctx = useContext(GenAIContext);
  if (!ctx) {
    throw new Error("useGenAIContext must be used within a GenAIProvider");
  }
  return ctx;
};
