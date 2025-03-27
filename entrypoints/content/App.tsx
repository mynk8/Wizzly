import './style.output.css'
import { useState, useEffect } from "react";
import Chat from "./chat.tsx";
import Geminichat from "./geminichat.tsx";
import SettingsPage from "./settings.tsx";

function TranscriptStatus() {
  const [status, setStatus] = useState(false);
  const transcript = "";
  useEffect(() => {
    storage.getItem("local:YTTranscript")
    .then((transc) => {
        if (transc.length > 20 ) {
          setStatus(true);
          console.log(transc);
        }
      })
  })
  
  return (
    <>
      {status ? <label>Fetched</label> : <label> Not Fetched </label>}
    </>
  )
}

function togglePlayPause(play: boolean) {
  const video = document.querySelector("video");
  if (!video) {
    console.error("Video element not found!");
    return;
  }

  if (play) {
    video.play();
  } else {
    video.pause();
  }
}

function VideoCard() {
  return (
    <div className="shadow-sm w-54">
      <ul className="menu menu-horizontal bg-base-200 rounded-box w-full justify-center gap-5">
        <li className="btn-primary btn" onClick={() => togglePlayPause(true)}>Play</li>
        <li className="btn-primary btn" onClick={() => togglePlayPause(false)}>Pause</li>
      </ul>
    </div>
  );
}

function App() {
  const [settings, setSettings] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 100, y: 100 });

  // Handle drag start on title bar
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    setIsDragging(true);
    setOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle drag move
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  // Stop dragging
  const handleMouseUp = () => setIsDragging(false);

  // Attach event listeners
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
      className="fixed bg-base-200 bg-opacity-100 shadow-xl border border-gray-300 rounded-lg"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: "300px",
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between bg-blue-800 bg-opacity-100 text-white px-3 py-2 cursor-grab rounded-t-lg"
        onMouseDown={handleMouseDown}
      >
        <span>Floating Chat</span>
        <button
          className="btn btn-xs btn-secondary"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
        <TranscriptStatus />
      </div>

      {/* Collapsible Content */}
      {!collapsed && (
        <div className="flex flex-col gap-5 p-5">
          {/* Navigation Buttons */}
          <ul className="menu gap-5 menu-horizontal bg-base-200 rounded-box">
            <li>
              <button
                className="btn btn-neutral"
                onClick={() => setSettings(false)}
              >
                Home
              </button>
            </li>
            <li>
              <button
                className="btn btn-neutral"
                onClick={() => setSettings(true)}
              >
                Settings
              </button>
            </li>
          </ul>

          {/* Conditional Rendering */}
          {settings ? (
            <SettingsPage />
          ) : (
            <div className="bg-base-200">
              <VideoCard />
              <Chat />
              <Geminichat />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

