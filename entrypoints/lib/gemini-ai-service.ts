import { GoogleGenAI, FunctionCall } from '@google/genai';
import { getFunctionDeclarationsByContext } from './functionDeclarations';
import { AppContext } from '../store/store';

export interface AIResponse {
  text?: string;
  functionCalls?: FunctionCall[];
  error?: string;
}

export interface LessonPlanData {
  title: string;
  objectives: string[];
  activities: Array<{
    title: string;
    description: string;
    duration: number;
    type: 'introduction' | 'instruction' | 'activity' | 'assessment' | 'wrap-up';
  }>;
  materials: string[];
  notes: string;
}

export interface ObjectiveRefinement {
  original: string;
  refined: string;
  explanation: string;
}

export class GeminiAIService {
  private ai: GoogleGenAI;
  private context: AppContext = 'general';

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  setContext(context: AppContext) {
    this.context = context;
  }

  private getSystemPrompt(): string {
    const basePrompt = "You are Wizzly, an intelligent AI teaching assistant designed to help educators create engaging lessons and manage their teaching workflow.";
    
    switch (this.context) {
      case 'youtube':
        return `${basePrompt} You are currently helping with YouTube video analysis and control. You can play, pause, analyze video content, and help create educational materials based on video content. When analyzing videos, focus on educational value, key learning points, and how the content can be used in teaching.`;
      
      case 'canvas':
        return `${basePrompt} You are currently helping with the Wizzly Canvas teaching board. You can assist with visual content creation, diagramming, drawing suggestions, and organizing visual learning materials. Focus on helping create clear, educational visual content that enhances learning.`;
      
      case 'lesson-planner':
        return `${basePrompt} You are currently helping with lesson planning. You can generate comprehensive lesson plans, refine learning objectives, create engaging activities, and suggest educational resources. Focus on creating well-structured, age-appropriate, and engaging educational content that follows best teaching practices.`;
      
      default:
        return `${basePrompt} You can help with various teaching tasks including lesson planning, content analysis, visual creation, and educational guidance. Adapt your responses based on the user's needs and context.`;
    }
  }

  async generateResponse(
    message: string,
    conversationHistory: Array<{ role: string; text: string }> = [],
    additionalContext?: string
  ): Promise<AIResponse> {
    try {
      // Build conversation context
      const contextMessage = additionalContext 
        ? `Context: ${additionalContext}\n\nUser message: ${message}`
        : message;

      // Include conversation history
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }));

      const chat = this.ai.chats.create({
        model: 'gemini-1.5-flash',
        history,
        config: {
          systemInstruction: this.getSystemPrompt(),
          tools: [{
            functionDeclarations: getFunctionDeclarationsByContext(this.context)
          }]
        }
      });

      const result = await chat.sendMessage({
        message: contextMessage
      });

      // Check for function calls
      const functionCalls = result.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        return {
          functionCalls,
          text: result.text
        };
      }

      return {
        text: result.text
      };
    } catch (error) {
      console.error('Gemini AI Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async generateLessonPlan(
    topic: string,
    gradeLevel: string,
    duration: number,
    objectives?: string[],
    existingContent?: string
  ): Promise<LessonPlanData | { error: string }> {
    try {
      const chat = this.ai.chats.create({
        model: 'gemini-1.5-flash',
        config: {
          systemInstruction: `You are an expert lesson planning assistant. Create comprehensive, engaging lesson plans that follow educational best practices. Focus on clear learning objectives, varied activities, and age-appropriate content.`
        }
      });

      const prompt = `Create a detailed lesson plan with the following specifications:
- Topic: ${topic}
- Grade Level: ${gradeLevel}
- Duration: ${duration} minutes
${objectives ? `- Existing Objectives: ${objectives.join(', ')}` : ''}
${existingContent ? `- Existing Content to Build Upon: ${existingContent}` : ''}

Please provide a structured lesson plan in JSON format with the following structure:
{
  "title": "Lesson title",
  "objectives": ["objective 1", "objective 2", ...],
  "activities": [
    {
      "title": "Activity title",
      "description": "Detailed description",
      "duration": number_in_minutes,
      "type": "introduction|instruction|activity|assessment|wrap-up"
    }
  ],
  "materials": ["material 1", "material 2", ...],
  "notes": "Additional teaching notes and tips"
}

Ensure activities add up to approximately ${duration} minutes and are appropriate for ${gradeLevel} students.`;

      const result = await chat.sendMessage({ message: prompt });
      const responseText = result.text || '';
      
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const lessonPlan = JSON.parse(jsonMatch[0]);
          return lessonPlan as LessonPlanData;
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
        }
      }

      // Fallback: parse the response manually
      return this.parseLessonPlanFromText(responseText, topic, gradeLevel, duration);
    } catch (error) {
      console.error('Lesson plan generation error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to generate lesson plan'
      };
    }
  }

  async refineObjective(
    originalObjective: string,
    gradeLevel?: string,
    subject?: string
  ): Promise<ObjectiveRefinement | { error: string }> {
    try {
      const chat = this.ai.chats.create({
        model: 'gemini-1.5-flash',
        config: {
          systemInstruction: `You are an expert in educational objective writing. Refine learning objectives to be SMART (Specific, Measurable, Achievable, Relevant, Time-bound) and aligned with educational standards.`
        }
      });

      const prompt = `Refine this learning objective to make it more specific, measurable, and educationally sound:

Original Objective: "${originalObjective}"
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}
${subject ? `Subject: ${subject}` : ''}

Please provide:
1. A refined, SMART objective
2. A brief explanation of the improvements made

Format your response as JSON:
{
  "refined": "The improved objective",
  "explanation": "Explanation of improvements"
}`;

      const result = await chat.sendMessage({ message: prompt });
      const responseText = result.text || '';
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            original: originalObjective,
            refined: parsed.refined,
            explanation: parsed.explanation
          };
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
        }
      }

      // Fallback parsing
      return {
        original: originalObjective,
        refined: `Students will be able to demonstrate understanding of ${originalObjective.toLowerCase()} through specific, measurable activities by the end of the lesson.`,
        explanation: 'Refined to be more specific and measurable.'
      };
    } catch (error) {
      console.error('Objective refinement error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to refine objective'
      };
    }
  }

  async analyzeVideoContent(
    transcript: string,
    videoTitle?: string,
    gradeLevel?: string
  ): Promise<{
    keyPoints: string[];
    teachingSuggestions: string[];
    discussionQuestions: string[];
    activities: string[];
  } | { error: string }> {
    try {
      const chat = this.ai.chats.create({
        model: 'gemini-1.5-flash',
        config: {
          systemInstruction: `You are an educational content analyst. Analyze video content and provide teaching insights, key points, and educational activities.`
        }
      });

      const prompt = `Analyze this video content for educational purposes:

${videoTitle ? `Video Title: ${videoTitle}` : ''}
${gradeLevel ? `Target Grade Level: ${gradeLevel}` : ''}

Video Transcript/Content:
${transcript}

Please provide a comprehensive educational analysis in JSON format:
{
  "keyPoints": ["key point 1", "key point 2", ...],
  "teachingSuggestions": ["suggestion 1", "suggestion 2", ...],
  "discussionQuestions": ["question 1", "question 2", ...],
  "activities": ["activity 1", "activity 2", ...]
}

Focus on educational value, learning opportunities, and practical teaching applications.`;

      const result = await chat.sendMessage({ message: prompt });
      const responseText = result.text || '';
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('JSON parsing error:', parseError);
        }
      }

      // Fallback
      return {
        keyPoints: ['Content analysis available'],
        teachingSuggestions: ['Use this content to supplement your lesson'],
        discussionQuestions: ['What did you learn from this content?'],
        activities: ['Create a summary of the main points']
      };
    } catch (error) {
      console.error('Video analysis error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to analyze video content'
      };
    }
  }

  private parseLessonPlanFromText(text: string, topic: string, gradeLevel: string, duration: number): LessonPlanData {
    // Fallback lesson plan structure
    return {
      title: `${topic} - ${gradeLevel} Lesson`,
      objectives: [
        `Students will understand the key concepts of ${topic}`,
        `Students will be able to apply knowledge of ${topic} in practical situations`
      ],
      activities: [
        {
          title: `Introduction to ${topic}`,
          description: 'Engage students with an opening activity and overview',
          duration: Math.round(duration * 0.2),
          type: 'introduction'
        },
        {
          title: `Core Instruction: ${topic}`,
          description: 'Main teaching content and explanation',
          duration: Math.round(duration * 0.4),
          type: 'instruction'
        },
        {
          title: `Hands-on Activity`,
          description: 'Interactive activity to reinforce learning',
          duration: Math.round(duration * 0.3),
          type: 'activity'
        },
        {
          title: 'Wrap-up and Assessment',
          description: 'Review key points and assess understanding',
          duration: Math.round(duration * 0.1),
          type: 'wrap-up'
        }
      ],
      materials: ['Whiteboard', 'Handouts', 'Digital presentation'],
      notes: `AI-generated lesson plan for ${topic}. Please review and customize as needed.`
    };
  }
}

// Singleton instance
let geminiService: GeminiAIService | null = null;

export const getGeminiService = (apiKey: string): GeminiAIService => {
  if (!geminiService || !apiKey) {
    geminiService = new GeminiAIService(apiKey);
  }
  return geminiService;
};

export const resetGeminiService = () => {
  geminiService = null;
}; 