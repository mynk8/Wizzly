import { YouTubeVideo } from '../store/youtubeStore';

export const fetchYouTubeMetadata = async (videoId: string): Promise<Partial<YouTubeVideo> | null> => {
  try {
    const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch YouTube metadata: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      videoId,
      title: data.title,
      thumbnailUrl: data.thumbnail_url,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata:', error);
    return null;
  }
};

export const getYouTubeEmbedUrl = (videoId: string, options: { autoplay?: boolean; start?: number } = {}) => {
  const { autoplay = false, start } = options;
  let url = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
  
  if (autoplay) {
    url += '&autoplay=1';
  }
  
  if (start && start > 0) {
    url += `&start=${start}`;
  }
  
  return url;
};

export const getYouTubeThumbnail = (videoId: string, quality: 'default' | 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault') => {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}; 