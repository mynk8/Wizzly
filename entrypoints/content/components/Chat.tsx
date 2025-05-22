import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { useGenAIContext } from "@/entrypoints/contexts/ChatAPIContext";
import useStore from "@/entrypoints/store/store.ts";
import { BookOpen, X } from "lucide-react";
import NoteSelector from "./NoteSelector";
import { Note } from "../store/notesStore";

const BotMessage = ({ message, role, theme }: { message: string; role: string; theme: 'dark' | 'light' }) => {
  const isDark = theme === 'dark';

  return (
    <div
      className={`p-3 mb-2 rounded-sm max-w-[90%] whitespace-pre-wrap transition-colors duration-300 ${role === "user"
        ? `${isDark ? 'bg-[#252525] text-[#FFFFFF]' : 'bg-[#EBEBEB] text-[#000000]'} ml-auto border-l-2 ${isDark ? 'border-l-[#5D5D5D]' : 'border-l-[#AAAAAA]'}`
        : `${isDark ? 'bg-[#141414] text-[#FFFFFF]' : 'bg-[#E0E0E0] text-[#000000]'} mr-auto border-l-2 border-l-[#2B5DF5]`
        }`}
    >
      <p className={`text-xs font-medium mb-1 uppercase tracking-wide transition-colors duration-300 ${isDark ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
        {role === "user" ? "You" : "Bot"}
      </p>
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
};

const NoteBadge = ({ note, onRemove, theme }: { note: Note; onRemove: () => void; theme: 'dark' | 'light' }) => {
  const isDark = theme === 'dark';
  // Get initials from note text (first 2 words)
  const initials = note.noteText
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div 
      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors duration-300 ${
        isDark 
          ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]' 
          : 'bg-[#E0E0E0] text-[#000000] hover:bg-[#D0D0D0]'
      }`}
      title={`${note.noteText} (${note.videoTitle})`}
    >
      <span>{initials}</span>
      <button 
        onClick={onRemove}
        className={`ml-1 rounded-full p-0.5 transition-colors duration-300 ${
          isDark 
            ? 'hover:bg-[#3A3A3A]' 
            : 'hover:bg-[#C0C0C0]'
        }`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

const Chat = () => {
  const { ai } = useGenAIContext();
  const { messages, addMessage, updateLastMessage, theme } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noteSelectorOpen, setNoteSelectorOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const transcript = useStore((state) => state.transcript);
  const chatRef = useRef<any>(null);
  const isDark = theme === 'dark';

  const memoizedHistory = useMemo(
    () =>
      messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    [messages]
  );

  // Combine transcript and selected notes for context
  const contextWithNotes = useMemo(() => {
    let context = transcript || '';
    
    if (selectedNotes.length > 0) {
      context += '\n\nAdditional context from notes:\n';
      selectedNotes.forEach((note, index) => {
        context += `\nNote ${index + 1}: "${note.noteText}" - from video "${note.videoTitle}" at ${note.timestamp}\n`;
      });
    }
    
    return context;
  }, [transcript, selectedNotes]);

  useEffect(() => {
    if (!chatRef.current || selectedNotes.length > 0) {
      // Recreate chat with updated context when notes change
      chatRef.current = ai.chats.create({
        model: "gemini-2.0-flash",
        history: memoizedHistory,
        config: {
          systemInstruction: `You are a helpful qna assistant you have to answer the questions related to the youtube video of which the transcipt you are given here, ${contextWithNotes}`
        }
      });
    }
  }, [ai, contextWithNotes, memoizedHistory]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleAddNote = (note: Note) => {
    // Check if note is already selected
    if (!selectedNotes.some(n => n.id === note.id)) {
      setSelectedNotes(prev => [...prev, note]);
    }
    setNoteSelectorOpen(false);
  };

  const handleRemoveNote = (noteId: string) => {
    setSelectedNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMessage = { role: "user", text: input.trim() };
    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const stream = await chatRef.current.sendMessageStream({
        message: userMessage.text,
      });

      let fullResponse = "";
      // Add initial empty message
      addMessage({ role: "model", text: "" });

      for await (const chunk of stream) {
        fullResponse += chunk.text;
        // Update the last message instead of adding a new one
        updateLastMessage(fullResponse);
      }
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("Sorry, something went wrong.");
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Completely stop event propagation
    e.stopPropagation();
    (e.nativeEvent as Event).stopImmediatePropagation();
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, []);

  // Prevent events from reaching YouTube player
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const preventPropagation = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    input.addEventListener('keydown', preventPropagation, true);
    input.addEventListener('keyup', preventPropagation, true);
    input.addEventListener('keypress', preventPropagation, true);

    return () => {
      input.removeEventListener('keydown', preventPropagation, true);
      input.removeEventListener('keyup', preventPropagation, true);
      input.removeEventListener('keypress', preventPropagation, true);
    };
  }, []);

  // Custom scrollbar styles
  const scrollbarStyles = `
    .hide-scrollbar::-webkit-scrollbar {
      width: 0px;
      background: transparent;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  return (
    <div className={`flex flex-col h-[480px] transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'} font-sans`}>
      <style>{scrollbarStyles}</style>
      
      {/* Note context badges */}
      {selectedNotes.length > 0 && (
        <div className={`px-4 py-2 flex flex-wrap gap-1 border-b transition-colors duration-300 ${
          isDark ? 'border-[#252525] bg-[#101010]' : 'border-[#E0E0E0] bg-[#F5F5F5]'
        }`}>
          {selectedNotes.map(note => (
            <NoteBadge 
              key={note.id} 
              note={note} 
              onRemove={() => handleRemoveNote(note.id)}
              theme={theme}
            />
          ))}
        </div>
      )}
      
      <main className="flex-1 overflow-y-auto px-4 py-3 space-y-2 hide-scrollbar">
        {messages.map((msg, index) => (
          <BotMessage 
            key={`${index}-${msg.role}-${msg.text.substring(0, 10)}`} 
            message={msg.text} 
            role={msg.role}
            theme={theme} 
          />
        ))}
        <div ref={messagesEndRef} />
      </main>
      <footer className={`p-3 border-t transition-colors duration-300 ${isDark ? 'border-[#252525] bg-[#101010]' : 'border-[#E0E0E0] bg-[#F5F5F5]'}`}>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-sm flex items-center justify-center transition-colors duration-300 ${
              isDark 
                ? 'bg-[#252525] text-[#8E8E8E] hover:bg-[#3A3A3A] hover:text-[#FFFFFF]' 
                : 'bg-[#E0E0E0] text-[#666666] hover:bg-[#D0D0D0] hover:text-[#000000]'
            }`}
            onClick={() => setNoteSelectorOpen(true)}
            title="Add note to context"
            style={{ width: '40px', height: '40px' }}
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <textarea
            ref={inputRef}
            className={`flex-1 px-3 py-2 rounded-sm border resize-none leading-snug focus:outline-none focus:ring-1 text-sm transition-colors duration-300 ${
              isDark 
                ? 'border-[#252525] bg-[#0A0A0A] text-[#FFFFFF] focus:ring-[#2B5DF5]' 
                : 'border-[#D0D0D0] bg-[#FFFFFF] text-[#000000] focus:ring-[#2B5DF5]'
            }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{ height: '40px', minHeight: '40px' }}
          />
          <button
            className={`px-4 py-2 h-[40px] bg-[#2B5DF5] text-white hover:bg-[#1E4AD1] disabled:text-[#8E8E8E] font-medium tracking-wide text-sm rounded-sm transition-colors duration-300 ${
              isDark ? 'disabled:bg-[#252525]' : 'disabled:bg-[#D0D0D0]'
            }`}
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </footer>
      
      <NoteSelector 
        isOpen={noteSelectorOpen} 
        onClose={() => setNoteSelectorOpen(false)} 
        onSelectNote={handleAddNote}
      />
    </div>
  );
};

export default Chat;
