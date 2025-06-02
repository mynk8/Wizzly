import { useState, useEffect, useRef } from 'react';
import useStore from '@/entrypoints/store/store';

interface StreamingTranscriptionProps {
  transcription: { text: string; finished: boolean } | null;
  connected: boolean;
}

const StreamingTranscription = ({ transcription, connected }: StreamingTranscriptionProps) => {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [displayText, setDisplayText] = useState('');
  const [currentText, setCurrentText] = useState('');
  const accumulatedTextRef = useRef('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTextRef = useRef('');

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset when disconnected
  useEffect(() => {
    if (!connected) {
      setDisplayText('');
      setCurrentText('');
      accumulatedTextRef.current = '';
      lastTextRef.current = '';
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [connected]);

  // Process transcription updates
  useEffect(() => {
    if (!transcription || !connected) {
      return;
    }

    console.log('Transcription update:', transcription); // Debug log

    // Clean the text - remove newlines and extra spaces
    const cleanText = transcription.text.replace(/\n/g, ' ').trim();

    if (transcription.finished) {
      // When finished, display all accumulated text
      const finalText = accumulatedTextRef.current;
      console.log('Transcription finished. Final accumulated text:', finalText); // Debug log
      
      if (finalText) {
        setDisplayText(finalText);
        setCurrentText(''); // Clear streaming text

        // Clear the transcript after 1 second
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          setDisplayText('');
          accumulatedTextRef.current = ''; // Reset accumulation after display
          lastTextRef.current = '';
          console.log('Cleared transcript and reset accumulation'); // Debug log
        }, 1000);
      }
    } else {
      // While streaming (finished: false), accumulate text chunks
      if (cleanText && cleanText !== lastTextRef.current) {
        // Add new text to accumulation if it's different from last
        const currentAccumulated = accumulatedTextRef.current;
        const newAccumulated = currentAccumulated + (currentAccumulated ? ' ' : '') + cleanText;
        accumulatedTextRef.current = newAccumulated;
        lastTextRef.current = cleanText;
        
        console.log('Accumulated during streaming:', newAccumulated); // Debug log
      }
      
      // Show current accumulated text while streaming
      setCurrentText(accumulatedTextRef.current);
    }
  }, [transcription, connected]);

  if (!connected) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '450px' }}>
      <div className="card bg-base-100/60 backdrop-blur-md p-4 max-h-40 overflow-y-auto overflow-x-hidden">
        {/* Gradient fade at the start for long text */}
        <div 
          className="absolute top-0 left-0 right-0 h-4 pointer-events-none z-10 bg-gradient-to-b from-base-100/60 to-transparent"
        />
        
        {/* Gradient fade at the bottom for long text */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none z-10 bg-gradient-to-t from-base-100/60 to-transparent"
        />
        
        {/* Current streaming text */}
        {currentText && (
          <div className="text-sm font-medium relative z-0 leading-relaxed text-center">
            {currentText}
          </div>
        )}
        
        {/* Complete transcript display */}
        {displayText && (
          <div className="relative z-0 leading-relaxed">
            <div className="text-sm font-medium whitespace-pre-wrap break-words text-center">
              {displayText}
            </div>
          </div>
        )}
        
        {/* Placeholder when no transcription */}
        {!currentText && !displayText && (
          <div className="opacity-70 relative z-0 text-center">
            Listening for speech...
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingTranscription; 