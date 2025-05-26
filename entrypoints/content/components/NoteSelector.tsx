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
    <dialog open className="modal modal-open">
      <div className="modal-backdrop bg-black/50" onClick={onClose} />
      <div className="modal-box w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Select Note for Context</h2>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="form-control mb-4">
          <div className="input-group">
            <span className="btn btn-square btn-ghost">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notes..."
              className="input input-bordered w-full"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {notes.length === 0 ? (
            <div className="text-center opacity-70 p-6">
              No notes available. Create some notes first.
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center opacity-70 p-6">
              No notes match your search.
            </div>
          ) : (
            <div className="menu menu-lg w-full p-0">
              {filteredTopics.map(topic => (
                <div key={topic} className="collapse collapse-arrow border-b">
                  <input 
                    type="checkbox" 
                    checked={expandedTopics[topic]} 
                    onChange={() => toggleTopic(topic)}
                  />
                  <div className="collapse-title font-medium">
                    {topic} <span className="text-sm font-normal opacity-70">({notesByTopic[topic].length})</span>
                  </div>
                  <div className="collapse-content p-0">
                    {notesByTopic[topic]
                      .filter(note => 
                        !searchTerm || 
                        note.noteText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        note.videoTitle.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map(note => (
                        <div 
                          key={note.id}
                          onClick={() => onSelectNote(note)}
                          className="p-4 hover:bg-base-200 cursor-pointer border-t"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium truncate max-w-[70%]">
                              {note.videoTitle}
                            </h4>
                            <span className="text-xs opacity-70">
                              {note.timestamp}
                            </span>
                          </div>
                          <p className="text-sm line-clamp-2 opacity-90">
                            {note.noteText}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
};

export default NoteSelector; 