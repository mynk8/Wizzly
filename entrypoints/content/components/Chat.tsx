import { useGenAIContext } from "@/entrypoints/contexts/ChatAPIContext"

const Chat = () => {
  const { ai } = useGenAIContext();


  const sendMessage = async () => {
    const chat = ai.chats.create({
      model: "gemini-2.5-pro",
      history: [],
    });
  }
}
