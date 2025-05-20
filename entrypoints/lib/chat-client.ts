import { GoogleGenAI } from "@google/genai"


export const useChat = ({ apiKey }:{ apiKey: string }) => {
  const ai = new GoogleGenAI({ apiKey: apiKey })
  const chat = ai.chats.create({
    model: 'gemini-2.0-flash',
    history: [
      {
        role: "user",
        parts: [{ text: "hello" }]
      },
      {
        role: "model",
        parts: [{ text: "Great to meet you. What would you like to know?" }]
      }
    ]
  })

  const stream1 = await chat.sendMessage({
    message: "I have 2 dogs in my ass"
  })
}
