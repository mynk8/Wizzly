import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CanvasData } from '../types';
import { validateCanvasData } from '../utils/validators';

interface CanvasStoreState {
  canvases: CanvasData[];
  activeCanvasId: string | null;
  
  createCanvas: (canvas: Omit<CanvasData, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCanvas: (id: string, canvasData: Partial<Omit<CanvasData, 'id'>>) => boolean;
  deleteCanvas: (id: string) => void;
  setActiveCanvas: (id: string | null) => void;
  
  saveCanvasSnapshot: (id: string, preview: string) => boolean;
  getCanvasById: (id: string) => CanvasData | undefined;
}

const useCanvasStore = create<CanvasStoreState>()(
  persist(
    (set, get) => ({
      canvases: [],
      activeCanvasId: null,
      
      createCanvas: (canvasData) => {
        const id = uuidv4();
        const now = new Date();
        
        const newCanvas = {
          ...canvasData,
          id,
          createdAt: now,
          updatedAt: now
        } as unknown as CanvasData;
        
        const result = validateCanvasData(newCanvas);
        if (!result.success) {
          console.error('Canvas validation failed:', result.error);
          return '';
        }
        
        set((state) => ({
          canvases: [...state.canvases, newCanvas],
          activeCanvasId: id
        }));
        
        return id;
      },
      
      updateCanvas: (id, canvasData) => {
        const { canvases } = get();
        const canvasIndex = canvases.findIndex(c => c.id === id);
        
        if (canvasIndex === -1) return false;
        
        const updatedCanvas = {
          ...canvases[canvasIndex],
          ...canvasData,
          updatedAt: new Date()
        };
        
        const result = validateCanvasData(updatedCanvas);
        if (!result.success) {
          console.error('Canvas validation failed:', result.error);
          return false;
        }
        
        const updatedCanvases = [...canvases];
        updatedCanvases[canvasIndex] = updatedCanvas;
        
        set({ canvases: updatedCanvases });
        return true;
      },
      
      deleteCanvas: (id) => {
        set((state) => ({
          canvases: state.canvases.filter(c => c.id !== id),
          activeCanvasId: state.activeCanvasId === id ? null : state.activeCanvasId
        }));
      },
      
      setActiveCanvas: (id) => {
        set({ activeCanvasId: id });
      },
      
      saveCanvasSnapshot: (id, preview) => {
        const { canvases } = get();
        const canvasIndex = canvases.findIndex(c => c.id === id);
        
        if (canvasIndex === -1) return false;
        
        const updatedCanvas = {
          ...canvases[canvasIndex],
          preview,
          updatedAt: new Date()
        };
        
        const updatedCanvases = [...canvases];
        updatedCanvases[canvasIndex] = updatedCanvas;
        
        set({ canvases: updatedCanvases });
        return true;
      },
      
      getCanvasById: (id) => {
        return get().canvases.find(c => c.id === id);
      },
    }),
    {
      name: 'canvas-store',
    }
  )
);

export default useCanvasStore; 