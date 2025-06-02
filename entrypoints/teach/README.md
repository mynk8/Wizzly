# Wizzly - Interactive Teaching Platform

Wizzly is a comprehensive teaching platform that combines interactive canvases, AI-powered assistance, and detailed analytics to create engaging educational experiences.

## 🚀 Features

### 📝 Interactive Canvas
- **Drawing Tools**: Create visual explanations with intuitive drawing tools
- **YouTube Integration**: Embed YouTube videos directly into your canvas with Ctrl+Click interaction
- **Shape Tools**: Add geometric shapes, text, and annotations
- **Real-time Collaboration**: Share your canvas with students in real-time

### 🤖 AI-Powered Assistant
- **Chat Support**: Get instant help with lesson planning and content creation
- **Voice Controls**: Hands-free interaction with voice commands
- **Content Suggestions**: AI-powered recommendations for teaching materials

### 📚 Canvas Library
- **Save & Organize**: Build a comprehensive library of teaching materials
- **Search & Filter**: Find content by subject, grade level, or tags
- **Favorites**: Mark frequently used canvases for quick access
- **Sharing**: Share canvases with colleagues and students
- **Templates**: Use pre-built templates for common subjects

### 📊 Analytics Dashboard
- **Performance Metrics**: Track views, engagement, and student interaction
- **Content Analytics**: See which materials perform best
- **Usage Patterns**: Understand when and how your content is accessed
- **Geographic Insights**: See where your content is being used
- **AI Recommendations**: Get data-driven suggestions for improvement

### 📝 Smart Notes
- **Canvas Screenshots**: Automatically capture canvas states
- **Organized Storage**: Categorize notes by topic and subject
- **Search Functionality**: Find notes quickly with full-text search
- **Export Options**: Export notes in various formats

### 🎯 Teaching Dashboard
- **Quick Actions**: Fast access to common teaching tasks
- **Recent Activity**: See your latest teaching activities
- **Upcoming Events**: Keep track of classes and deadlines
- **Performance Summary**: Overview of your teaching metrics

## 🏗️ Architecture

### Components Structure

```
entrypoints/teach/
├── components/
│   ├── CanvasLibrary.tsx      # Canvas management and organization
│   ├── TeachingDashboard.tsx  # Main dashboard overview
│   └── AnalyticsDashboard.tsx # Detailed analytics and insights
├── main.tsx                   # Main application entry point
├── main.html                  # Application HTML file
├── index.html                 # Landing page
└── style.css                  # Custom styles
```

### Key Features Implementation

#### YouTube Shape Integration
- Custom `YouTubeShapeUtil` for embedding videos
- Ctrl+Click interaction for video controls
- Automatic URL detection and parsing
- Responsive video sizing

#### Canvas Library Management
- Local storage with mock data (ready for backend integration)
- Advanced filtering and sorting
- Grid and list view modes
- Metadata management (tags, subjects, grade levels)

#### Analytics Engine
- Comprehensive metrics tracking
- Device and geographic analytics
- Time-based activity patterns
- AI-powered insights and recommendations

## 🎨 Design System

### UI Framework
- **DaisyUI**: Component library for consistent design
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Consistent iconography
- **Responsive Design**: Mobile-first approach

### Color Scheme
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Secondary**: Purple accents
- **Success**: Green indicators
- **Warning**: Orange alerts
- **Error**: Red notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Modern web browser with ES6+ support

### Installation
1. Clone the repository
2. Navigate to the teach mode directory
3. Install dependencies (if using a build system)
4. Open `index.html` for the landing page or `main.html` for the app

### Usage

#### Landing Page
- Visit `index.html` for the marketing landing page
- Showcases all features with interactive elements
- Responsive design for all devices

#### Main Application
- Visit `main.html` to launch the teaching canvas
- Use the sidebar to access different tools and features
- Create, save, and manage your teaching materials

## 🔧 Configuration

### API Integration
The application is designed to work with various backend services:

```typescript
// API Key configuration (replace with your keys)
const apiKey = "your-gemini-api-key";

// Supabase configuration (for data persistence)
const supabaseConfig = {
  url: "your-supabase-url",
  key: "your-supabase-key"
};
```

### Feature Flags
Enable/disable features based on your needs:

```typescript
const features = {
  aiChat: true,
  voiceControls: true,
  analytics: true,
  canvasLibrary: true,
  youtubeIntegration: true
};
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Adaptive Features
- Collapsible sidebar on mobile
- Touch-friendly controls
- Responsive grid layouts
- Mobile-optimized navigation

## 🔒 Privacy & Security

### Data Handling
- Local storage for user preferences
- Secure API communication
- No sensitive data stored in localStorage
- GDPR-compliant data practices

### Content Security
- XSS protection for user-generated content
- Secure YouTube embedding
- Input sanitization
- Safe file handling

## 🤝 Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use consistent naming conventions
3. Write comprehensive documentation
4. Test on multiple devices and browsers
5. Maintain accessibility standards

### Code Style
- Use functional components with hooks
- Implement proper error handling
- Follow React best practices
- Use TypeScript for type safety

## 📈 Performance

### Optimization Features
- Lazy loading for components
- Efficient state management
- Optimized bundle sizes
- Progressive loading for large datasets

### Monitoring
- Performance metrics tracking
- Error boundary implementation
- User experience monitoring
- Load time optimization

## 🔮 Future Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user canvas editing
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native iOS and Android applications
- **LMS Integration**: Connect with popular learning management systems
- **Advanced AI**: More sophisticated teaching assistance
- **3D Visualizations**: Interactive 3D models and simulations

### Roadmap
- Q1 2024: Real-time collaboration
- Q2 2024: Mobile applications
- Q3 2024: Advanced AI features
- Q4 2024: LMS integrations

## 📞 Support

### Documentation
- Component API documentation
- Integration guides
- Best practices
- Troubleshooting guides

### Community
- GitHub Issues for bug reports
- Feature requests and discussions
- Community contributions welcome
- Regular updates and improvements

---

**Wizzly** - Empowering educators with interactive teaching tools and AI-powered assistance.

© 2024 Wizzly. All rights reserved. 

# Wizzly Teach Mode - AI Integration

## Overview

Wizzly Teach Mode now includes comprehensive AI integration powered by Google's Gemini API. The system provides context-aware assistance for educators across different teaching scenarios.

## New Features

### 🤖 Context-Aware AI Assistant

The AI assistant automatically adapts its behavior based on the current context:

- **YouTube Mode**: Video analysis, content extraction, and educational material creation
- **Canvas Mode**: Visual content suggestions, diagramming assistance, and drawing guidance  
- **Lesson Planner Mode**: Comprehensive lesson planning, objective refinement, and activity generation
- **General Mode**: Flexible educational assistance

### 🎯 AI-Powered Lesson Planning

- **Automatic Lesson Plan Generation**: Create complete lesson plans from topic, grade level, and duration
- **SMART Objective Refinement**: Transform basic objectives into specific, measurable learning goals
- **Activity Suggestions**: Generate engaging activities aligned with learning objectives
- **Educational Content Analysis**: Analyze videos, texts, and other materials for teaching insights

### 🔧 Tool Calling Integration

The AI can execute actions directly:

- **YouTube Controls**: Play, pause, jump to timestamps, get video status
- **Canvas Operations**: Drawing suggestions, visual content guidance
- **Lesson Management**: Create, update, and organize lesson components

## Implementation Details

### Core Components

1. **GeminiAIService** (`lib/gemini-ai-service.ts`)
   - Handles all AI interactions with context awareness
   - Manages lesson plan generation and objective refinement
   - Provides video content analysis

2. **ToolHandler** (`lib/tool-handler.ts`)
   - Processes function calls from the AI
   - Executes YouTube controls and teaching tools
   - Handles cross-context operations

3. **useAIService Hook** (`hooks/use-ai-service.ts`)
   - React hook for AI service integration
   - Manages loading states and error handling
   - Provides conversation history management

4. **Context-Aware Components**
   - **MicrophoneControls**: Voice assistant with context indicators
   - **LessonPlanner**: AI-powered lesson planning interface
   - **ApiKeySettings**: Secure API key management

### State Management

The global Zustand store now includes:

```typescript
interface StoreState {
  // Context awareness
  appContext: AppContext; // 'youtube' | 'canvas' | 'lesson-planner' | 'general'
  setAppContext: (context: AppContext) => void;
  
  // AI state
  isAiLoading: boolean;
  aiError: string | null;
  
  // API Key management
  geminiApiKey: string | null;
  setGeminiApiKey: (key: string | null) => void;
}
```

### Function Declarations

The system includes comprehensive function declarations for:

- **YouTube Controls**: Video playback management
- **Teaching Tools**: Lesson planning, objective refinement, content analysis
- **Canvas Assistance**: Visual content creation guidance

### Security & Privacy

- API keys are stored locally in browser storage
- No sensitive data is transmitted to external servers
- All AI interactions are direct with Google's Gemini API

## Usage Examples

### Setting Up API Key

```typescript
import useStore from '@/entrypoints/store/store';

const { setGeminiApiKey } = useStore();
setGeminiApiKey('your-gemini-api-key');
```

### Using AI Service

```typescript
import { useAIService } from '@/entrypoints/hooks/use-ai-service';

const aiService = useAIService({ 
  apiKey: 'your-api-key', 
  context: 'lesson-planner' 
});

// Generate lesson plan
const lessonPlan = await aiService.generateLessonPlan(
  'Photosynthesis',
  '6-8',
  45
);

// Refine objective
const refinedObjective = await aiService.refineObjective(
  'Students will learn about plants',
  '6-8',
  'Biology'
);
```

### Context Switching

```typescript
import useStore from '@/entrypoints/store/store';

const { setAppContext } = useStore();

// Switch to lesson planner mode
setAppContext('lesson-planner');

// Switch to canvas mode
setAppContext('canvas');

// Switch to YouTube mode
setAppContext('youtube');
```

## Getting Started

1. **Obtain Gemini API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key for use in Wizzly

2. **Configure API Key**
   - Click the settings button in the top-right corner
   - Enter your Gemini API key
   - Save the configuration

3. **Start Using AI Features**
   - The AI assistant will automatically adapt to your current context
   - Use voice commands or chat interface for assistance
   - Access AI-powered tools in the lesson planner

## Error Handling

The system includes comprehensive error handling:

- **API Key Validation**: Checks for proper key format
- **Network Error Recovery**: Graceful handling of connection issues
- **Context Validation**: Ensures appropriate tools are available for each context
- **User Feedback**: Clear error messages and loading indicators

## Future Enhancements

- **Multi-language Support**: Lesson planning in multiple languages
- **Advanced Analytics**: Learning outcome predictions and recommendations
- **Collaborative Features**: Shared lesson planning with AI assistance
- **Integration Expansion**: Additional educational platforms and tools 