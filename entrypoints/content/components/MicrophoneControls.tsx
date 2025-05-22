import { useState, useEffect, useRef } from "react";
import { AudioRecorder } from "@/entrypoints/lib/audio-recorder.ts";
import { useLiveAPIContext } from "@/entrypoints/contexts/LiveAPIContext.tsx";
import { Mic, MicOff, Pause, Play } from "lucide-react";
import image from '@/entrypoints/assets/image.png';
import gif from '@/entrypoints/assets/wizzlytalkss.gif';
import useStore from '@/entrypoints/store/store';

const Speak = () => {
  const [inVolume, setInVolume] = useState(50);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const connectButtonRef = useRef<HTMLElement>(null);
  const { client, connect, connected, volume, disconnect } = useLiveAPIContext();
  const { theme } = useStore();
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!connected && connectButtonRef.current) {
      connectButtonRef.current.focus();
    }
  }, [connected]);

  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64
        }
      ]);
    };
    if (connected && !muted && audioRecorder) {
      audioRecorder.on("data", onData).on("volume", setInVolume).start();
    } else {
      audioRecorder.stop();
    }
    return () => {
      audioRecorder.off("data", onData).off("volume", setInVolume).stop();
    };
  }, [connected, client, muted, audioRecorder]);

  useEffect(() => {
    setIsPlaying(volume > 0.01)
  }, [volume]);

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
    <div className={`flex flex-col flex-1 justify-end items-center overflow-y-hidden h-[480px] py-4 transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#FFFFFF]'}`}>
      <style>{scrollbarStyles}</style>
      <div className="relative w-full flex-1 flex justify-center items-center overflow-hidden p-4 hide-scrollbar">
        <img
            src={isPlaying ? gif : image}
            className="w-auto h-auto object-contain rounded-md"
            style={{ maxHeight: "320px", maxWidth: "100%" }}
        />
      </div>
      <div className="flex gap-3 mt-6 mb-3">
        <button
          ref={connectButtonRef as any}
          className="bg-[#2B5DF5] text-white px-5 py-2 rounded-sm focus:outline-none hover:bg-[#1E4AD1] transition-colors"
          onClick={connected ? disconnect : connect}
          style={{ height: '42px' }}
        >
          {connected ? 
            <div className="flex items-center gap-2">
              <Pause className="w-4 h-4" />
              <span className="text-sm font-medium">Stop</span>
            </div> : 
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span className="text-sm font-medium">Start</span>
            </div>
          }
        </button>
        <button
          onClick={() => setMuted(!muted)}
          className={`px-5 py-2 rounded-sm focus:outline-none transition-colors flex items-center gap-2 ${
            muted 
              ? `${isDark ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#333333]' : 'bg-[#EBEBEB] text-[#000000] hover:bg-[#D0D0D0]'}` 
              : "bg-[#F53B3B] text-white hover:bg-[#D72F2F]"
          }`}
          style={{ height: '42px' }}
        >
          {muted ? 
            <>
              <MicOff className="w-4 h-4" />
              <span className="text-sm font-medium">Unmute</span>
            </> : 
            <>
              <Mic className="w-4 h-4" />
              <span className="text-sm font-medium">Mute</span>
            </>
          }
        </button>
      </div>
    </div>
  );
};

export default Speak;
