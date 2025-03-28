import React, { useState, useEffect, useRef } from "react";
import { AudioRecorder } from "@/entrypoints/lib/audio-recorder.ts";
import { useLiveAPIContext } from "@/entrypoints/contexts/LiveAPIContext.tsx";
import { AudioStreamer } from "@/entrypoints/lib/audio-streamer.ts";
import { Mic, MicOff, Pause, Play } from "lucide-react";
import AudioPulse from "@/entrypoints/content/components/AudioPulse.tsx";
import classNames from "classnames";

const Speak = () => {
    const [inVolume, setInVolume] = useState(50);
    const [audioRecorder] = useState(() => new AudioRecorder());
    const [muted, setMuted] = useState(false);
    const audioStreamerRef = useRef<AudioStreamer | null>(null);
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

    return (
        <div className="h-56 flex flex-col justify-end items-center">
            {connected ? <div className={` animate-pulse`}>
                <svg
                    width="160"
                    height="160"
                    viewBox="0 0 200 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={classNames(
                        "w-full h-full",
                        "transition-all duration-30"
                    )}
                >
                    <g clipPath="url(#clip0_235_973)">
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M100 -4.37114e-06C155.228 -6.78525e-06 200 44.7715 200 100C200 155.228 155.228 200 100 200C44.7715 200 5.67237e-06 155.228 3.25826e-06 100C8.44143e-07 44.7715 44.7715 -1.95703e-06 100 -4.37114e-06ZM100 -4.37114e-06C138.108 -6.03688e-06 169 30.8923 169 69C169 107.108 138.108 138 100 138C61.8924 138 31 107.108 31 69C31 30.8923 61.8924 -2.7054e-06 100 -4.37114e-06ZM132 69C132 51.3269 117.673 37 100 37C82.3269 37 68 51.3269 68 69C68 86.6731 82.3269 101 100 101C117.673 101 132 86.6731 132 69Z"
                            fill="url(#paint0_linear_235_973)"
                        />
                    </g>
                    <defs>
                        <linearGradient
                            id="paint0_linear_235_973"
                            x1="-9.344e-06"
                            y1="23"
                            x2="152.5"
                            y2="160.5"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop stopColor="#B0B9FF" />
                            <stop offset="1" stopColor="#E7E9FF" />
                        </linearGradient>
                        <clipPath id="clip0_235_973">
                            <rect
                                width="200"
                                height="200"
                                fill="white"
                                transform="translate(7.62939e-06 200) rotate(-90)"
                            />
                        </clipPath>
                    </defs>
                </svg></div> : <span className="badge badge-accent">Not Connected</span>}
            <div className="flex flex-row justify-center gap-5 mt-4">
                <button
                    ref={connectButtonRef}
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
