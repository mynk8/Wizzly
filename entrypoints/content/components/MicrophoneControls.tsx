import React, { useState, useEffect, useRef } from "react";
import { AudioRecorder } from "@/entrypoints/lib/audio-recorder.ts";
import { useLiveAPIContext } from "@/entrypoints/contexts/LiveAPIContext.tsx";
import { AudioStreamer } from "@/entrypoints/lib/audio-streamer.ts";
import { Mic, MicOff, Pause, Play } from "lucide-react";
import image from '@/entrypoints/assets/image.png';
import gif from '@/entrypoints/assets/wizzlytalkss.gif';

const Speak = () => {
  const [inVolume, setInVolume] = useState(50);
  const [audioRecorder] = useState(() => new AudioRecorder());
  const [muted, setMuted] = useState(false);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const connectButtonRef = useRef<HTMLElement>(null);
  const { client, connect, connected, volume, disconnect } = useLiveAPIContext();

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

  return (
    <div className="flex flex-col flex-1 justify-end items-center overflow-y-scroll max-h-52">
      <div className="relative w-full max-h-[200px] flex justify-center overflow-hidden">
        <img
            src={isPlaying ? gif : image}
            className="w-full h-auto object-contain"
            style={{ maxHeight: "200px", maxWidth: "100%" }} // Force it to stay inside
        />
      </div>
      <div className="flex flex-row flex-1 justify-center gap-5 mt-4">
        <button
          ref={connectButtonRef as any}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          onClick={connected ? disconnect : connect}
        >
          {connected ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={() => setMuted(!muted)}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

export default Speak;
