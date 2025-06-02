import { Type } from '@google/genai';

/**
 * Function declaration for playing YouTube videos
 */
export const playYouTubeVideoDeclaration = {
  name: 'play_youtube_video',
  description: 'Plays the currently loaded YouTube video on the page. Use this when the user asks to play, start, or resume the video.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

/**
 * Function declaration for pausing YouTube videos
 */
export const pauseYouTubeVideoDeclaration = {
  name: 'pause_youtube_video',
  description: 'Pauses the currently playing YouTube video on the page. Use this when the user asks to pause, stop, or halt the video.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

/**
 * Function declaration for getting YouTube video status
 */
export const getYouTubeVideoStatusDeclaration = {
  name: 'get_youtube_video_status',
  description: 'Gets the current playback status of the YouTube video, including whether it is playing, paused, current time, and duration. Use this when the user asks about the video status or current state.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
    required: [],
  },
};

/**
 * Function declaration for jumping to a specific time in the video
 */
export const jumpToTimeDeclaration = {
  name: 'jump_to_time',
  description: 'Jumps to a specific time in the YouTube video. Use this when the user asks to go to a specific time, skip to a timestamp, or jump to a particular moment in the video. Supports various time formats like "2:30", "90", "1m 30s".',
  parameters: {
    type: Type.OBJECT,
    properties: {
      timeInSeconds: {
        type: Type.NUMBER,
        description: 'The time to jump to in seconds. For example, 90 for 1:30, 150 for 2:30, etc. Can also parse time strings like "2:30" or "1m 30s".',
      },
    },
    required: ['timeInSeconds'],
  },
};

/**
 * Function declaration for generating lesson plans
 */
export const generateLessonPlanDeclaration = {
  name: 'generate_lesson_plan',
  description: 'Generates a comprehensive lesson plan based on topic, grade level, duration, and learning objectives. Use this when users want to create or improve lesson plans.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: 'The main topic or subject of the lesson (e.g., "Photosynthesis", "World War 2", "Fractions")',
      },
      gradeLevel: {
        type: Type.STRING,
        description: 'The target grade level (e.g., "K-2", "3-5", "6-8", "9-12", "College")',
      },
      duration: {
        type: Type.NUMBER,
        description: 'Lesson duration in minutes (e.g., 45, 60, 90)',
      },
      objectives: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Learning objectives for the lesson (optional)',
      },
      existingContent: {
        type: Type.STRING,
        description: 'Any existing lesson content to build upon (optional)',
      },
    },
    required: ['topic', 'gradeLevel', 'duration'],
  },
};

/**
 * Function declaration for refining learning objectives
 */
export const refineLearningObjectiveDeclaration = {
  name: 'refine_learning_objective',
  description: 'Refines and improves learning objectives to make them more specific, measurable, and aligned with educational standards (SMART objectives).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      originalObjective: {
        type: Type.STRING,
        description: 'The original learning objective text to be refined',
      },
      gradeLevel: {
        type: Type.STRING,
        description: 'The target grade level for context',
      },
      subject: {
        type: Type.STRING,
        description: 'The subject area for context',
      },
    },
    required: ['originalObjective'],
  },
};

/**
 * Function declaration for generating lesson activities
 */
export const generateLessonActivitiesDeclaration = {
  name: 'generate_lesson_activities',
  description: 'Generates engaging lesson activities based on learning objectives, grade level, and available time.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      objectives: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Learning objectives for the activities',
      },
      gradeLevel: {
        type: Type.STRING,
        description: 'Target grade level',
      },
      duration: {
        type: Type.NUMBER,
        description: 'Total available time in minutes',
      },
      activityTypes: {
        type: Type.ARRAY,
        items: { 
          type: Type.STRING,
          enum: ['introduction', 'instruction', 'activity', 'assessment', 'wrap-up']
        },
        description: 'Preferred types of activities to include',
      },
    },
    required: ['objectives', 'gradeLevel', 'duration'],
  },
};

/**
 * Function declaration for canvas drawing assistance
 */
export const canvasDrawingAssistanceDeclaration = {
  name: 'canvas_drawing_assistance',
  description: 'Provides suggestions for drawing, diagramming, or visual content creation on the teaching canvas.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: {
        type: Type.STRING,
        description: 'The topic or concept to visualize',
      },
      visualType: {
        type: Type.STRING,
        enum: ['diagram', 'flowchart', 'mind-map', 'timeline', 'graph', 'illustration'],
        description: 'Type of visual representation needed',
      },
      complexity: {
        type: Type.STRING,
        enum: ['simple', 'moderate', 'complex'],
        description: 'Desired complexity level',
      },
    },
    required: ['topic', 'visualType'],
  },
};

/**
 * Function declaration for educational content analysis
 */
export const analyzeEducationalContentDeclaration = {
  name: 'analyze_educational_content',
  description: 'Analyzes educational content (videos, texts, etc.) and provides insights, key points, or suggestions for teaching.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      contentType: {
        type: Type.STRING,
        enum: ['video', 'text', 'image', 'document'],
        description: 'Type of content being analyzed',
      },
      content: {
        type: Type.STRING,
        description: 'The content to analyze (transcript, text, description, etc.)',
      },
      analysisType: {
        type: Type.STRING,
        enum: ['key-points', 'teaching-suggestions', 'questions', 'activities', 'assessment'],
        description: 'Type of analysis requested',
      },
      gradeLevel: {
        type: Type.STRING,
        description: 'Target grade level for the analysis',
      },
    },
    required: ['contentType', 'content', 'analysisType'],
  },
};

/**
 * All YouTube control function declarations
 */
export const youTubeControlDeclarations = [
  playYouTubeVideoDeclaration,
  pauseYouTubeVideoDeclaration,
  getYouTubeVideoStatusDeclaration,
  jumpToTimeDeclaration,
]; 

/**
 * All teaching/lesson planning function declarations
 */
export const teachingToolDeclarations = [
  generateLessonPlanDeclaration,
  refineLearningObjectiveDeclaration,
  generateLessonActivitiesDeclaration,
  canvasDrawingAssistanceDeclaration,
  analyzeEducationalContentDeclaration,
];

/**
 * Get function declarations based on context
 */
export const getFunctionDeclarationsByContext = (context: string) => {
  switch (context) {
    case 'youtube':
      return youTubeControlDeclarations;
    case 'canvas':
    case 'lesson-planner':
      return [...teachingToolDeclarations, ...youTubeControlDeclarations];
    default:
      return [...youTubeControlDeclarations, ...teachingToolDeclarations];
  }
}; 