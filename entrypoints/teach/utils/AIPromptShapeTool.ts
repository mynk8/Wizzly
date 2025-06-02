import { BaseBoxShapeTool } from '@tldraw/tldraw';

export class AIPromptShapeTool extends BaseBoxShapeTool {
  static override id = 'ai-prompt' as const;
  static override initial = 'idle' as const;
  override shapeType = 'ai-prompt' as const;
} 