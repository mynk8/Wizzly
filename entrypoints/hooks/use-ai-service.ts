import { useState, useCallback, useEffect } from 'react';
import { getGeminiService, AIResponse, LessonPlanData, ObjectiveRefinement } from '../lib/gemini-ai-service';
import { getToolHandler, ToolResult } from '../lib/tool-handler';
import useStore, { AppContext, Message } from '../store/store';

export interface UseAIServiceOptions {
  apiKey: string;
  context?: AppContext;
}

export interface UseAIServiceReturn {
  generateResponse: (message: string, additionalContext?: string) => Promise<AIResponse>;
  generateLessonPlan: (topic: string, gradeLevel: string, duration: number, objectives?: string[], existingContent?: string) => Promise<LessonPlanData | { error: string }>;
  refineObjective: (originalObjective: string, gradeLevel?: string, subject?: string) => Promise<ObjectiveRefinement | { error: string }>;
  analyzeVideoContent: (transcript: string, videoTitle?: string, gradeLevel?: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

export const useAIService = ({ apiKey, context = 'general' }: UseAIServiceOptions): UseAIServiceReturn => {
  const { 
    messages, 
    addMessage, 
    updateLastMessage, 
    setIsAiLoading, 
    setAiError, 
    isAiLoading, 
    aiError,
    setAppContext,
    appContext
  } = useStore();

  const [localError, setLocalError] = useState<string | null>(null);

  // Update context when it changes
  useEffect(() => {
    if (context !== appContext) {
      setAppContext(context);
    }
  }, [context, appContext, setAppContext]);

  const clearError = useCallback(() => {
    setLocalError(null);
    setAiError(null);
  }, [setAiError]);

  const handleError = useCallback((error: string) => {
    setLocalError(error);
    setAiError(error);
    setIsAiLoading(false);
  }, [setAiError, setIsAiLoading]);

  const generateResponse = useCallback(async (
    message: string, 
    additionalContext?: string
  ): Promise<AIResponse> => {
    if (!apiKey) {
      const error = 'API key is required';
      handleError(error);
      return { error };
    }

    try {
      setIsAiLoading(true);
      clearError();

      const geminiService = getGeminiService(apiKey);
      geminiService.setContext(context);

      // Add user message to store
      addMessage({ role: 'user', text: message });

      // Get conversation history (last 10 messages for context)
      const conversationHistory = messages.slice(-10);

      const response = await geminiService.generateResponse(
        message,
        conversationHistory,
        additionalContext
      );

      if (response.error) {
        handleError(response.error);
        return response;
      }

      // Handle function calls if present
      if (response.functionCalls && response.functionCalls.length > 0) {
        const toolHandler = getToolHandler(context);
        const toolResults: ToolResult[] = [];

        for (const functionCall of response.functionCalls) {
          const result = await toolHandler.handleFunctionCall(functionCall, apiKey);
          toolResults.push(result);
        }

        // Add tool results to the response
        const toolResultsText = toolResults
          .map(result => result.success ? 
            `✅ ${JSON.stringify(result.data)}` : 
            `❌ Error: ${result.error}`
          )
          .join('\n');

        const finalText = response.text ? 
          `${response.text}\n\n**Tool Results:**\n${toolResultsText}` : 
          `**Tool Results:**\n${toolResultsText}`;

        addMessage({ role: 'assistant', text: finalText });
        setIsAiLoading(false);

        return { ...response, text: finalText };
      }

      // Add assistant response to store
      if (response.text) {
        addMessage({ role: 'assistant', text: response.text });
      }

      setIsAiLoading(false);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      handleError(errorMessage);
      return { error: errorMessage };
    }
  }, [apiKey, context, messages, addMessage, setIsAiLoading, clearError, handleError]);

  const generateLessonPlan = useCallback(async (
    topic: string,
    gradeLevel: string,
    duration: number,
    objectives?: string[],
    existingContent?: string
  ): Promise<LessonPlanData | { error: string }> => {
    if (!apiKey) {
      return { error: 'API key is required' };
    }

    try {
      setIsAiLoading(true);
      clearError();

      const geminiService = getGeminiService(apiKey);
      const result = await geminiService.generateLessonPlan(
        topic,
        gradeLevel,
        duration,
        objectives,
        existingContent
      );

      setIsAiLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate lesson plan';
      handleError(errorMessage);
      return { error: errorMessage };
    }
  }, [apiKey, setIsAiLoading, clearError, handleError]);

  const refineObjective = useCallback(async (
    originalObjective: string,
    gradeLevel?: string,
    subject?: string
  ): Promise<ObjectiveRefinement | { error: string }> => {
    if (!apiKey) {
      return { error: 'API key is required' };
    }

    try {
      setIsAiLoading(true);
      clearError();

      const geminiService = getGeminiService(apiKey);
      const result = await geminiService.refineObjective(
        originalObjective,
        gradeLevel,
        subject
      );

      setIsAiLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refine objective';
      handleError(errorMessage);
      return { error: errorMessage };
    }
  }, [apiKey, setIsAiLoading, clearError, handleError]);

  const analyzeVideoContent = useCallback(async (
    transcript: string,
    videoTitle?: string,
    gradeLevel?: string
  ) => {
    if (!apiKey) {
      return { error: 'API key is required' };
    }

    try {
      setIsAiLoading(true);
      clearError();

      const geminiService = getGeminiService(apiKey);
      const result = await geminiService.analyzeVideoContent(
        transcript,
        videoTitle,
        gradeLevel
      );

      setIsAiLoading(false);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze video content';
      handleError(errorMessage);
      return { error: errorMessage };
    }
  }, [apiKey, setIsAiLoading, clearError, handleError]);

  return {
    generateResponse,
    generateLessonPlan,
    refineObjective,
    analyzeVideoContent,
    isLoading: isAiLoading,
    error: localError || aiError,
    clearError
  };
}; 