import { useState } from 'react';
import { Trash2, ExternalLink, Copy, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';
import useNotesStore, { Note } from '../store/notesStore';
import useStore from '@/entrypoints/store/store';

const NotesLibrary = () => {
  const { notes, deleteNote, getNotesByTopic, exportNoteToPDF, exportTopicToPDF, exportAllNotesToPDF } = useNotesStore();
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  
  const notesByTopic = getNotesByTopic();
  const topics = Object.keys(notesByTopic).sort();
  
  const toggleTopic = (topic: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topic]: !prev[topic]
    }));
  };
  
  const handleCopyToClipboard = (note: Note) => {
    const noteText = `${note.noteText}\n\nVideo: ${note.videoTitle}\nTimestamp: ${note.timestamp}\nURL: ${note.videoUrl}`;
    navigator.clipboard.writeText(noteText);
  };
  
  const handleOpenInNewTab = (url: string, timestamp: string) => {
    window.open(`${url}&t=${convertTimestampToSeconds(timestamp)}`, '_blank');
  };
  
  const convertTimestampToSeconds = (timestamp: string): number => {
    if (!timestamp) return 0;
    
    const [hours, minutes, seconds] = timestamp.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };
  
  const handleExportToPDF = (noteId: string) => {
    exportNoteToPDF(noteId);
  };
  
  const handleExportTopicToPDF = (topic: string) => {
    exportTopicToPDF(topic);
  };
  
  const handleExportAllToPDF = () => {
    exportAllNotesToPDF();
  };
  
  if (notes.length === 0) {
    return (
      <div className="p-6 text-center opacity-70">
        No notes saved yet. Click the "Take Note" button while watching a video to add notes.
      </div>
    );
  }

  return (
    <div className="card bg-base-100 h-full">
      <div className="card-header px-6 py-4 flex justify-between items-center border-b border-base-300">
        <h2 className="card-title">Your Notes ({notes.length})</h2>
        <button
          onClick={handleExportAllToPDF}
          className="btn btn-neutral btn-sm gap-2"
          title="Export all notes to PDF"
        >
          <Printer className="w-3 h-3" />
          <span>Export All</span>
        </button>
      </div>
      
      <div className="max-h-[70vh] overflow-y-auto">
        {topics.map(topic => (
          <div key={topic} className="collapse collapse-arrow border-b border-base-300">
            <input 
              type="checkbox" 
              checked={expandedTopics[topic]} 
              onChange={() => toggleTopic(topic)}
            />
            <div className="collapse-title flex justify-between items-center text-sm px-6 py-3">
              <h3 className="font-medium">
                {topic} <span className="text-sm font-normal opacity-70">({notesByTopic[topic].length})</span>
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleExportTopicToPDF(topic);
                }}
                className="btn btn-ghost btn-sm gap-1"
                title={`Export ${topic} notes to PDF`}
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
            </div>
            
            <div className="collapse-content p-0">
              {notesByTopic[topic]
                .sort((a, b) => a.videoTitle.localeCompare(b.videoTitle) || a.timestamp.localeCompare(b.timestamp))
                .map(note => (
                  <div 
                    key={note.id}
                    className="px-6 py-4 border-t border-base-300"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {note.screenshot && (
                        <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4">
                          <div className="mask mask-squircle">
                            <img 
                              src={note.screenshot} 
                              alt="Video screenshot" 
                              className="w-full h-auto object-cover"
                              style={{ maxHeight: '120px' }}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-sm">
                            {note.videoTitle}
                          </h4>
                          <span className="text-sm opacity-70">
                            {note.timestamp}
                          </span>
                        </div>
                        
                        <p className="mb-3 text-sm opacity-90">
                          {note.noteText}
                        </p>
                        
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleCopyToClipboard(note)}
                            className="btn btn-ghost btn-sm btn-square"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenInNewTab(note.videoUrl, note.timestamp)}
                            className="btn btn-ghost btn-sm btn-square"
                            title="Open in new tab"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportToPDF(note.id)}
                            className="btn btn-ghost btn-sm btn-square"
                            title="Export to PDF"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="btn btn-ghost btn-sm btn-square text-error"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesLibrary; 