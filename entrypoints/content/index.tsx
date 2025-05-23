import { storage } from '#imports';
import "./style.output.css";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import useStore from "../store/store";


function extractTranscript() {
    const transcriptSegments = document.querySelectorAll('ytd-transcript-segment-renderer');
    if (transcriptSegments.length === 0) return null;

    return Array.from(transcriptSegments)
        .map(segment => {
            const textElement = segment.querySelector('.segment-text');
            const timestampElement = segment.querySelector('.segment-timestamp');
            const text = textElement?.textContent?.trim() || '';
            const timestamp = timestampElement?.textContent?.trim() || '';
            return `${timestamp}\n${text}`.trim();
        })
        .filter(item => item)
        .join('\n');
}

function sendVideoInfoToStorage() {
    const transcript = extractTranscript();
    if (!transcript) {
        console.log("No transcript available.");
        return;
    }

    storage.getItem("local:YTTranscript")
        .then((_) => {
            const setTranscript = useStore.getState().setTranscript;
            if (typeof setTranscript === "function") {
                setTranscript(transcript);
            }
            storage.setItem("local:YTTranscript", transcript)
                .catch(error => {
                    console.error("❌ Storage error during saving the transcript:", error);
                });
        })
        .catch(error => {
            console.error("❌ Error retrieving stored transcript:", error);
        });
}

function openTranscriptPanel() {
    const transcriptButton = document.querySelector('#description [aria-label="Show transcript"]');
    if (transcriptButton) {
        // @ts-ignore
        transcriptButton.click();
    }
}

function pollTranscriptPanel() {
    if (!document.querySelector('ytd-transcript-renderer')) {
        console.log("Transcript panel not open. Attempting to open...");
        openTranscriptPanel();
    }
}

function startObserving() {
    setInterval(() => {
        pollTranscriptPanel();
    }, 2000);

    setInterval(() => {
        sendVideoInfoToStorage();
    }, 2000);
}

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'wiz-agent',
      anchor: 'body',
      position: 'inline',
      onMount: (container) => {
        const root = ReactDOM.createRoot(container);
        root.render(<App />);
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
    startObserving();
  },
});

