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

function extractVideoId() {
    const url = window.location.href;
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v') || null;
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
    const store = useStore.getState();
    let lastCheckedVideoId: string | null = null;
    let transcriptUpdateTimeout: ReturnType<typeof setTimeout> | null = null;
    
    setInterval(() => {
        const currentVideoId = extractVideoId();
        
        if (currentVideoId !== lastCheckedVideoId) {
            console.log("Video changed, updating video ID");
            lastCheckedVideoId = currentVideoId;
            store.setCurrentVideoId(currentVideoId);
            
            if (store.transcript) {
                store.setTranscript(null);
            }
            
            if (transcriptUpdateTimeout) {
                clearTimeout(transcriptUpdateTimeout);
            }
            
            transcriptUpdateTimeout = setTimeout(() => {
        pollTranscriptPanel();
                
                setTimeout(() => {
                    const transcript = extractTranscript();
                    if (transcript && transcript !== store.transcript) {
                        console.log("Transcript updated for new video");
                        store.setTranscript(transcript);
                    }
                }, 2000);
            }, 1000);
        }
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

