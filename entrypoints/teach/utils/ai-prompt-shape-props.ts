import { RecordProps, T } from '@tldraw/tldraw';
import { AIPromptShape } from '../types';

// Validation for our custom AI prompt shape's props
export const aiPromptShapeProps: RecordProps<AIPromptShape> = {
  promptText: T.string,
  error: T.string.nullable(),
  isLoading: T.boolean,
  w: T.number,
  h: T.number,
}; 