import './style.output.css';
import { useState, useEffect } from "react";
import SettingsPage from "./settings.tsx";
import { Expand, Minimize, Pause, Play, Settings } from 'lucide-react';
import Speak from "@/entrypoints/content/components/MicrophoneControls.tsx";
import { LiveAPIProvider } from "@/entrypoints/contexts/LiveAPIContext.tsx";

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
const apiKey = "";

function TranscriptStatus() {
  const [status, setStatus] = useState(false);

  useEffect(() => {
    const checkTranscript = async () => {
      const transc = await storage.getItem("local:YTTranscript");
      setStatus(transc && transc.length > 20);
    };

    checkTranscript();
    const interval = setInterval(checkTranscript, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="badge badge-primary">{status ? "Fetched" : "Not Fetched"}</span>;
}

function togglePlayPause(play) {
  const video = document.querySelector("video");
  if (!video) return console.error("Video element not found!");
  play ? video.play() : video.pause();
}

function VideoControls() {
  return (
    <div className="flex gap-5 p-3 bg-base-200 rounded-lg shadow-md">
      <Play className="cursor-pointer" onClick={() => togglePlayPause(true)} />
      <Pause className="cursor-pointer" onClick={() => togglePlayPause(false)} />
    </div>
  );
}

function TitleBar({ collapsed, onToggleCollapse, onDragStart, setSettings, settings }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-primary text-white rounded-t-lg cursor-grab" onMouseDown={onDragStart}>
      <span className="badge badge-accent">Wizzly</span>
      <div className="flex items-center gap-3">
        <TranscriptStatus />
        <Settings className="w-5 h-5 cursor-pointer" onClick={() => setSettings(!settings)} />
        {collapsed ? <Expand className="w-5 h-5 cursor-pointer" onClick={onToggleCollapse} /> : <Minimize className="w-5 h-5 cursor-pointer" onClick={onToggleCollapse} />}
      </div>
    </div>
  );
}

function MainContent({ settings }) {
  return <SettingsPage />;
}

function App() {
  const [settings, setSettings] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
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
      className="fixed bg-base-100 shadow-xl border border-gray-300 rounded-lg p-2"
      style={{ top: position.y, left: position.x, width: "300px" }}
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
          <div className="flex flex-col gap-3 p-3">
            <Speak />
            {/* <MainContent settings={settings} />*/}
          </div>
        </LiveAPIProvider>
      )}
    </div>
  );
}

export default App;
