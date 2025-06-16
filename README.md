# Wizzly: Bridging the Education Gap with Offline-First AI Tools

Uneven access to quality education remains a major barrier for millions of students worldwide, especially in low-connectivity regions. Traditional digital tools often assume constant internet access, skilled educators, and expensive infrastructure.

Wizzly bridges this gap with an AI-powered Chrome extension suite designed for both teachers and students, optimized to work offline-first.

It includes:

**Wizzly Canvas** — a visual teaching workspace for educators to plan lessons, embed YouTube videos, generate AI-based objectives, and annotate with full offline support.

**YouTube Assistant Extension** — a lightweight student-facing tool that allows learners to ask doubts, control video playback via chat or voice, and engage in voice-to-voice conversations with an AI assistant — all while watching YouTube tutorials.

Together, these tools offer a multimodal, low-bandwidth, and inclusive learning experience — tailored for the realities of modern classrooms in underserved regions.

## The Problem

Millions of students, particularly in underserved regions, face significant barriers to quality education:

- **Unreliable or No Internet** – Limited connectivity restricts access to digital learning platforms and AI-powered tools.  
- **Poor Infrastructure** – Many schools lack basic hardware, stable electricity, or modern devices needed for digital learning.  
- **Resource Gaps** – Outdated or insufficient textbooks, learning materials, and tools limit effective learning.  
- **Shortage of Skilled Educators** – A lack of trained teachers or overburdened staff reduces the quality of instruction.  

These issues widen the digital divide and prevent equitable access to modern, high-quality education.

## 💡 The Solution

Wizzly directly attacks the root causes of digital educational inequality with a powerful, AI-powered offline-first suite—eliminating the need for costly infrastructure, consistent connectivity, or complex tools. It’s a single, unified platform that gives students autonomy and teachers superpowers, regardless of their environment.

- **Offline-First by Design**: All core features—interactive canvas, note-taking, whiteboard, PDF exports, and voice controls—work fully without internet. No logins, no server dependencies.  
- **AI Doubt Solving, Embedded in YouTube**: Transforms any YouTube tutorial into a smart classroom. Students can pause, ask doubts via chat or voice, and get real-time AI explanations. No additional app. No friction.  
- **One-Stop Teaching Workspace**: Teachers can visually plan lessons, write over embedded videos, save reusable content, and even generate AI-powered objectives—all inside a drag-and-drop whiteboard.  
- **Voice-First, Inclusive Interaction**: 95%+ accurate voice recognition, multilingual input support, and natural language understanding make it usable for early learners, rural classrooms, or visually impaired users.  
- **No Setup. No Barriers.**: Install once as a Chrome extension. Works instantly on any device with a browser—no admin permissions, logins, or backend infrastructure needed.  
- **Real-Time Sync with Video**: Notes, screenshots, and AI responses are auto-synced with YouTube timestamps for frictionless review and retention.  
- **Fail-Safe Architecture**: If internet cuts off, Wizzly seamlessly switches to offline-only mode so that learning never stops.  
- **Built for Low-End Devices**: Lightweight frontend, no backend calls, and full local storage usage make it ideal for low-RAM, low-power systems.  

Wizzly doesn’t just digitize education—it decentralizes it.** It removes every traditional blocker—connectivity, cost, hardware, and complexity—and delivers a truly inclusive, personalized, and scalable solution aligned with **UN SDG 4: Quality Education.

## ✨ Features

### For Educators

| **Capability**                     | **GIF**             | **Description**                                                                             |
|-----------------------------------|---------------------|---------------------------------------------------------------------------------------------|
| **Interactive Digital Canvas**    | drawing-canvas.gif  | A dynamic space for illustrating concepts, diagrams, and collaborative teaching.            |
| **Smart Note Integration**        | [adding-notes.gif](https://github.com/mynk8/Wizzly/blob/main/Untitled%20video%20-%20Made%20with%20Clipchamp%20(3).gif)    | Seamlessly add structured notes during sessions to enhance lesson delivery.                |
| **AI-Powered Answer Assistance**  | canvas-ans.gif      | Instantly retrieve accurate answers and insights on the canvas via AI prompts.             |
| **Conversational AI Chat**        | chat-ai.gif         | Engage in meaningful dialogue with AI to support content creation and queries.             |
| **Real-Time Voice Interaction**   | voice-ai.gif        | Voice-to-voice conversations with AI to streamline planning and clarification.             |
| **Exportable Teaching Material**  | print-notes.gif     | Convert live notes and sessions into downloadable PDFs for offline access.                 |
| **Automated Lesson Plan Generator** | lesson-gen.gif     | Generate detailed, curriculum-aligned lesson plans with AI in seconds.                     |
| **Embedded Resource Integration** | add-resources.gif   | Easily attach external links, documents, and videos for comprehensive lessons.             |

### For Learners

| **Capability**                     | **GIF**             | **Description**                                                                             |
|-----------------------------------|---------------------|---------------------------------------------------------------------------------------------|
| **AI-Driven Learning Companion**  | chat-assist.gif     | Receive real-time explanations and doubt resolution while watching tutorials.              |
| **Interactive Voice Support**     | voice-talk.gif      | Converse directly with AI to clarify concepts without disrupting learning flow.            |
| **Personal Note Management**      | student-notes.gif   | Take, organize, and revisit notes alongside videos — tailored for retention.               |
| **Intelligent Video Control**     | video-control.gif   | Navigate video content using chat or voice commands for a smoother experience.             |

## Technology Stack

Wizzly is built using a lightweight, resilient, and browser-native architecture tailored for both online and offline learning environments. The stack emphasizes accessibility, performance, and ease of use—making quality education truly borderless.

- **Chrome Extension Runtime**: Ensures smooth integration directly into the browser, allowing intelligent overlay features on platforms like YouTube and web-based learning tools.  
- **Tldraw API**: Powers the visual canvas with a flexible, interactive whiteboard for drawing, annotation, and lesson creation—ideal for teachers.  
- **ReactJS + JavaScript (ES6+)**: Drives a dynamic, responsive user interface across both the canvas and the AI assistant overlay, with reusable components for scalability.  
- **Web APIs (Speech Recognition, IndexedDB, etc.)**: Enable voice-based interaction, local data storage, and offline availability—crucial for low-connectivity areas.  
- **Tailwind CSS**: Provides a clean and consistent UI across components, optimized for both functionality and aesthetic simplicity.  
- **Firebase (Optional Cloud Sync)**: Supports user authentication, real-time collaboration, and cloud-based backup when internet is available.  
- **Vite + GitHub Actions**: Enables fast builds, modular development, and seamless deployment directly to the Chrome Web Store.  

This stack empowers Wizzly to function as a self-contained educational suite that works even in resource-constrained environments, supporting both teachers and students on the same platform.

## 🚀 Get Started

Follow these simple steps to begin your journey with **Wizzly**:

### Download the Extension

Go to the **GitHub Releases** section and download the file named:  
**wizzly-0.1.1.zip**

### Install on Chrome

1. **Unzip** the file.  
2. Open Chrome and go to:  
   `chrome://extensions`  
3. Enable **Developer Mode** (top-right).  
4. Click **"Load unpacked"** and select the unzipped `wizzly-0.1.1` folder.

### Using the YouTube Assistant

- Navigate to any YouTube video (youtube.com/watch).  
- Wizzly's AI Assistant overlay will automatically activate, allowing you to ask doubts, control the video, and more.

### Using the Teaching Canvas

- Click on the **Wizzly extension icon** in the Chrome toolbar.  
- Select **“Open Teaching Canvas”** to launch the interactive space for note creation, lesson planning, and real-time teaching tools.

> ⚠️ Please make sure your browser is in <strong>light mode</strong> for full extension compatibility and proper rendering of interface elements.

