import React, { useState, useCallback } from 'react';
import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  useEditor,
  TLResizeInfo,
  resizeBox,
  createShapeId,
  TLBaseShape,
  T,
  RecordProps
} from '@tldraw/tldraw';
import { 
  Play,
  Loader2,
} from 'lucide-react';
import { AIPromptShape } from '../types';
import { aiPromptShapeProps } from './ai-prompt-shape-props';
import { aiPromptShapeMigrations } from './ai-prompt-shape-migrations';
import { useAIService } from '@/entrypoints/hooks/use-ai-service';
import useStore from '@/entrypoints/store/store';

// AI Response Shape Type
type AIResponseShape = TLBaseShape<
  'ai-response',
  {
    w: number
    h: number
    text: string
  }
>

// AI Response Shape Util
export class AIResponseShapeUtil extends ShapeUtil<AIResponseShape> {
  static override type = 'ai-response' as const
  static override props: RecordProps<AIResponseShape> = {
    w: T.number,
    h: T.number,
    text: T.string,
  }

  getDefaultProps(): AIResponseShape['props'] {
    return {
      w: 300,
      h: 150,
      text: "AI Response",
    }
  }

  override canEdit() {
    return false
  }
  override canResize() {
    return true
  }
  override isAspectRatioLocked() {
    return false
  }

  getGeometry(shape: AIResponseShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    })
  }

  override onResize(shape: any, info: TLResizeInfo<any>) {
    return resizeBox(shape, info)
  }

  component(shape: AIResponseShape) {
    return (
      <HTMLContainer 
        style={{ 
          backgroundColor: '#f0f9ff', 
          border: '1px solid #0ea5e9',
          borderRadius: '6px',
          padding: '12px',
          fontSize: '14px',
          lineHeight: '1.5',
          color: '#1e40af',
          overflow: 'auto',
          whiteSpace: 'pre-wrap'
        }}
      >
        {shape.props.text}
      </HTMLContainer>
    )
  }

  indicator(shape: AIResponseShape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}

const AIPromptShapeComponent: React.FC<{ shape: AIPromptShape }> = ({ shape }) => {
  const editor = useEditor();
  const { geminiApiKey, appContext } = useStore();
  const aiService = useAIService({ 
    apiKey: geminiApiKey || '', 
    context: appContext 
  });
  
  const [localPrompt, setLocalPrompt] = useState(shape.props.promptText);
  const [isLoading, setIsLoading] = useState(false);

  const updateShapeProps = useCallback((updates: Partial<AIPromptShape['props']>) => {
    editor.updateShape<AIPromptShape>({
      id: shape.id,
      type: 'ai-prompt',
      props: { ...shape.props, ...updates }
    });
  }, [editor, shape.id, shape.props]);

  const spawnResponseShape = useCallback((responseText: string) => {
    // Get the current shape's position and size
    const currentShape = editor.getShape(shape.id);
    if (!currentShape) return;

    // Create a new AI response shape below the prompt shape
    const responseShapeId = createShapeId();
    const yOffset = currentShape.y + shape.props.h + 20; // 20px gap below

    // Create an AI response shape with the response text
    editor.createShape({
      id: responseShapeId,
      type: 'ai-response',
      x: currentShape.x,
      y: yOffset,
      props: {
        text: responseText,
        w: Math.max(300, shape.props.w), // Match or exceed prompt width
        h: 150 // Default height, user can resize
      }
    });

    // Select the new response shape
    editor.setSelectedShapes([responseShapeId]);
    
    // Also log to console for debugging
    console.log('AI Response Shape Created:', responseText);
  }, [editor, shape.id, shape.props.h, shape.props.w]);

  const handleSubmitPrompt = useCallback(async () => {
    if (!localPrompt.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    setIsLoading(true);
    updateShapeProps({ 
      promptText: localPrompt,
      isLoading: true,
      error: null
    });

    try {
      let responseText = '';

      if (!geminiApiKey) {
        // Mock response for testing
        responseText = `Here's a story for you:\n\nOnce upon a time, in a digital classroom, a teacher discovered an amazing AI assistant that could help create educational content instantly. The tool was so intuitive that students loved learning with it.\n\nPrompt: "${localPrompt}"`;
      } else {
        const result = await aiService.generateResponse(localPrompt);
        
        if (result.error) {
          responseText = `Error: ${result.error}`;
        } else {
          responseText = result.text || 'No response received';
        }
      }

      // Spawn the response as a separate text shape on the canvas
      spawnResponseShape(responseText);

      updateShapeProps({ 
        isLoading: false,
        error: null
      });

    } catch (error) {
      console.error('Error calling AI service:', error);
      const errorText = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
      spawnResponseShape(errorText);
      
      updateShapeProps({ 
        isLoading: false,
        error: errorText
      });
    } finally {
      setIsLoading(false);
    }
  }, [localPrompt, geminiApiKey, aiService, updateShapeProps, spawnResponseShape]);

  // Critical: Stop pointer events from reaching tldraw
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    handleSubmitPrompt();
  }, [handleSubmitPrompt]);

  const { w, h, isLoading: shapeIsLoading } = shape.props;
  const loading = isLoading || shapeIsLoading;

  return (
    <HTMLContainer
      id={shape.id}
      style={{
        width: w,
        height: h,
        pointerEvents: 'all',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header with Instruction title and Play button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fafafa'
      }}>
        <span style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          userSelect: 'none'
        }}>
          Instruction
        </span>
        
        <button
          onClick={handlePlayClick}
          onPointerDown={handlePointerDown}
          disabled={loading || !localPrompt.trim()}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: loading || !localPrompt.trim() ? '#d1d5db' : '#3b82f6',
            color: 'white',
            cursor: loading || !localPrompt.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title="Generate AI Response"
        >
          {loading ? (
            <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Play size={12} style={{ marginLeft: '1px' }} />
          )}
        </button>
      </div>

      {/* Prompt text area */}
      <div style={{
        flex: 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <textarea
          value={localPrompt}
          onChange={(e) => setLocalPrompt(e.target.value)}
          onPointerDown={handlePointerDown}
          placeholder="write me a story"
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontFamily: 'inherit',
            fontSize: '14px',
            color: '#374151',
            backgroundColor: 'transparent',
            lineHeight: '1.5',
            padding: 0
          }}
          disabled={loading}
        />
        
        {/* Status info */}
        {!geminiApiKey && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Using mock responses - set API key for real AI
          </div>
        )}
        
        {loading && (
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Loader2 size={10} style={{ animation: 'spin 1s linear infinite' }} />
            Generating response...
          </div>
        )}
      </div>
    </HTMLContainer>
  );
};

export class AIPromptShapeUtil extends ShapeUtil<AIPromptShape> {
  static override type = 'ai-prompt' as const;
  static override props = aiPromptShapeProps;
  static override migrations = aiPromptShapeMigrations;

  getDefaultProps(): AIPromptShape['props'] {
    return {
      promptText: '',
      error: null,
      isLoading: false,
      w: 280,
      h: 120
    };
  }

  getGeometry(shape: AIPromptShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true
    });
  }

  component(shape: AIPromptShape) {
    return <AIPromptShapeComponent shape={shape} />;
  }

  indicator(shape: AIPromptShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  canResize = () => true;
  canBind = () => false;

  override onResize(shape: AIPromptShape, info: TLResizeInfo<AIPromptShape>) {
    return resizeBox(shape, info);
  }
} 