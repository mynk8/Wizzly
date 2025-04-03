import { storage } from 'wxt/storage';
import "./style.output.css";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import useStore  from "../store/store";

function normalizeTranscript(text: string | unknown) {
    // @ts-ignore
    return text.replace(/\s+/g, ' ').trim();
}

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
        .then((storedTranscript: string | unknown) => {
            const normalizedStored = storedTranscript ? normalizeTranscript(storedTranscript) : '';
            const normalizedNew = normalizeTranscript(transcript);

            // ✅ Ensure Zustand state updates correctly
            const setTranscript = useStore.getState().setTranscript;
            if (typeof setTranscript === "function") {
                setTranscript(transcript);
                console.log("✅ Zustand transcript updated.");
            } else {
                console.error("❌ Zustand setTranscript is not a function!");
            }

            storage.setItem("local:YTTranscript", transcript)
                .then(() => {
                    console.log("✅ Transcript saved successfully.");
                    console.log(transcript)
                })
                .catch(error => {
                    console.error("❌ Storage error during save:", error);
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
    } else {
        /* empty */
    }
}

function pollTranscriptPanel() {
    // If the transcript panel isn't open, try to open it.
    if (!document.querySelector('ytd-transcript-renderer')) {
        console.log("Transcript panel not open. Attempting to open...");
        openTranscriptPanel();
    }
}

function startObserving() {
    // Poll every 2 seconds to ensure the transcript panel is open.
    setInterval(() => {
        pollTranscriptPanel();
    }, 2000);

    // Poll every 2 seconds to update the transcript in storage (only if changed).
    setInterval(() => {
        sendVideoInfoToStorage();
    }, 2000);
}

export default defineContentScript({
  matches: ["*://*/*"],
  cssInjectionMode: "ui",

  async main(ctx) {
    const container = document.createElement("div");
    container.id = "wxt-react-example-container";
    container.style.position = "fixed";
    container.style.top = "50px";
    container.style.left = "50px";
    container.style.zIndex = "9999";
    container.style.maxHeight = "10vh";
    container.style.cursor = "grab";
    container.style.overflow = "hidden";
    document.body.prepend(container);

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    container.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - container.getBoundingClientRect().left;
      offsetY = e.clientY - container.getBoundingClientRect().top;
      container.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      container.style.left = `${e.clientX - offsetX}px`;
      container.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      container.style.cursor = "grab";
    });

    // Wrap the app container in a Shadow DOM
    const ui = await createShadowRootUi(ctx, {
      name: "wxt-react-example",
      // Use the draggable container as the anchor for the Shadow DOM.
      position: "inline",
      anchor: container,
      append: "first", onMount: (shadowContainer) => {
          shadowContainer.style.all = "unset";
        const root = ReactDOM.createRoot(shadowContainer);
        root.render(<App />);
        return { root };
      },
      onRemove: (elements) => {
        elements?.root.unmount();
        container.remove();
      },
    });

    ui.mount();
    startObserving();
  },
});

