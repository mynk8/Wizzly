import { 
  NoteSchema, 
  CanvasDataSchema, 
  ResourceSchema, 
  LessonSchema, 
  LessonHistorySchema,
  YouTubeShapeProps
} from '../types';

export const validateNote = (data: unknown) => {
  return NoteSchema.safeParse(data);
};

export const validateCanvasData = (data: unknown) => {
  return CanvasDataSchema.safeParse(data);
};

export const validateResource = (data: unknown) => {
  return ResourceSchema.safeParse(data);
};

export const validateLesson = (data: unknown) => {
  return LessonSchema.safeParse(data);
};

export const validateLessonHistory = (data: unknown) => {
  return LessonHistorySchema.safeParse(data);
};

export const validateYouTubeShapeProps = (data: unknown) => {
  return YouTubeShapeProps.safeParse(data);
};