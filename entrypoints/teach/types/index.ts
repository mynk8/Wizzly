import { z } from 'zod';
import { TLBaseShape } from '@tldraw/tldraw';

export const YouTubeShapeProps = z.object({
  videoId: z.string(),
  url: z.string(),
  w: z.number().default(560),
  h: z.number().default(315),
});

export type YouTubeShape = TLBaseShape<
  'youtube',
  z.infer<typeof YouTubeShapeProps>
>;

export const PromptWidgetShapeProps = z.object({
  promptText: z.string().default(''),
  imageData: z.string().optional(), // base64 encoded image
  imageUrl: z.string().optional(), // URL to image
  w: z.number().default(300),
  h: z.number().default(200),
  isLoading: z.boolean().default(false),
  lastResponse: z.string().optional(),
  contextData: z.record(z.any()).optional(), // For sharing data between widgets
  widgetId: z.string().optional(), // Unique identifier for data sharing
});

export type PromptWidgetShape = TLBaseShape<
  'prompt-widget',
  z.infer<typeof PromptWidgetShapeProps>
>;

export const AIPromptShapeProps = z.object({
  promptText: z.string().default(''),
  error: z.string().nullable().default(null),
  isLoading: z.boolean().default(false),
  w: z.number().default(280),
  h: z.number().default(120),
});

export type AIPromptShape = TLBaseShape<
  'ai-prompt',
  z.infer<typeof AIPromptShapeProps>
>;

export const NoteSchema = z.object({
  id: z.string().optional(),
  noteText: z.string(),
  topic: z.string(),
  timestamp: z.string(),
  videoTitle: z.string(),
  videoUrl: z.string(),
  screenshot: z.string().optional(),
});

export type Note = z.infer<typeof NoteSchema>;

export const CanvasDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: z.any(), // tldraw serialized data
  preview: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CanvasData = z.infer<typeof CanvasDataSchema>;

export const ResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['link', 'image', 'document', 'canvas', 'other']),
  url: z.string().optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;

export const LessonSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  objectives: z.array(z.string()).optional(),
  duration: z.number().optional(),
  grade: z.string().optional(),
  subject: z.string().optional(),
  resources: z.array(ResourceSchema).optional(),
  canvasId: z.string().optional(),
  notes: z.array(NoteSchema).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

export type Lesson = z.infer<typeof LessonSchema>;

export const LessonHistorySchema = z.object({
  id: z.string(),
  lessonId: z.string(),
  date: z.date(),
  duration: z.number().optional(),
  studentCount: z.number().optional(),
  notes: z.array(NoteSchema).optional(),
  canvasData: z.any().optional(),
  feedback: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type LessonHistory = z.infer<typeof LessonHistorySchema>; 