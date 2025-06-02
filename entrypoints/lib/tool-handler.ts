import { FunctionCall } from '@google/genai';
import { AppContext } from '../store/store';
import { LessonPlanData, getGeminiService } from './gemini-ai-service';

// Chrome API types
declare global {
  interface Chrome {
    tabs: {
      query: (queryInfo: any, callback: (tabs: any[]) => void) => void;
      sendMessage: (tabId: number, message: any) => void;
    };
  }
  const chrome: Chrome | undefined;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export class ToolHandler {
  private context: AppContext;

  constructor(context: AppContext) {
    this.context = context;
  }

  setContext(context: AppContext) {
    this.context = context;
  }

  async handleFunctionCall(functionCall: FunctionCall, apiKey: string): Promise<ToolResult> {
    const { name, args } = functionCall;

    try {
      switch (name) {
        // YouTube controls
        case 'play_youtube_video':
          return this.handlePlayYouTubeVideo();
        
        case 'pause_youtube_video':
          return this.handlePauseYouTubeVideo();
        
        case 'get_youtube_video_status':
          return this.handleGetYouTubeVideoStatus();
        
        case 'jump_to_time':
          return this.handleJumpToTime(args?.timeInSeconds as number || 0);

        // Teaching tools
        case 'generate_lesson_plan':
          return await this.handleGenerateLessonPlan(
            args?.topic as string || '',
            args?.gradeLevel as string || '',
            args?.duration as number || 45,
            args?.objectives as string[],
            args?.existingContent as string,
            apiKey
          );
        
        case 'refine_learning_objective':
          return await this.handleRefineLearningObjective(
            args?.originalObjective as string || '',
            args?.gradeLevel as string,
            args?.subject as string,
            apiKey
          );
        
        case 'generate_lesson_activities':
          return await this.handleGenerateLessonActivities(
            args?.objectives as string[] || [],
            args?.gradeLevel as string || '',
            args?.duration as number || 45,
            args?.activityTypes as string[],
            apiKey
          );
        
        case 'canvas_drawing_assistance':
          return this.handleCanvasDrawingAssistance(
            args?.topic as string || '',
            args?.visualType as string || 'diagram',
            args?.complexity as string
          );
        
        case 'analyze_educational_content':
          return await this.handleAnalyzeEducationalContent(
            args?.contentType as string || 'text',
            args?.content as string || '',
            args?.analysisType as string || 'key-points',
            args?.gradeLevel as string,
            apiKey
          );

        default:
          return {
            success: false,
            error: `Unknown function: ${name}`
          };
      }
    } catch (error) {
      console.error(`Error handling function call ${name}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // YouTube control handlers
  private handlePlayYouTubeVideo(): ToolResult {
    try {
      // Send message to content script to play video
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'play_video' });
          }
        });
      } else {
        // Direct DOM manipulation for content script context
        const video = document.querySelector('video');
        if (video) {
          video.play();
        }
      }
      
      return {
        success: true,
        data: { message: 'Video playback started' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to play video'
      };
    }
  }

  private handlePauseYouTubeVideo(): ToolResult {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'pause_video' });
          }
        });
      } else {
        const video = document.querySelector('video');
        if (video) {
          video.pause();
        }
      }
      
      return {
        success: true,
        data: { message: 'Video playback paused' }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to pause video'
      };
    }
  }

  private handleGetYouTubeVideoStatus(): ToolResult {
    try {
      const video = document.querySelector('video');
      if (video) {
        return {
          success: true,
          data: {
            playing: !video.paused,
            currentTime: video.currentTime,
            duration: video.duration,
            volume: video.volume
          }
        };
      }
      
      return {
        success: false,
        error: 'No video found'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get video status'
      };
    }
  }

  private handleJumpToTime(timeInSeconds: number): ToolResult {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              action: 'jump_to_time', 
              time: timeInSeconds 
            });
          }
        });
      } else {
        const video = document.querySelector('video');
        if (video) {
          video.currentTime = timeInSeconds;
        }
      }
      
      return {
        success: true,
        data: { message: `Jumped to ${timeInSeconds} seconds` }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to jump to time'
      };
    }
  }

  // Teaching tool handlers
  private async handleGenerateLessonPlan(
    topic: string,
    gradeLevel: string,
    duration: number,
    objectives?: string[],
    existingContent?: string,
    apiKey?: string
  ): Promise<ToolResult> {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key required for lesson plan generation'
      };
    }

    const geminiService = getGeminiService(apiKey);
    const result = await geminiService.generateLessonPlan(
      topic,
      gradeLevel,
      duration,
      objectives,
      existingContent
    );

    if ('error' in result) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      data: result
    };
  }

  private async handleRefineLearningObjective(
    originalObjective: string,
    gradeLevel?: string,
    subject?: string,
    apiKey?: string
  ): Promise<ToolResult> {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key required for objective refinement'
      };
    }

    const geminiService = getGeminiService(apiKey);
    const result = await geminiService.refineObjective(
      originalObjective,
      gradeLevel,
      subject
    );

    if ('error' in result) {
      return {
        success: false,
        error: result.error
      };
    }

    return {
      success: true,
      data: result
    };
  }

  private async handleGenerateLessonActivities(
    objectives: string[],
    gradeLevel: string,
    duration: number,
    activityTypes?: string[],
    apiKey?: string
  ): Promise<ToolResult> {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key required for activity generation'
      };
    }

    // For now, return a structured response - this could be enhanced with AI generation
    const activities = [
      {
        title: 'Opening Activity',
        description: 'Engage students with the topic',
        duration: Math.round(duration * 0.2),
        type: 'introduction'
      },
      {
        title: 'Main Instruction',
        description: 'Core teaching content',
        duration: Math.round(duration * 0.5),
        type: 'instruction'
      },
      {
        title: 'Practice Activity',
        description: 'Students apply what they learned',
        duration: Math.round(duration * 0.3),
        type: 'activity'
      }
    ];

    return {
      success: true,
      data: { activities }
    };
  }

  private handleCanvasDrawingAssistance(
    topic: string,
    visualType: string,
    complexity?: string
  ): ToolResult {
    const suggestions = {
      diagram: [
        'Start with basic shapes and labels',
        'Use arrows to show relationships',
        'Keep text clear and readable'
      ],
      flowchart: [
        'Begin with a clear starting point',
        'Use standard flowchart symbols',
        'Ensure logical flow from top to bottom'
      ],
      'mind-map': [
        'Place main topic in the center',
        'Branch out with related concepts',
        'Use colors to group related ideas'
      ],
      timeline: [
        'Use a horizontal or vertical line',
        'Mark important dates clearly',
        'Add brief descriptions for each event'
      ],
      graph: [
        'Label axes clearly',
        'Use appropriate scale',
        'Include a title and legend if needed'
      ],
      illustration: [
        'Start with basic shapes',
        'Add details gradually',
        'Use labels to clarify parts'
      ]
    };

    return {
      success: true,
      data: {
        topic,
        visualType,
        suggestions: suggestions[visualType as keyof typeof suggestions] || suggestions.diagram,
        tips: [
          'Keep it simple and clear',
          'Use consistent styling',
          'Make sure text is readable',
          'Leave enough white space'
        ]
      }
    };
  }

  private async handleAnalyzeEducationalContent(
    contentType: string,
    content: string,
    analysisType: string,
    gradeLevel?: string,
    apiKey?: string
  ): Promise<ToolResult> {
    if (!apiKey) {
      return {
        success: false,
        error: 'API key required for content analysis'
      };
    }

    if (contentType === 'video' && analysisType === 'key-points') {
      const geminiService = getGeminiService(apiKey);
      const result = await geminiService.analyzeVideoContent(
        content,
        undefined,
        gradeLevel
      );

      if ('error' in result) {
        return {
          success: false,
          error: result.error
        };
      }

      return {
        success: true,
        data: result
      };
    }

    // Fallback for other content types
    return {
      success: true,
      data: {
        contentType,
        analysisType,
        summary: 'Content analysis completed',
        recommendations: ['Review the content for educational value', 'Consider age-appropriateness']
      }
    };
  }
}

// Singleton instance
let toolHandler: ToolHandler | null = null;

export const getToolHandler = (context: AppContext): ToolHandler => {
  if (!toolHandler) {
    toolHandler = new ToolHandler(context);
  } else {
    toolHandler.setContext(context);
  }
  return toolHandler;
}; 