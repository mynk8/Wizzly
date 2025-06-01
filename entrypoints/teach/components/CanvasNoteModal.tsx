import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tldraw/tldraw';
import { X, Camera } from 'lucide-react';
import useNotesStore from '../../content/store/notesStore';
import { captureCanvasScreenshot } from '../utils/canvas';

interface CanvasNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editor: Editor | null;
}

const CanvasNoteModal: React.FC<CanvasNoteModalProps> = ({ isOpen, onClose, editor }) => {
  const { addNote, lastUsedTopic } = useNotesStore();
  const inputRef = useRef<HTMLDivElement>(null);
  
  const [topic, setTopic] = useState(lastUsedTopic || '');
  const [noteText, setNoteText] = useState('');
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
      setTopic(lastUsedTopic || '');
      setNoteText('');
      setScreenshot(null);
      setScreenshotError(null);
      
      captureCanvas();
    }
  }, [isOpen, lastUsedTopic]);

  const captureCanvas = async () => {
    if (!editor) return;
    
    try {
      setScreenshotLoading(true);
      setScreenshotError(null);
      
      const screenshotData = await captureCanvasScreenshot(editor);
      
      if (!screenshotData) {
        setScreenshotError('No content on canvas to capture.');
        setScreenshotLoading(false);
        return;
      }
      
      setScreenshot(screenshotData);
    } catch (error) {
      console.warn('Failed to capture canvas screenshot:', error);
      setScreenshotError('Failed to capture canvas screenshot. Please try again.');
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
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      videoTitle: 'Canvas Drawing Session',
      videoUrl: window.location.href,
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
        
        <h2 className="text-lg font-medium mb-4">Take Canvas Note</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            {screenshot ? (
              <div className="relative rounded-box overflow-hidden">
                <img 
                  src={screenshot} 
                  alt="Canvas screenshot" 
                  className="w-full h-auto object-cover rounded-lg"
                  style={{ maxHeight: '200px' }}
                />
                <div className="badge badge-success absolute top-2 right-2">
                  <Camera className="w-4 h-4" />
                </div>
                <button
                  type="button"
                  onClick={captureCanvas}
                  className="btn btn-circle btn-sm absolute bottom-2 right-2"
                  title="Recapture canvas"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            ) : screenshotLoading ? (
              <div className="min-h-[150px] flex flex-col items-center justify-center text-center bg-base-200 rounded-lg p-4">
                <span className="loading loading-spinner loading-md"></span>
                <p className="mt-2">Capturing canvas...</p>
              </div>
            ) : (
              <div className="min-h-[100px] flex flex-col items-center justify-center text-center bg-base-200 rounded-lg p-4">
                {screenshotError ? (
                  <>
                    <Camera className="w-8 h-8 mb-2 text-error" />
                    <p className="mb-2">{screenshotError}</p>
                    <button
                      type="button"
                      onClick={captureCanvas}
                      className="btn btn-sm"
                    >
                      Try Again
                    </button>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 mb-2 opacity-70" />
                    <p className="mb-2">No canvas screenshot captured yet.</p>
                    <button
                      type="button"
                      onClick={captureCanvas}
                      className="btn btn-sm"
                    >
                      Capture Canvas
                    </button>
                  </>
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
              placeholder="e.g. Math Concepts"
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
              placeholder="Describe your drawing or key insights..."
              rows={4}
              className="textarea textarea-bordered w-full"
              required
            />
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

export default CanvasNoteModal; 