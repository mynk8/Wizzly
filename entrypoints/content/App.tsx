import './style.output.css';
import {useState, useEffect} from "react";
import { Expand, Minimize, Settings } from 'lucide-react';
import Speak from "@/entrypoints/content/components/MicrophoneControls.tsx";
import { LiveAPIProvider } from "@/entrypoints/contexts/LiveAPIContext.tsx";

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
const apiKey = "";

function TranscriptStatus() {
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const checkTranscript = async () => {
      const transc = await storage.getItem("local:YTTranscript") as string;
      setStatus((transc && transc.length > 20) as boolean);
    };

    checkTranscript();
    const interval = setInterval(checkTranscript, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-xl text-green-500">{status ? "Fetched" : "Not Fetched"}</span>;
}

interface TitleBar {
    collapsed: boolean;
    onToggleCollapse: () => void;
    onDragStart: (e: any) => void;
    setSettings: (settings: boolean) => void;
    settings: boolean;
}

function TitleBar({ collapsed, onToggleCollapse, onDragStart, setSettings, settings } : TitleBar) {
  return (
    <div className="flex justify-end justify-between content-end px-3 py-2 bg-gray-950 text-white rounded-t-lg cursor-grab" onMouseDown={onDragStart}>
      {/* <span className="text-xl">Wizzly</span> */}
      <div className="flex  gap-3">
        {/* <TranscriptStatus /> */}
        <Settings className="w-5 h-5 cursor-pointer" onClick={() => setSettings(!settings)} />
        {collapsed ? <Expand className="w-5 h-5 cursor-pointer" onClick={onToggleCollapse} /> : <Minimize className="w-5 h-5 cursor-pointer" onClick={onToggleCollapse} />}
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

  const handleMouseDown = (e: MouseEvent) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset]);

  return (
      <div
          className="fixed shadow-xl p-2 flex flex-col"
          style={{
            backgroundColor: "#000",
            top: position.y,
            left: position.x,
            width: "300px",
            maxHeight: "50vh",
            overflow: "hidden",
          }}
     >
        <TitleBar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
            onDragStart={handleMouseDown}
            setSettings={setSettings}
            settings={settings}
        />
        {!collapsed && (
            <LiveAPIProvider apiKey={apiKey} url={uri}>
              <div className="flex flex-col flex-1 gap-3 p-3 overflow-auto overflow-y-hidden">
                <Speak />
              </div>
            </LiveAPIProvider>
        )}
      </div>
  );
}

export default App;
