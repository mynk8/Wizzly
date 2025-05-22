import {
  Content,
  GoogleGenAI,
  LiveCallbacks,
  LiveClientToolResponse,
  LiveConnectConfig,
  LiveServerContent,
  LiveServerMessage,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
  Part,
  Session,
  Tool,
} from "@google/genai";
import { EventEmitter } from "eventemitter3";
import { difference } from "lodash";
import { StreamingLog } from "./multimodal-live-types";
import { base64ToArrayBuffer } from "./utils";

/**
 * the events that this client will emit
 */

export interface MultimodalLiveClientEventTypes {
  open: () => void;
  log: (log: StreamingLog) => void;
  close: (event: CloseEvent) => void;
  audio: (data: ArrayBuffer) => void;
  content: (data: LiveServerContent) => void;
  interrupted: () => void;
  setupcomplete: () => void;
  turncomplete: () => void;
  toolcall: (toolCall: LiveServerToolCall) => void;
  toolcallcancellation: (toolcallCancellation: LiveServerToolCallCancellation) => void;
}

export type MultimodalLiveAPIClientConnection = {
  url?: string;
  apiKey: string;
};

export interface ToolDefinition extends Tool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * A event-emitting class that manages the connection to the GenAI service and emits
 * events to the rest of the application.
 * If you dont want to use react you can still use this.
 */
export class MultimodalLiveClient extends EventEmitter<MultimodalLiveClientEventTypes> {
  protected client: GoogleGenAI;
  protected session: Session | null = null;
  protected config: LiveConnectConfig | null = null;
  protected tools: ToolDefinition[] = [];

  constructor({ apiKey }: MultimodalLiveAPIClientConnection) {
    super();
    this.client = new GoogleGenAI({ apiKey });
    this.send = this.send.bind(this);
  }

  log(type: string, message: any) {
    const log: StreamingLog = {
      date: new Date(),
      type,
      message,
    };
    this.emit("log", log);
  }

  public getConfig() {
    return { ...this.config };
  }

  /**
   * Register tools that can be called by the model
   * @param tools Array of tool definitions
   */
  registerTools(tools: ToolDefinition[]) {
    this.tools = tools;
    // If already connected, reconnect with new tools
    if (this.session && this.config) {
      this.connect(this.config);
    }
  }

  async connect(config: LiveConnectConfig): Promise<boolean> {
    if (this.session) {
      this.disconnect();
    }

    this.config = config;

    const callbacks: LiveCallbacks = {
      onopen: () => {
        this.log("client.open", "Connected");
        this.emit("open");
      },
      onclose: (event: CloseEvent) => {
        this.log(
          "server.close",
          `disconnected ${event.reason ? `with reason: ${event.reason}` : ""}`
        );
        this.emit("close", event);
      },
      onerror: (event: ErrorEvent) => {
        this.log("server.error", event.message);
      },
      onmessage: (message: LiveServerMessage) => {
        if (message.setupComplete) {
          this.log("server.send", "setupComplete");
          this.emit("setupcomplete");
          return;
        }
        if (message.toolCall) {
          this.log("server.toolCall", message);
          this.emit("toolcall", message.toolCall);
          return;
        }
        if (message.toolCallCancellation) {
          this.log("server.toolCallCancellation", message);
          this.emit("toolcallcancellation", message.toolCallCancellation);
          return;
        }

        if (message.serverContent) {
          const { serverContent } = message;
          if ("interrupted" in serverContent) {
            this.log("server.content", "interrupted");
            this.emit("interrupted");
            return;
          }
          if ("turnComplete" in serverContent) {
            this.log("server.content", "turnComplete");
            this.emit("turncomplete");
          }

          if ("modelTurn" in serverContent) {
            let parts: Part[] = serverContent.modelTurn?.parts || [];

            // Handle audio parts
            const audioParts = parts.filter(
              (p) => p.inlineData && p.inlineData.mimeType?.startsWith("audio/pcm")
            );
            const base64s = audioParts.map((p) => p.inlineData?.data);

            // Strip audio parts out
            const otherParts = difference(parts, audioParts);

            base64s.forEach((b64) => {
              if (b64) {
                const data = base64ToArrayBuffer(b64);
                this.emit("audio", data);
                this.log("server.audio", `buffer (${data.byteLength})`);
              }
            });

            if (!otherParts.length) {
              return;
            }

            parts = otherParts;
            this.emit("content", { modelTurn: { parts } });
            this.log("server.content", message);
          }
        }
      },
    };

    try {
      // Merge tools into config if any are registered
      const configWithTools: LiveConnectConfig = {
        ...config,
        tools: this.tools.length > 0 ? this.tools : undefined,
      };

      this.session = await this.client.live.connect({
        model: "gemini-pro",  // Default model, can be overridden in config
        config: configWithTools,
        callbacks,
      });
      return true;
    } catch (error) {
      this.log("client.error", error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
      this.log("client.close", "Disconnected");
      return true;
    }
    return false;
  }

  sendRealtimeInput(chunks: Array<{ mimeType: string; data: string }>) {
    if (!this.session) {
      throw new Error("Session is not connected");
    }

    let hasAudio = false;
    let hasVideo = false;

    for (const chunk of chunks) {
      this.session.sendRealtimeInput({ media: chunk });
      if (chunk.mimeType.includes("audio")) {
        hasAudio = true;
      }
      if (chunk.mimeType.includes("image")) {
        hasVideo = true;
      }
      if (hasAudio && hasVideo) {
        break;
      }
    }

    const message = hasAudio && hasVideo
      ? "audio + video"
      : hasAudio
        ? "audio"
        : hasVideo
          ? "video"
          : "unknown";

    this.log("client.realtimeInput", message);
  }

  sendToolResponse(toolResponse: LiveClientToolResponse) {
    if (!this.session) {
      throw new Error("Session is not connected");
    }

    if (toolResponse.functionResponses && toolResponse.functionResponses.length) {
      this.session.sendToolResponse({
        functionResponses: toolResponse.functionResponses,
      });
      this.log("client.toolResponse", toolResponse);
    }
  }

  send(parts: Part | Part[], turnComplete: boolean = true) {
    if (!this.session) {
      throw new Error("Session is not connected");
    }

    const content = {
      turns: Array.isArray(parts) ? parts : [parts],
      turnComplete,
    };

    this.session.sendClientContent(content);
    this.log("client.send", content);
  }
}
