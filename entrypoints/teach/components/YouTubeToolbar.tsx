import React, { useState } from 'react';
import { useEditor, createShapeId } from '@tldraw/tldraw';
import { Youtube } from 'lucide-react';
import { extractYouTubeId } from '../utils/YouTubeShapeUtil';
import { YouTubeShape } from '../types';

const YouTubeToolbar: React.FC = () => {
  const editor = useEditor();
  const [url, setUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddVideo = () => {
    if (!url.trim()) return;

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      alert('Please enter a valid YouTube URL');
      return;
    }

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
  };

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-primary btn-sm gap-2 shadow-lg"
          title="Add YouTube Video"
        >
          <Youtube className="w-4 h-4" />
          Add Video
        </button>
      ) : (
        <div className="card bg-base-100 shadow-xl p-4 w-80">
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
                disabled={!url.trim()}
              >
                Add Video
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
        </div>
      )}
    </div>
  );
};

export default YouTubeToolbar; 