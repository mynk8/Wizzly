import { useMemo } from "react";
import { GoogleGenAI } from "@google/genai";

export interface IGenAI {
  ai: GoogleGenAI
}

export const useGenAI = ({ apiKey }:{ apiKey: string }) : IGenAI => {
  const ai = useMemo(() => new GoogleGenAI({apiKey}), [apiKey]);

  return { ai };
};
