import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d
} from '@tldraw/tldraw';
import { Youtube } from 'lucide-react';
import { YouTubeShape } from '../types';

export const extractYouTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const isYouTubeUrl = (text: string): boolean => {
  return /(?:youtube\.com|youtu\.be)/.test(text);
};

export class YouTubeShapeUtil extends ShapeUtil<YouTubeShape> {
  static override type = 'youtube' as const;

  getDefaultProps(): YouTubeShape['props'] {
    return {
      videoId: '',
      url: '',
      w: 560,
      h: 315,
    };
  }

  getGeometry(shape: YouTubeShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: YouTubeShape) {
    const { videoId, w, h } = shape.props;
    
    if (!videoId) {
      return (
        <HTMLContainer className="youtube-shape-container">
          <div 
            className="flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg"
            style={{ width: w, height: h }}
          >
            <div className="text-center p-4">
              <Youtube className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500 text-sm">Invalid YouTube URL</p>
            </div>
          </div>
        </HTMLContainer>
      );
    }

    return (
      <HTMLContainer className="youtube-shape-container">
        <div 
          className="relative rounded-lg shadow-lg overflow-hidden group"
          style={{ width: w, height: h }}
        >
          <iframe
            width={w}
            height={h}
            src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full rounded-lg"
            style={{ 
              pointerEvents: 'none',
              border: 'none'
            }}
          />
          
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.stopPropagation();
                e.preventDefault();
                
                const iframe = e.currentTarget.previousElementSibling as HTMLIFrameElement;
                if (iframe) {
                  iframe.style.pointerEvents = 'auto';
                  
                  const rect = iframe.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  const clickEvent = new MouseEvent('click', {
                    clientX: e.clientX,
                    clientY: e.clientY,
                    bubbles: true,
                    cancelable: true,
                    ctrlKey: e.ctrlKey,
                    metaKey: e.metaKey
                  });
                  
                  iframe.dispatchEvent(clickEvent);
                  
                  setTimeout(() => {
                    iframe.style.pointerEvents = 'none';
                  }, 100);
                }
              }
            }}
            onMouseDown={(e) => {
              if (e.ctrlKey || e.metaKey) {
                e.stopPropagation();
              }
            }}
          >
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Hold Ctrl + Click to interact with video
            </div>
          </div>
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: YouTubeShape) {
    const { w, h } = shape.props;
    return <rect width={w} height={h} className="stroke-blue-500 stroke-2 fill-transparent" />;
  }
} 