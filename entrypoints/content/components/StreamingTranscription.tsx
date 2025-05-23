import { useState, useEffect } from 'react';
import useStore from '@/entrypoints/store/store';

interface TranscriptionWord {
  id: string;
  text: string;
}

interface StreamingTranscriptionProps {
  transcription: { text: string; finished: boolean } | null;
  connected: boolean;
}

const StreamingTranscription = ({ transcription, connected }: StreamingTranscriptionProps) => {
  const { theme } = useStore();
  const isDark = theme === 'dark';
  const [words, setWords] = useState<TranscriptionWord[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [wordIdCounter, setWordIdCounter] = useState(0);

  useEffect(() => {
    if (!transcription || !connected) {
      setWords([]);
      setCurrentText('');
      return;
    }

    const newText = transcription.text;
    setCurrentText(newText);

    if (transcription.finished && newText.trim()) {
      const newWords = newText.split(' ').filter(word => word.trim()).map(word => {
        const id = `word-${wordIdCounter}`;
        setWordIdCounter(prev => prev + 1);
        return { id, text: word };
      });

      setWords(prevWords => {
        const allWords = [...prevWords, ...newWords];
        return allWords.slice(-16);
      });
      setCurrentText('');
    }
  }, [transcription, connected, wordIdCounter]);

  if (!connected) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '320px' }}>
      <div className={`p-4 rounded-lg backdrop-blur-md ${
        isDark 
          ? 'bg-black/60 text-white' 
          : 'bg-white/60 text-black'
      }`}>
        {/* Gradient fade at the start */}
        <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none z-10"
             style={{
               background: isDark 
                 ? 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
                 : 'linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)'
             }}
        />
        
        {/* Current streaming text */}
        {currentText && (
          <div className="text-base font-medium mb-2 relative z-0">
            {currentText}
          </div>
        )}
        
        {/* Previous text in rows */}
        {words.length > 0 && (
          <div className="space-y-2 relative z-0">
            {Array.from({ length: Math.min(4, Math.ceil(words.length / 4)) }, (_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex flex-wrap gap-1">
                {words.slice(rowIndex * 4, (rowIndex + 1) * 4).map(word => (
                  <span
                    key={word.id}
                    className="text-base font-medium"
                  >
                    {word.text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {/* Placeholder when no transcription */}
        {!currentText && words.length === 0 && (
          <div className={`${isDark ? 'text-gray-300' : 'text-gray-700'} relative z-0`}>
            Listening for speech...
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingTranscription; 