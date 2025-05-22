import { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, AlertCircle } from 'lucide-react';
import useNotesStore, { captureVideoScreenshot } from '../store/notesStore';
import useStore from '@/entrypoints/store/store';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoteModal = ({ isOpen, onClose }: NoteModalProps) => {
  const { theme } = useStore();
  const { addNote, lastUsedTopic } = useNotesStore();
  const inputRef = useRef<HTMLDivElement>(null);
  
  const [topic, setTopic] = useState(lastUsedTopic || '');
  const [noteText, setNoteText] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !inputRef.current) return;

    const element = inputRef.current;
    const preventPropagation = (e: Event) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    element.addEventListener('keydown', preventPropagation, true);
    element.addEventListener('keyup', preventPropagation, true);
    element.addEventListener('keypress', preventPropagation, true);

    return () => {
      element.removeEventListener('keydown', preventPropagation, true);
      element.removeEventListener('keyup', preventPropagation, true);
      element.removeEventListener('keypress', preventPropagation, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Get current video information
      const video = document.querySelector('video');
      const currentTime = video?.currentTime || 0;
      
      // Format timestamp as HH:MM:SS
      const hours = Math.floor(currentTime / 3600);
      const minutes = Math.floor((currentTime % 3600) / 60);
      const seconds = Math.floor(currentTime % 60);
      const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
      
      // Get video title and URL
      const title = document.title.replace(' - YouTube', '');
      const url = window.location.href;
      
      setTimestamp(formattedTime);
      setVideoTitle(title);
      setVideoUrl(url);
      setTopic(lastUsedTopic || '');
      setNoteText('');
      setScreenshot(null);
      setScreenshotError(null);
      
      // Attempt to capture screenshot
      captureScreenshot();
    }
  }, [isOpen, lastUsedTopic]);

  const captureScreenshot = async () => {
    try {
      setScreenshotLoading(true);
      setScreenshotError(null);
      
      // Check if video element exists and is playing
      const video = document.querySelector('video');
      if (!video) {
        setScreenshotError('No video found on this page.');
        setScreenshotLoading(false);
        return;
      }
      
      if (video.paused) {
        setScreenshotError('Video is paused. Play the video to capture a screenshot.');
        setScreenshotLoading(false);
        return;
      }
      
      // Try to capture screenshot with improved method
      const screenshotData = await captureVideoScreenshot();
      
      if (!screenshotData) {
        setScreenshotError('Failed to capture screenshot. The video might not be ready.');
        setScreenshotLoading(false);
        return;
      }
      
      setScreenshot(screenshotData);
    } catch (error) {
      console.warn('Failed to capture screenshot:', error);
      setScreenshotError('Failed to capture screenshot. Please try again.');
    } finally {
      setScreenshotLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!topic || !noteText) return;
    
    addNote({
      noteText,
      topic,
      timestamp,
      videoTitle,
      videoUrl,
      screenshot: screenshot || undefined
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div ref={inputRef} className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black opacity-50" 
        onClick={onClose}
      />
      <div 
        className={`relative w-full max-w-md p-6 rounded-lg shadow-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-[#101010] text-[#FFFFFF] border border-[#252525]' 
            : 'bg-[#F5F5F5] text-[#000000] border border-[#D0D0D0]'
        }`}
      >
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-1 rounded-full transition-colors duration-300 ${
            theme === 'dark'
              ? 'hover:bg-[#252525]'
              : 'hover:bg-[#E0E0E0]'
          }`}
        >
          <X className={`w-4 h-4 ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`} />
        </button>
        
        <h2 className="text-lg font-medium mb-4">Take Note</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            {screenshot ? (
              <div className="relative rounded overflow-hidden">
                <img 
                  src={screenshot} 
                  alt="Video screenshot" 
                  className="w-full h-auto object-cover" 
                  style={{ maxHeight: '200px' }}
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                  <Check className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={captureScreenshot}
                  className={`absolute bottom-2 right-2 p-2 rounded ${
                    theme === 'dark'
                      ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]'
                      : 'bg-[#E0E0E0] text-[#000000] hover:bg-[#D0D0D0]'
                  }`}
                  title="Recapture screenshot"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            ) : screenshotLoading ? (
              <div className={`p-4 text-center rounded flex flex-col items-center justify-center ${
                theme === 'dark' 
                  ? 'bg-[#1A1A1A]' 
                  : 'bg-[#E0E0E0]'
              }`} style={{ height: '150px' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p>Capturing screenshot...</p>
              </div>
            ) : (
              <div className={`p-4 rounded ${
                theme === 'dark' 
                  ? 'bg-[#1A1A1A]' 
                  : 'bg-[#E0E0E0]'
              }`} style={{ minHeight: '100px' }}>
                {screenshotError ? (
                  <div className="flex flex-col items-center text-center">
                    <AlertCircle className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
                    <p className="mb-2">{screenshotError}</p>
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      className={`px-3 py-1 rounded text-sm ${
                        theme === 'dark'
                          ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]'
                          : 'bg-[#D0D0D0] text-[#000000] hover:bg-[#C0C0C0]'
                      }`}
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Camera className={`w-8 h-8 mb-2 ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`} />
                    <p className="mb-2">No screenshot captured yet.</p>
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      className={`px-3 py-1 rounded text-sm ${
                        theme === 'dark'
                          ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]'
                          : 'bg-[#D0D0D0] text-[#000000] hover:bg-[#C0C0C0]'
                      }`}
                    >
                      Capture Screenshot
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="topic" 
              className={`block mb-1 text-sm font-medium ${
                theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'
              }`}
            >
              Topic
            </label>
            <input
              id="topic"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Calculus"
              className={`w-full p-2 rounded border transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-[#1A1A1A] border-[#252525] text-[#FFFFFF] focus:border-[#3A3A3A]'
                  : 'bg-[#FFFFFF] border-[#D0D0D0] text-[#000000] focus:border-[#A0A0A0]'
              }`}
              required
            />
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="noteText" 
              className={`block mb-1 text-sm font-medium ${
                theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'
              }`}
            >
              Note
            </label>
            <textarea
              id="noteText"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Your note here..."
              rows={4}
              className={`w-full p-2 rounded border transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-[#1A1A1A] border-[#252525] text-[#FFFFFF] focus:border-[#3A3A3A]'
                  : 'bg-[#FFFFFF] border-[#D0D0D0] text-[#000000] focus:border-[#A0A0A0]'
              }`}
              required
            />
          </div>
          
          <div className="mb-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
              <strong>Video:</strong> {videoTitle}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
              <strong>Timestamp:</strong> {timestamp}
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 mr-2 rounded text-sm transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]'
                  : 'bg-[#E0E0E0] text-[#000000] hover:bg-[#D0D0D0]'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-sm font-medium transition-colors duration-300 ${
                theme === 'dark'
                  ? 'bg-[#0070F3] text-white hover:bg-[#0060D9]'
                  : 'bg-[#0070F3] text-white hover:bg-[#0060D9]'
              }`}
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal; 