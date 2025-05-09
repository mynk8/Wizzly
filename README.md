# Wizzly - AI-Powered YouTube Video Assistant

Wizzly is a powerful browser extension that enhances your YouTube watching experience by providing AI-powered insights and analysis of video content. It integrates directly with YouTube to offer real-time transcript extraction, voice-based interaction, and intelligent responses to your questions about the video content.

## Features

- **Real-time Transcript Analysis**: Automatically extracts and processes video transcripts
- **Voice Interaction**: Ask questions using voice input with a built-in audio visualizer
- **Draggable UI**: Customizable floating interface that can be positioned anywhere on the screen
- **Video Controls**: Quick access to play/pause controls
- **Transcript Status**: Real-time monitoring of transcript availability
- **Settings Panel**: Customizable extension settings
- **Cross-Browser Support**: Works on both Chrome and Firefox

## Prerequisites

- Node.js 18.0.0 or higher
- pnpm 8.0.0 or higher
- Modern web browser (Chrome or Firefox)
- Google Gemini API key (for AI features)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wizzly.git
cd wizzly
```

2. Install dependencies:
```bash
pnpm install
```

3. Configure your environment:
   - Create a `.env` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

4. Build the extension:
```bash
# For development
pnpm dev

# For production
pnpm build
```

## Development

### Development Mode

```bash
# Chrome development
pnpm dev

# Firefox development
pnpm dev:firefox
```

### Building for Production

```bash
# Chrome build
pnpm build

# Firefox build
pnpm build:firefox
```

### Creating Distribution Packages

```bash
# Chrome package
pnpm zip

# Firefox package
pnpm zip:firefox
```

## Project Structure

```
wizzly/
├── entrypoints/
│   └── content/           # Content script components
│       ├── components/    # React components
│       ├── App.tsx        # Main application component
│       ├── settings.tsx   # Settings panel
│       └── style.css      # Styles
├── public/               # Static assets
├── src/                 # Source code
├── wxt.config.ts        # WXT configuration
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Project dependencies
```

## Dependencies

### Core Dependencies
- React 18.3.1
- TypeScript 5.8.2
- Tailwind CSS 4.0.17
- WXT 0.19.29
- Zustand 5.0.3 (State management)
- Lucide React 0.484.0 (Icons)
- Google Generative AI 0.24.0

### Development Dependencies
- @wxt-dev/module-react 1.1.3
- DaisyUI 5.0.9
- TypeScript 5.8.2

## Features in Detail

### Transcript Extraction
- Real-time monitoring of transcript availability
- Automatic extraction of video transcripts
- Support for multiple languages
- Status indicator for transcript availability

### Voice Interaction
- Built-in microphone controls
- Real-time audio visualization
- Voice-to-text conversion
- AI-powered response generation

### User Interface
- Draggable floating window
- Collapsible interface
- Customizable position
- Video playback controls
- Settings panel

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## Acknowledgments

- [WXT](https://wxt.dev/) for the web extension development tools
- [React](https://reactjs.org/) for the UI library
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [DaisyUI](https://daisyui.com/) for the component library
- [Google Gemini AI](https://ai.google.dev/) for the AI capabilities
