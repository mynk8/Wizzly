import './style.css';
import { useState, useEffect } from "react";
import { Expand, Minimize, Settings, MessageSquare, Mic, Moon, Sun, BookMarked, PenLine, Pin, PinOff } from 'lucide-react';
import Speak from "@/entrypoints/content/components/MicrophoneControls.tsx";
import Chat from './components/Chat';
import { LiveAPIProvider } from "@/entrypoints/contexts/LiveAPIContext.tsx";
import { GenAIProvider } from '../contexts/ChatAPIContext';
import useStore from '@/entrypoints/store/store';
import NoteModal from './components/NoteModal';
import NotesLibrary from './components/NotesLibrary';

const apiKey = "AIzaSyAWOkUIDR7WsTmBeMr-1jA6VRH8SnLbbZI";

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
  onPinWindow: () => void;
  isPinned: boolean;
}

function TitleBar({ 
  collapsed, 
  onToggleCollapse, 
  onDragStart, 
  mode, 
  onToggleMode, 
  theme, 
  onToggleTheme,
  onTakeNote,
  onPinWindow,
  isPinned
}: TitleBarProps) {
  const settingsButton = async () => {
    browser.runtime.sendMessage({ action: "openSettings" });
  }
  return (
    <div
      className="navbar bg-base-200 min-h-0 px-4 py-3 border-b border-base-300 cursor-grab"
      onMouseDown={onDragStart}
    >
      <div className="flex-1 gap-3">
        <div className="join">
          <button 
            onClick={() => onToggleMode('chat')}
            className={`join-item btn btn-sm ${mode === 'chat' ? 'btn-neutral' : 'btn-ghost'}`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs font-medium">Chat</span>
          </button>
          
          <button 
            onClick={() => onToggleMode('voice')}
            className={`join-item btn btn-sm ${mode === 'voice' ? 'btn-neutral' : 'btn-ghost'}`}
          >
            <Mic className="w-4 h-4" />
            <span className="text-xs font-medium">Voice</span>
          </button>
          
          <button 
            onClick={() => onToggleMode('notes')}
            className={`join-item btn btn-sm ${mode === 'notes' ? 'btn-neutral' : 'btn-ghost'}`}
          >
            <BookMarked className="w-4 h-4" />
            <span className="text-xs font-medium">Notes</span>
          </button>
        </div>
        
        <button 
          onClick={onTakeNote}
          className="btn btn-ghost btn-sm gap-2"
          title="Take Note"
        >
          <PenLine className="w-4 h-4" />
          <span className="text-sm font-medium">Take Note</span>
        </button>
      </div>

      <div className="flex-none gap-2">
        <button
          onClick={onPinWindow}
          className="btn btn-ghost btn-square btn-sm"
          title={isPinned ? "Unpin Window" : "Pin Window"}
        >
          {isPinned ? (
            <PinOff className="w-4 h-4" />
          ) : (
            <Pin className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onToggleTheme}
          className="btn btn-ghost btn-square btn-sm"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={settingsButton}
          className="btn btn-ghost btn-square btn-sm"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={onToggleCollapse}
          className="btn btn-ghost btn-square btn-sm"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <Expand className="w-4 h-4" />
          ) : (
            <Minimize className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function App() {
  const [settings, setSettings] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeEdge, setResizeEdge] = useState<'right' | 'bottom' | 'corner' | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 540, height: window.innerHeight });
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const { mode, setMode, theme, toggleTheme } = useStore();
  const [isPinned, setIsPinned] = useState(true);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPinned) return;
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleResizeStart = (e: React.MouseEvent, edge: 'right' | 'bottom' | 'corner') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeEdge(edge);
    setOffset({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    } else if (isResizing && resizeEdge) {
      e.preventDefault();
      const deltaX = e.clientX - offset.x;
      const deltaY = e.clientY - offset.y;

      setOffset({ x: e.clientX, y: e.clientY });

      setDimensions(prev => {
        const newDimensions = { ...prev };
        
        if (resizeEdge === 'right' || resizeEdge === 'corner') {
          newDimensions.width = Math.max(320, prev.width + deltaX);
        }
        if (resizeEdge === 'bottom' || resizeEdge === 'corner') {
          newDimensions.height = Math.max(400, prev.height + deltaY);
        }
        
        return newDimensions;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeEdge(null);
  };

  const handleToggleMode = (newMode: 'chat' | 'voice' | 'notes') => {
    setMode(newMode);
  };
  
  const handleTakeNote = () => {
    setNoteModalOpen(true);
  };

  const handlePinWindow = () => {
    if (isPinned) {
      setPosition(lastPosition);
      setIsPinned(false);
    } else {
      setLastPosition(position);
      setPosition({ x: 0, y: 0 });
      setIsPinned(true);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, offset, resizeEdge]);

  return (
    <div
      className="fixed card shadow-2xl flex flex-col border border-base-300 overflow-hidden"
      style={{
        zIndex: 1000000000000,
        top: position.y,
        left: isPinned ? undefined : position.x,
        ...(isPinned && { right: 0 }),
        width: dimensions.width,
        height: collapsed ? 'auto' : dimensions.height,
        cursor: isResizing ? 
          resizeEdge === 'right' ? 'ew-resize' :
          resizeEdge === 'bottom' ? 'ns-resize' :
          'nwse-resize' : 'default'
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
        onPinWindow={handlePinWindow}
        isPinned={isPinned}
      />
      
      <NoteModal isOpen={noteModalOpen} onClose={() => setNoteModalOpen(false)} />
      
      {!collapsed && (
        <>
          <div className="flex-1 overflow-auto">
            {mode === 'voice' ? (
              <LiveAPIProvider options={{ apiKey: apiKey }}>
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

          {/* Resize handles */}
          {!isPinned && (
            <>
              <div
                className="absolute right-0 top-0 w-1 h-full cursor-ew-resize hover:bg-primary/20"
                onMouseDown={(e) => handleResizeStart(e, 'right')}
              />
              <div
                className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize hover:bg-primary/20"
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
              />
              <div
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/20"
                onMouseDown={(e) => handleResizeStart(e, 'corner')}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

export default App;
