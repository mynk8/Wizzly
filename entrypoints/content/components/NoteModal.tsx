import { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, AlertCircle } from 'lucide-react';
import useNotesStore, { captureVideoScreenshot } from '../store/notesStore';
import useStore from '@/entrypoints/store/store';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NoteModal = ({ isOpen, onClose }: NoteModalProps) => {
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
      const video = document.querySelector('video');
      const currentTime = video?.currentTime || 0;

      const hours = Math.floor(currentTime / 3600);
      const minutes = Math.floor((currentTime % 3600) / 60);
      const seconds = Math.floor(currentTime % 60);
      const formattedTime = [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
      ].join(':');
      
      const title = document.title.replace(' - YouTube', '');
      const url = window.location.href;
      
      setTimestamp(formattedTime);
      setVideoTitle(title);
      setVideoUrl(url);
      setTopic(lastUsedTopic || '');
      setNoteText('');
      setScreenshot(null);
      setScreenshotError(null);
      
      captureScreenshot();
    }
  }, [isOpen, lastUsedTopic]);

  const captureScreenshot = async () => {
    try {
      setScreenshotLoading(true);
      setScreenshotError(null);
      
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
    <dialog open className="modal modal-open">
      <div className="modal-backdrop" onClick={onClose} />
      <div ref={inputRef} className="modal-box relative w-full max-w-md">
        <button 
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-lg font-medium mb-4">Take Note</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            {screenshot ? (
              <div className="relative rounded-box overflow-hidden">
                <img 
                  src={screenshot} 
                  alt="Video screenshot" 
                  className="w-full h-auto object-cover" 
                  style={{ maxHeight: '200px' }}
                />
                <div className="badge badge-success absolute top-2 right-2">
                  <Check className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={captureScreenshot}
                  className="btn btn-circle btn-sm absolute bottom-2 right-2"
                  title="Recapture screenshot"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            ) : screenshotLoading ? (
              <div className="card bg-base-200 p-4 text-center flex flex-col items-center justify-center min-h-[150px]">
                <span className="loading loading-spinner loading-md"></span>
                <p className="mt-2">Capturing screenshot...</p>
              </div>
            ) : (
              <div className="card bg-base-200 p-4 min-h-[100px]">
                {screenshotError ? (
                  <div className="flex flex-col items-center text-center">
                    <AlertCircle className="w-8 h-8 mb-2 text-error" />
                    <p className="mb-2">{screenshotError}</p>
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      className="btn btn-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <Camera className="w-8 h-8 mb-2 opacity-70" />
                    <p className="mb-2">No screenshot captured yet.</p>
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      className="btn btn-sm"
                    >
                      Capture Screenshot
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Topic</span>
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Calculus"
              className="input input-bordered w-full"
              required
            />
          </div>
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Note</span>
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Your note here..."
              rows={4}
              className="textarea textarea-bordered w-full"
              required
            />
          </div>
          
          <div className="mb-4 space-y-1 opacity-70">
            <p className="text-sm">
              <strong>Video:</strong> {videoTitle}
            </p>
            <p className="text-sm">
              <strong>Timestamp:</strong> {timestamp}
            </p>
          </div>
          
          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default NoteModal; 