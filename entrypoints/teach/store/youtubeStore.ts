import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

export const YouTubeVideoSchema = z.object({
  id: z.string(),
  videoId: z.string(),
  url: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  addedAt: z.date().optional(),
});

export type YouTubeVideo = z.infer<typeof YouTubeVideoSchema>;

interface YouTubeStoreState {
  recentVideos: YouTubeVideo[];
  favoriteVideos: YouTubeVideo[];
  addRecentVideo: (video: Omit<YouTubeVideo, 'addedAt'>) => void;
  addFavoriteVideo: (video: YouTubeVideo) => void;
  removeFavoriteVideo: (id: string) => void;
  clearRecentVideos: () => void;
}

const useYouTubeStore = create<YouTubeStoreState>()(
  persist(
    (set) => ({
      recentVideos: [],
      favoriteVideos: [],
      
      addRecentVideo: (video) => set((state) => {
        const newVideo = { ...video, addedAt: new Date() };
        const filteredVideos = state.recentVideos.filter(v => v.videoId !== video.videoId);
        
        return {
          recentVideos: [newVideo, ...filteredVideos].slice(0, 10)
        };
      }),
      
      addFavoriteVideo: (video) => set((state) => {
        if (state.favoriteVideos.some(v => v.videoId === video.videoId)) {
          return state;
        }
        
        return {
          favoriteVideos: [...state.favoriteVideos, video]
        };
      }),
      
      removeFavoriteVideo: (id) => set((state) => ({
        favoriteVideos: state.favoriteVideos.filter(v => v.id !== id)
      })),
      
      clearRecentVideos: () => set({ recentVideos: [] }),
    }),
    {
      name: 'youtube-store',
    }
  )
);

export default useYouTubeStore; 