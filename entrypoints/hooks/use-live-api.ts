import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MultimodalLiveAPIClientConnection,
  MultimodalLiveClient,
} from "../lib/multimodal-live-client";
import { LiveConfig } from "../lib/multimodal-live-types";
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import useStore from "@/entrypoints/store/store.ts";


export type UseLiveAPIResults = {
  client: MultimodalLiveClient;
  setConfig: (config: LiveConfig) => void;
  config: LiveConfig;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
};

export function useLiveAPI({
  url,
  apiKey,
}: MultimodalLiveAPIClientConnection): UseLiveAPIResults {
  const client = useMemo(
    () => new MultimodalLiveClient({ url, apiKey }),
    [url, apiKey],
  );
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const transcript = useStore((state) => state.transcript);

  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConfig>({
    model: "models/gemini-2.0-flash-exp",
    systemInstruction: {
      parts:
        [{
          text: `
          You are Wizzly, an AI assistant for YouTube tutorial videos. Your task is to help users understand and navigate the video transcript by:

Answering questions based on the transcript.

Providing timestamps when relevant.

Summarizing sections or the full video.

Extracting key points and notes for easy review.

Detecting when help is needed (e.g., frequent pauses or rewinds).

Only use the transcript provided. If information is missing, politely inform the user.
Say Hello to the user if understood and when you start.
Transcript:
${transcript}
` }]
    },
  });

  useEffect(() => {
    console.log("Transcript updated in Zustand:", transcript); // Debug log

    setConfig((prevConfig) => ({
      ...prevConfig,
      systemInstruction: {
        parts: [
          {
            text: `
            You are Wizzly, an AI assistant for YouTube tutorial videos. Your task is to help users understand and navigate the video transcript by:

            Answering questions based on the transcript.
            Providing timestamps when relevant.
            Summarizing sections or the full video.
            Extracting key points and notes for easy review.
            Detecting when help is needed (e.g., frequent pauses or rewinds).

            Only use the transcript provided. If information is missing, politely inform the user.

            Say Hello to the user if understood and when you start.

            Transcript:
            ${transcript}
          `,
          },
        ],
      },
    }));
  }, [transcript]);
  const [volume, setVolume] = useState(0);
  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onClose = () => {
      setConnected(false);
    };

    const stopAudioStreamer = () => audioStreamerRef.current?.stop();

    const onAudio = (data: ArrayBuffer) =>
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));

    client
      .on("close", onClose)
      .on("interrupted", stopAudioStreamer)
      .on("audio", onAudio);

    return () => {
      client
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio);
    };
  }, [client]);

  const connect = useCallback(async () => {
    console.log(config);
    if (!config) {
      throw new Error("config has not been set");
    }
    client.disconnect();
    await client.connect(config);
    console.log("Transcript set in config", transcript);
    setConnected(true);
  }, [client, setConnected, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    connected,
    connect,
    disconnect,
    volume,
  };
}
