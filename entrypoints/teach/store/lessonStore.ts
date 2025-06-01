import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Lesson, Resource, LessonHistory } from '../types';
import { validateLesson, validateResource, validateLessonHistory } from '../utils/validators';

interface LessonStoreState {
    lessons: Lesson[];
    activeLessonId: string | null;

    resources: Resource[];

    lessonHistory: LessonHistory[];

    createLesson: (lesson: Omit<Lesson, 'id'>) => string;
    updateLesson: (id: string, lessonData: Partial<Omit<Lesson, 'id'>>) => boolean;
    deleteLesson: (id: string) => void;
    setActiveLesson: (id: string | null) => void;

    addResource: (resource: Omit<Resource, 'id'>) => string;
    updateResource: (id: string, resourceData: Partial<Omit<Resource, 'id'>>) => boolean;
    deleteResource: (id: string) => void;

    addLessonHistory: (history: Omit<LessonHistory, 'id'>) => string;
    updateLessonHistory: (id: string, historyData: Partial<Omit<LessonHistory, 'id'>>) => boolean;
    deleteLessonHistory: (id: string) => void;
}

const generateIdAndValidate = <T extends Record<string, any>>(
    data: Omit<T, 'id'>,
    validator: (data: unknown) => any
): [string, T] | null => {
    const id = uuidv4();
    const dataWithId = { ...data, id } as unknown as T;

    const result = validator(dataWithId);
    if (!result.success) {
        console.error('Validation failed:', result.error);
        return null;
    }

    return [id, dataWithId];
};

const useLessonStore = create<LessonStoreState>()(
    persist(
        (set, get) => ({
            lessons: [],
            activeLessonId: null,
            resources: [],
            lessonHistory: [],

            createLesson: (lessonData) => {
                const result = generateIdAndValidate<Lesson>(
                    {
                        ...lessonData,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        status: lessonData.status || 'draft'
                    },
                    validateLesson
                );

                if (!result) return '';

                const [id, lesson] = result;
                set((state) => ({
                    lessons: [...state.lessons, lesson],
                    activeLessonId: id
                }));

                return id;
            },

            updateLesson: (id, lessonData) => {
                const { lessons } = get();
                const lessonIndex = lessons.findIndex(l => l.id === id);

                if (lessonIndex === -1) return false;

                const updatedLesson = {
                    ...lessons[lessonIndex],
                    ...lessonData,
                    updatedAt: new Date()
                };

                const result = validateLesson(updatedLesson);
                if (!result.success) {
                    console.error('Validation failed:', result.error);
                    return false;
                }

                const updatedLessons = [...lessons];
                updatedLessons[lessonIndex] = updatedLesson;

                set({ lessons: updatedLessons });
                return true;
            },

            deleteLesson: (id) => {
                set((state) => ({
                    lessons: state.lessons.filter(l => l.id !== id),
                    activeLessonId: state.activeLessonId === id ? null : state.activeLessonId
                }));
            },

            setActiveLesson: (id) => {
                set({ activeLessonId: id });
            },

            addResource: (resourceData) => {
                const result = generateIdAndValidate<Resource>(
                    {
                        ...resourceData,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    },
                    validateResource
                );

                if (!result) return '';

                const [id, resource] = result;
                set((state) => ({
                    resources: [...state.resources, resource]
                }));

                return id;
            },

            updateResource: (id, resourceData) => {
                const { resources } = get();
                const resourceIndex = resources.findIndex(r => r.id === id);

                if (resourceIndex === -1) return false;

                const updatedResource = {
                    ...resources[resourceIndex],
                    ...resourceData,
                    updatedAt: new Date()
                };

                const result = validateResource(updatedResource);
                if (!result.success) {
                    console.error('Validation failed:', result.error);
                    return false;
                }

                const updatedResources = [...resources];
                updatedResources[resourceIndex] = updatedResource;

                set({ resources: updatedResources });
                return true;
            },

            deleteResource: (id) => {
                set((state) => ({
                    resources: state.resources.filter(r => r.id !== id)
                }));
            },

            addLessonHistory: (historyData) => {
                const result = generateIdAndValidate<LessonHistory>(
                    historyData,
                    validateLessonHistory
                );

                if (!result) return '';

                const [id, history] = result;
                set((state) => ({
                    lessonHistory: [...state.lessonHistory, history]
                }));

                return id;
            },

            updateLessonHistory: (id, historyData) => {
                const { lessonHistory } = get();
                const historyIndex = lessonHistory.findIndex(h => h.id === id);

                if (historyIndex === -1) return false;

                const updatedHistory = {
                    ...lessonHistory[historyIndex],
                    ...historyData,
                };

                const result = validateLessonHistory(updatedHistory);
                if (!result.success) {
                    console.error('Validation failed:', result.error);
                    return false;
                }

                const updatedHistories = [...lessonHistory];
                updatedHistories[historyIndex] = updatedHistory;

                set({ lessonHistory: updatedHistories });
                return true;
            },

            deleteLessonHistory: (id) => {
                set((state) => ({
                    lessonHistory: state.lessonHistory.filter(h => h.id !== id)
                }));
            },
        }),
        {
            name: 'lesson-store',
        }
    )
);

export default useLessonStore; 