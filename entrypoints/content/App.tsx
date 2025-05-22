import './style.output.css';
import { useState, useEffect } from "react";
import { Expand, Minimize, Settings, MessageSquare, Mic, Moon, Sun, BookMarked, PenLine } from 'lucide-react';
import Speak from "@/entrypoints/content/components/MicrophoneControls.tsx";
import Chat from './components/Chat';
import { LiveAPIProvider } from "@/entrypoints/contexts/LiveAPIContext.tsx";
import { GenAIProvider } from '../contexts/ChatAPIContext';
import useStore from '@/entrypoints/store/store';
import NoteModal from './components/NoteModal';
import NotesLibrary from './components/NotesLibrary';

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
const apiKey = "";

interface TitleBarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  settings: boolean;
  setSettings: (v: boolean) => void;
  mode: 'chat' | 'voice' | 'notes';
  onToggleMode: (mode: 'chat' | 'voice' | 'notes') => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onTakeNote: () => void;
}

function TitleBar({ 
  collapsed, 
  onToggleCollapse, 
  onDragStart, 
  setSettings, 
  settings, 
  mode, 
  onToggleMode, 
  theme, 
  onToggleTheme,
  onTakeNote
}: TitleBarProps) {
  const settingsButton = async () => {
    browser.runtime.sendMessage({ action: "openSettings" });
  }
  return (
    <div
      className={`flex justify-between items-center px-4 py-3 border-b cursor-grab transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-[#101010] text-[#FFFFFF] border-[#252525]' 
          : 'bg-[#F5F5F5] text-[#000000] border-[#D0D0D0]'
      }`}
      onMouseDown={onDragStart}
    >
      <div className="flex gap-3 items-center">
        <div className={`flex rounded overflow-hidden border border-2 transition-colors duration-300 ${
          theme === 'dark' ? 'border-[#252525]' : 'border-[#D0D0D0]'
        }`}>
          <button 
            onClick={() => onToggleMode('chat')}
            className={`flex items-center gap-1 px-3 py-1 transition-colors duration-300 ${
              mode === 'chat'
                ? theme === 'dark' 
                  ? 'bg-[#252525] text-[#FFFFFF]'
                  : 'bg-[#E0E0E0] text-[#000000]'
                : theme === 'dark'
                  ? 'hover:bg-[#1A1A1A] text-[#8E8E8E]'
                  : 'hover:bg-[#F0F0F0] text-[#666666]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">Chat</span>
          </button>
          
          <button 
            onClick={() => onToggleMode('voice')}
            className={`flex items-center gap-1 px-3 py-1 border-x transition-colors duration-300 ${
              mode === 'voice'
                ? theme === 'dark' 
                  ? 'bg-[#252525] text-[#FFFFFF] border-x-[#252525]'
                  : 'bg-[#E0E0E0] text-[#000000] border-x-[#D0D0D0]'
                : theme === 'dark'
                  ? 'hover:bg-[#1A1A1A] text-[#8E8E8E] border-x-[#252525]'
                  : 'hover:bg-[#F0F0F0] text-[#666666] border-x-[#D0D0D0]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-xs font-medium">Voice</span>
          </button>
          
          <button 
            onClick={() => onToggleMode('notes')}
            className={`flex items-center gap-1 px-3 py-1 transition-colors duration-300 ${
              mode === 'notes'
                ? theme === 'dark' 
                  ? 'bg-[#252525] text-[#FFFFFF]'
                  : 'bg-[#E0E0E0] text-[#000000]'
                : theme === 'dark'
                  ? 'hover:bg-[#1A1A1A] text-[#8E8E8E]'
                  : 'hover:bg-[#F0F0F0] text-[#666666]'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span className="text-xs font-medium">Notes</span>
          </button>
        </div>
        
        <button 
          onClick={onTakeNote}
          className={`flex items-center gap-2 px-3 py-1 rounded transition-colors duration-300 ${
            theme === 'dark'
              ? 'hover:bg-[#252525] text-[#8E8E8E] hover:text-[#FFFFFF]'
              : 'hover:bg-[#E0E0E0] text-[#666666] hover:text-[#000000]'
          }`}
          title="Take Note"
        >
          <PenLine className="w-4 h-4" />
          <span className="text-sm font-medium">Take Note</span>
        </button>
      </div>
      <div className="flex gap-4 dark:bg-[#1A1A1A] p-2 rounded-md">
        <button
          onClick={onToggleTheme}
          className="transition-colors duration-300"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#8E8E8E] hover:text-[#FFFFFF] transition-colors duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#666666] hover:text-[#000000] transition-colors duration-300" />
          )}
        </button>
        <Settings 
          className={`w-4 h-4 cursor-pointer transition-colors duration-300 ${
            theme === 'dark' 
              ? 'text-[#8E8E8E] hover:text-[#FFFFFF]' 
              : 'text-[#666666] hover:text-[#000000]'
          }`} 
          onClick={settingsButton} 
        />
        {collapsed
          ? <Expand 
              className={`w-4 h-4 cursor-pointer transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'text-[#8E8E8E] hover:text-[#FFFFFF]' 
                  : 'text-[#666666] hover:text-[#000000]'
              }`} 
              onClick={onToggleCollapse} 
            />
          : <Minimize 
              className={`w-4 h-4 cursor-pointer transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'text-[#8E8E8E] hover:text-[#FFFFFF]' 
                  : 'text-[#666666] hover:text-[#000000]'
              }`} 
              onClick={onToggleCollapse} 
            />}
      </div>
    </div>
  );
}

function App() {
  const [settings, setSettings] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const { mode, setMode, theme, toggleTheme } = useStore();

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    }
  };

  const handleToggleMode = (newMode: 'chat' | 'voice' | 'notes') => {
    setMode(newMode);
  };
  
  const handleTakeNote = () => {
    setNoteModalOpen(true);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", () => setIsDragging(false));
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", () => setIsDragging(false));
    };
  }, [isDragging, offset]);

  return (
    <div
      className={`fixed shadow-2xl flex flex-col border rounded-md overflow-hidden transition-colors duration-300 ${
        theme === 'dark' 
          ? 'border-[#252525]' 
          : 'border-[#D0D0D0]'
      }`}
      style={{
        top: position.y,
        left: position.x,
        width: "480px",
        maxHeight: "90vh",
        backgroundColor: theme === 'dark' ? '#0A0A0A' : '#FFFFFF',
      }}
    >
      <TitleBar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onDragStart={handleMouseDown}
        setSettings={setSettings}
        settings={settings}
        mode={mode}
        onToggleMode={handleToggleMode}
        theme={theme}
        onToggleTheme={toggleTheme}
        onTakeNote={handleTakeNote}
      />
      
      <NoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} />
      
      {!collapsed && (
        <div className="flex flex-col gap-2 p-0 overflow-auto">
          {mode === 'voice' ? (
            <LiveAPIProvider apiKey={apiKey} url={uri}>
              <Speak />
            </LiveAPIProvider>
          ) : mode === 'chat' ? (
            <GenAIProvider apiKey={apiKey}>
              <Chat />
            </GenAIProvider>
          ) : (
            <NotesLibrary />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
