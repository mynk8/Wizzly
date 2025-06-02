import React, { useState, useCallback, useEffect } from 'react';
import { 
  Tldraw, 
  Editor,
  TLOnMountHandler,
  createShapeId
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';

import SidePanel from './SidePanel';

import { handleYouTubePaste } from '../utils/canvas';
import { YouTubeShapeUtil, isYouTubeUrl, extractYouTubeId } from '../utils/YouTubeShapeUtil';
import { AIPromptShapeUtil, AIResponseShapeUtil } from '../utils/AIPromptShapeUtil';
import { AIPromptShapeTool } from '../utils/AIPromptShapeTool';
import { uiOverrides, components } from '../utils/ui-overrides';
import useStore from '@/entrypoints/store/store';

// Define arrays outside of component to avoid redefinition on every render
const customShapeUtils = [YouTubeShapeUtil, AIPromptShapeUtil, AIResponseShapeUtil];
const customTools = [AIPromptShapeTool];

const TeachMode: React.FC = () => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { setAppContext } = useStore();

  // Set context when component mounts
  useEffect(() => {
    setAppContext('canvas');
  }, [setAppContext]);

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
  }, []);

  // Separate useEffect for event listener setup and cleanup
  useEffect(() => {
    if (!editor) return;

    const handlePasteEvent = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData('text/plain');
      if (text && isYouTubeUrl(text)) {
        handleYouTubePaste(editor, e, isYouTubeUrl, extractYouTubeId, createShapeId);
        return;
      }
    };

    let container;
    try {
      container = editor.getContainer();
    } catch (error) {
      console.error('Failed to get editor container:', error);
      return;
    }
    container.addEventListener('paste', handlePasteEvent, { capture: true });
    document.addEventListener('paste', handlePasteEvent, { capture: true });

    // Cleanup function
    return () => {
      container.removeEventListener('paste', handlePasteEvent, { capture: true });
      document.removeEventListener('paste', handlePasteEvent, { capture: true });
    };
  }, [editor]);

  const isSmallScreen = windowWidth < 768;

  return (
    <div className={`flex h-screen bg-gray-100 ${isSmallScreen ? 'flex-col' : 'flex-row'}`}>
      <div className={`relative z-10 ${isSmallScreen ? 'h-[60vh]' : 'flex-1'}`}>
        <Tldraw
          onMount={handleEditorMount}
          persistenceKey="teach-mode-canvas"
          shapeUtils={customShapeUtils}
          tools={customTools}
          overrides={uiOverrides}
          components={components}
        />
      </div>

      <SidePanel editor={editor} />
    </div>
  );
};

export default TeachMode; 