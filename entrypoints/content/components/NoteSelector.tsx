import { useState } from 'react';
import { X, Search } from 'lucide-react';
import useNotesStore, { Note } from '../store/notesStore';
import useStore from '@/entrypoints/store/store';

interface NoteSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (note: Note) => void;
}

const NoteSelector = ({ isOpen, onClose, onSelectNote }: NoteSelectorProps) => {
  const { theme } = useStore();
  const { notes, getNotesByTopic } = useNotesStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  
  const notesByTopic = getNotesByTopic();
  const topics = Object.keys(notesByTopic).sort();
  
  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };
  
  const filteredTopics = topics.filter(topic => {
    if (!searchTerm) return true;
    
    if (topic.toLowerCase().includes(searchTerm.toLowerCase())) return true;
    
    return notesByTopic[topic].some(note => 
      note.noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.videoTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      <div 
        className={`relative w-full max-w-md max-h-[80vh] flex flex-col rounded-lg shadow-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-[#101010] text-[#FFFFFF] border border-[#252525]' 
            : 'bg-[#F5F5F5] text-[#000000] border border-[#D0D0D0]'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b transition-colors duration-300 ${
          theme === 'dark' ? 'border-[#252525]' : 'border-[#E0E0E0]'
        }">
          <h2 className="text-lg font-medium">Select Note for Context</h2>
          <button 
            onClick={onClose}
            className={`p-1 rounded-full transition-colors duration-300 ${
              theme === 'dark'
                ? 'hover:bg-[#252525]'
                : 'hover:bg-[#E0E0E0]'
            }`}
          >
            <X className={`w-4 h-4 ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`} />
          </button>
        </div>
        
        <div className="p-4 border-b transition-colors duration-300 ${
          theme === 'dark' ? 'border-[#252525]' : 'border-[#E0E0E0]'
        }">
          <div className={`flex items-center px-3 py-2 rounded border transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-[#1A1A1A] border-[#252525] focus-within:border-[#3A3A3A]'
              : 'bg-[#FFFFFF] border-[#D0D0D0] focus-within:border-[#A0A0A0]'
          }`}>
            <Search className={`w-4 h-4 mr-2 ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className={`w-full bg-transparent border-none focus:outline-none text-sm ${
                theme === 'dark' ? 'text-[#FFFFFF]' : 'text-[#000000]'
              }`}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {notes.length === 0 ? (
            <div className={`p-6 text-center ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
              No notes available. Create some notes first.
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className={`p-6 text-center ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
              No notes match your search.
            </div>
          ) : (
            filteredTopics.map(topic => (
              <div 
                key={topic}
                className={`border-b transition-colors duration-300 ${
                  theme === 'dark' ? 'border-[#252525]' : 'border-[#E0E0E0]'
                }`}
              >
                <div 
                  className={`flex justify-between items-center px-4 py-3 cursor-pointer transition-colors duration-300 ${
                    theme === 'dark'
                      ? 'hover:bg-[#151515]'
                      : 'hover:bg-[#E8E8E8]'
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  <h3 className="font-medium">
                    {topic} <span className="text-sm font-normal">({notesByTopic[topic].length})</span>
                  </h3>
                  <span className={`text-xs ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
                    {expandedTopics[topic] ? 'Hide' : 'Show'}
                  </span>
                </div>
                
                {expandedTopics[topic] && (
                  <div>
                    {notesByTopic[topic]
                      .filter(note => 
                        !searchTerm || 
                        note.noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        note.videoTitle.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(note => (
                        <div 
                          key={note.id}
                          className={`px-4 py-3 border-t cursor-pointer transition-colors duration-300 ${
                            theme === 'dark' 
                              ? 'border-[#252525] hover:bg-[#151515]' 
                              : 'border-[#E0E0E0] hover:bg-[#E8E8E8]'
                          }`}
                          onClick={() => onSelectNote(note)}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium truncate max-w-[70%]">
                              {note.videoTitle}
                            </h4>
                            <span className={`text-xs ${theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'}`}>
                              {note.timestamp}
                            </span>
                          </div>
                          <p className={`text-sm line-clamp-2 ${theme === 'dark' ? 'text-[#DDDDDD]' : 'text-[#333333]'}`}>
                            {note.noteText}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteSelector; 