import React, { useState, useEffect } from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { Youtube, Search, Clock, Star, Heart } from 'lucide-react';
import { extractYouTubeId } from '../utils/YouTubeShapeUtil';
import { fetchYouTubeMetadata } from '../utils/youtube';
import { YouTubeShape } from '../types';
import useYouTubeStore from '../store/youtubeStore';
import { v4 as uuidv4 } from 'uuid';

const YouTubeToolbarEnhanced: React.FC = () => {
  const editor = useEditor();
  const { recentVideos, favoriteVideos, addRecentVideo, addFavoriteVideo, removeFavoriteVideo } = useYouTubeStore();
  
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'add' | 'recent' | 'favorites'>('add');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddVideo = async () => {
    if (!url.trim()) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setIsLoading(true);
    
    try {
      const metadata = await fetchYouTubeMetadata(videoId);
      
      addRecentVideo({
        id: uuidv4(),
        videoId,
        url: url.trim(),
        title: metadata?.title,
        thumbnailUrl: metadata?.thumbnailUrl
      });
      
      const viewportCenter = editor.getViewportScreenCenter();
      const pageCenter = editor.screenToPage(viewportCenter);

      const shapeId = createShapeId();
      editor.createShape<YouTubeShape>({
        id: shapeId,
        type: 'youtube',
        x: pageCenter.x - 280,
        y: pageCenter.y - 157.5,
        props: {
          videoId,
          url: url.trim(),
          w: 560,
          h: 315,
        },
      });

      editor.select(shapeId);
      
      setUrl('');
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding YouTube video:", error);
      alert("Failed to add YouTube video. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVideoFromLibrary = (videoId: string, videoUrl: string) => {
    const viewportCenter = editor.getViewportScreenCenter();
    const pageCenter = editor.screenToPage(viewportCenter);

    const shapeId = createShapeId();
    editor.createShape<YouTubeShape>({
      id: shapeId,
      type: 'youtube',
      x: pageCenter.x - 280,
      y: pageCenter.y - 157.5,
      props: {
        videoId,
        url: videoUrl,
        w: 560,
        h: 315,
      },
    });

    editor.select(shapeId);
    
    setIsOpen(false);
  };

  const handleToggleFavorite = (video: any, isFavorite: boolean) => {
    if (isFavorite) {
      removeFavoriteVideo(video.id);
    } else {
      addFavoriteVideo(video);
    }
  };

  if (!isOpen) {
    return (
      <div className="absolute top-12 left-2 z-10">
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-sm gap-2 shadow-lg"
          title="Add YouTube Video"
        >
          <Youtube className="w-4 h-4" />
          Add Video
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
      <div className="card bg-base-100 shadow-xl p-4 w-80">
        <div className="tabs tabs-boxed mb-3">
          <button 
            className={`tab ${activeTab === 'add' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <Search className="w-4 h-4 mr-1" />
            Add
          </button>
          <button 
            className={`tab ${activeTab === 'recent' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            <Clock className="w-4 h-4 mr-1" />
            Recent
          </button>
          <button 
            className={`tab ${activeTab === 'favorites' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('favorites')}
          >
            <Star className="w-4 h-4 mr-1" />
            Favorites
          </button>
        </div>

        {activeTab === 'add' && (
          <>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              Add YouTube Video
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Paste YouTube URL here..."
                className="input input-bordered w-full input-sm"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddVideo()}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddVideo}
                  className="btn btn-primary btn-sm flex-1"
                  disabled={!url.trim() || isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Add Video'
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setUrl('');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Tip: You can also paste YouTube URLs directly onto the canvas!
            </p>
          </>
        )}

        {activeTab === 'recent' && (
          <>
            <h3 className="font-semibold mb-3">Recent Videos</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {recentVideos.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No recent videos yet. Add some videos first!
                </div>
              ) : (
                recentVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-2 p-2 bg-base-200 rounded-lg hover:bg-base-300">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title || 'YouTube video'} 
                        className="w-16 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title || 'Untitled Video'}</p>
                      <p className="text-xs text-gray-500 truncate">{video.videoId}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleFavorite(video, favoriteVideos.some(f => f.videoId === video.videoId))}
                        className="btn btn-xs btn-circle btn-ghost"
                      >
                        <Heart className={`w-3 h-3 ${favoriteVideos.some(f => f.videoId === video.videoId) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                      </button>
                      <button
                        onClick={() => handleAddVideoFromLibrary(video.videoId, video.url)}
                        className="btn btn-xs btn-circle btn-primary"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'favorites' && (
          <>
            <h3 className="font-semibold mb-3">Favorite Videos</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {favoriteVideos.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4">
                  No favorite videos yet. Add some to your favorites!
                </div>
              ) : (
                favoriteVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-2 p-2 bg-base-200 rounded-lg hover:bg-base-300">
                    {video.thumbnailUrl ? (
                      <img 
                        src={video.thumbnailUrl} 
                        alt={video.title || 'YouTube video'} 
                        className="w-16 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Youtube className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.title || 'Untitled Video'}</p>
                      <p className="text-xs text-gray-500 truncate">{video.videoId}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleToggleFavorite(video, true)}
                        className="btn btn-xs btn-circle btn-ghost"
                      >
                        <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      </button>
                      <button
                        onClick={() => handleAddVideoFromLibrary(video.videoId, video.url)}
                        className="btn btn-xs btn-circle btn-primary"
                      >
                        <span className="text-xs">+</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="btn btn-sm btn-ghost"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default YouTubeToolbarEnhanced;