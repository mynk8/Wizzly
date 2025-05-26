import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { useGenAIContext } from "@/entrypoints/contexts/ChatAPIContext";
import useStore from "@/entrypoints/store/store.ts";
import { BookOpen, X, RefreshCw } from "lucide-react";
import NoteSelector from "./NoteSelector";
import SuggestionsCarousel from "./SuggestionsCarousel";
import { Note } from "../store/notesStore";
import { youTubeControlDeclarations } from "@/entrypoints/lib/functionDeclarations";
import { playYouTubeVideo, pauseYouTubeVideo, getYouTubeVideoStatus, jumpToTimeInVideo } from "@/entrypoints/lib/youtubeControls";

const BotMessage = ({ message, role, theme }: { message: string; role: string; theme: 'dark' | 'light' }) => {
  return (
    <div
      className={`chat ${role === "user" ? "chat-end" : "chat-start"} w-full`}
    >
      <div className={`chat-header opacity-50 text-xs uppercase tracking-wide mb-1`}>
        {role === "user" ? "You" : "Bot"}
      </div>
      <div className={`chat-bubble ${role === "user" ? "chat-bubble-primary" : "chat-bubble-secondary"} max-w-[90%] whitespace-pre-wrap`}>
        {message}
      </div>
    </div>
  );
};

const NoteBadge = ({ note, onRemove }: { note: Note; onRemove: () => void }) => {
  const initials = note.noteText
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div 
      className="badge badge-neutral gap-2"
      title={`${note.noteText} (${note.videoTitle})`}
    >
      <span>{initials}</span>
      <button 
        onClick={onRemove}
        className="btn btn-ghost btn-xs btn-circle"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};

const Chat = () => {
  const { ai } = useGenAIContext();
  const { messages, addMessage, updateLastMessage, theme, transcript, resetMessages } = useStore();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [noteSelectorOpen, setNoteSelectorOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<any>(null);

  const [suggestions] = useState([
    { id: "1", text: "What is this video about?" },
    { id: "2", text: "Summarize the key points." },
    { id: "3", text: "What are the main topics discussed?" },
    { id: "4", text: "What is the main message of the video?" },
    { id: "5", text: "What is the main takeaway from the video?" },
  ]);

  const memoizedHistory = useMemo(
    () =>
      messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      })),
    [messages]
  );

  const contextWithNotes = useMemo(() => {
    let context = '';
    if (transcript) {
      context += `\n\nVideo Transcript:\n${transcript}\n`;
    }
    if (selectedNotes.length > 0) {
      context += '\n\nAdditional context from notes:\n';
      selectedNotes.forEach((note, index) => {
        context += `\nNote ${index + 1}: "${note.noteText}" - from video "${note.videoTitle}" at ${note.timestamp}\n`;
      });
    }
    return context;
  }, [selectedNotes, transcript]);

  useEffect(() => {
    chatRef.current = ai.chats.create({
      model: "gemini-2.0-flash",
      history: memoizedHistory,
      config: {
        systemInstruction: `You are a helpful qna assistant you have to answer the questions related to the youtube video of which the transcript you are given here, ${contextWithNotes}. You also have access to YouTube video controls to play, pause, check status, and jump to specific times in the current video.`,
        tools: [{
          functionDeclarations: youTubeControlDeclarations
        }]
      }
    });
  }, [ai, contextWithNotes, memoizedHistory]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleAddNote = (note: Note) => {
    if (!selectedNotes.some(n => n.id === note.id)) {
      setSelectedNotes(prev => [...prev, note]);
    }
    setNoteSelectorOpen(false);
  };

  const handleRemoveNote = (noteId: string) => {
    setSelectedNotes(prev => prev.filter(note => note.id !== noteId));
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInput(suggestionText);
  };

  const executeYouTubeFunction = (functionName: string, args: any) => {
    switch (functionName) {
      case 'play_youtube_video':
        return playYouTubeVideo();
      case 'pause_youtube_video':
        return pauseYouTubeVideo();
      case 'get_youtube_video_status':
        return getYouTubeVideoStatus();
      case 'jump_to_time':
        return jumpToTimeInVideo(args.timeInSeconds);
      default:
        return {
          success: false,
          action: 'unknown',
          message: `Unknown function: ${functionName}`
        };
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !chatRef.current || isLoading) return;

    const userMessage = { role: "user", text: input.trim() };
    addMessage(userMessage);
    setInput("");
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({
        message: userMessage.text,
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        console.log("Function calls detected:", response.functionCalls);
        
        let functionResponseText = "";
        
        for (const functionCall of response.functionCalls) {
          console.log("Executing function:", functionCall.name);
          const result = executeYouTubeFunction(functionCall.name, functionCall.args);
          console.log("Function result:", result);
          
          if (result.success) {
            functionResponseText += `✅ ${result.message}\n`;
          } else {
            functionResponseText += `❌ ${result.message}\n`;
          }
        }

        addMessage({ 
          role: "model", 
          text: functionResponseText.trim() || "Function executed."
        });
      } else {
        addMessage({ role: "model", text: response.text || "No response received." });
      }
    } catch (error) {
      console.error("Error:", error);
      addMessage({ role: "model", text: "Sorry, something went wrong." });
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation();
    (e.nativeEvent as Event).stopImmediatePropagation();
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        sendMessage();
      }
    }
  }, [input, sendMessage]);

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

  const handleResetChat = useCallback(() => {
    resetMessages();
    if (chatRef.current) {
      try {
        chatRef.current = null;
      } catch (error) {
        console.error("Error cleaning up chat instance:", error);
      }
    }
    
    chatRef.current = ai.chats.create({
      model: "gemini-2.0-flash",
      history: [],
      config: {
        systemInstruction: `You are a helpful qna assistant you have to answer the questions related to the youtube video of which the transcript you are given here, ${contextWithNotes}. You also have access to YouTube video controls to play, pause, check status, and jump to specific times in the current video.`,
        tools: [{
          functionDeclarations: youTubeControlDeclarations
        }]
      }
    });
    
    setSelectedNotes([]);
  }, [ai, contextWithNotes, resetMessages]);

  return (
    <div className="card h-full bg-base-100 shadow-xl">
      <div className="card-header px-4 py-2 flex justify-between items-center border-b border-base-300">
        <div className="text-sm font-medium">
          {useStore.getState().currentVideoId ? 'Chat' : 'Chat (No video detected)'}
        </div>
        <button
          onClick={handleResetChat}
          className="btn btn-ghost btn-sm btn-square"
          title="Reset chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {selectedNotes.length > 0 && (
        <div className="px-4 py-2 flex flex-wrap gap-2 border-b border-base-300 bg-base-200">
          {selectedNotes.map(note => (
            <NoteBadge 
              key={note.id} 
              note={note} 
              onRemove={() => handleRemoveNote(note.id)}
            />
          ))}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg, index) => (
          <BotMessage 
            key={`${index}-${msg.role}-${msg.text?.substring(0, 10) || 'empty'}`} 
            message={msg.text || ''} 
            role={msg.role}
            theme={theme} 
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="card-footer p-3 border-t border-base-300">
        {messages.length === 0 && (
          <SuggestionsCarousel 
            suggestions={suggestions} 
            onSuggestionClick={handleSuggestionClick}
            theme={theme}
          />
        )}
        <div className="join w-full">
          <button
            className="btn btn-neutral join-item"
            onClick={() => setNoteSelectorOpen(true)}
            title="Add note to context"
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <textarea
            ref={inputRef}
            className="textarea textarea-bordered join-item flex-1 resize-none leading-snug focus:outline-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            style={{ height: '40px', minHeight: '40px' }}
          />
          <button
            className="btn btn-primary join-item"
            onClick={sendMessage}
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
      
      <NoteSelector 
        isOpen={noteSelectorOpen} 
        onClose={() => setNoteSelectorOpen(false)} 
        onSelectNote={handleAddNote}
      />
    </div>
  );
};

export default Chat;
