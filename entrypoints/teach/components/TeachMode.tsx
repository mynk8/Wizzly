import React, { useState, useCallback, useEffect } from 'react';
import { 
  Tldraw, 
  Editor,
  TLComponents,
  TLOnMountHandler,
  createShapeId
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

import SidePanel from './SidePanel';
import YouTubeToolbarEnhanced from './YouTubeToolbarEnhanced';

import { handleYouTubePaste } from '../utils/canvas';
import { YouTubeShapeUtil, isYouTubeUrl, extractYouTubeId } from '../utils/YouTubeShapeUtil';

const customComponents: TLComponents = {
  InFrontOfTheCanvas: YouTubeToolbarEnhanced,
};

const TeachMode: React.FC = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEditorMount: TLOnMountHandler = useCallback((editor: Editor) => {
    setEditor(editor);

    const handlePasteEvent = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain');
      if (text && isYouTubeUrl(text)) {
        handleYouTubePaste(editor, e, isYouTubeUrl, extractYouTubeId, createShapeId);
        return;
      }
    };

    const container = editor.getContainer();
    container.addEventListener('paste', handlePasteEvent, { capture: true });

    document.addEventListener('paste', handlePasteEvent, { capture: true });

    return () => {
      container.removeEventListener('paste', handlePasteEvent, { capture: true });
      document.removeEventListener('paste', handlePasteEvent, { capture: true });
    };
  }, []);

  const shapeUtils = [YouTubeShapeUtil];

  const isSmallScreen = windowWidth < 768;

  return (
    <div className={`flex h-screen bg-gray-100 ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
      <div className={`relative z-10 ${isSmallScreen ? 'h-[60vh]' : 'flex-1'}`}>
        <Tldraw
          onMount={handleEditorMount}
          persistenceKey="teach-mode-canvas"
          shapeUtils={shapeUtils}
          components={customComponents}
        />
      </div>

      <SidePanel editor={editor} />
    </div>
  );
};

export default TeachMode; 