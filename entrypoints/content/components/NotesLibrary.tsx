import { useState } from 'react';
import { Trash2, ExternalLink, Copy, ChevronDown, ChevronUp, Printer, Download } from 'lucide-react';
import useNotesStore, { Note } from '../store/notesStore';
import useStore from '@/entrypoints/store/store';

const NotesLibrary = () => {
  const { theme } = useStore();
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
      <div className={`p-6 text-center transition-colors duration-300 ${
        theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'
      }`}>
        No notes saved yet. Click the "Take Note" button while watching a video to add notes.
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-300 ${
      theme === 'dark' ? 'bg-[#0A0A0A]' : 'bg-[#FFFFFF]'
    }`}>
      <div className={`px-6 py-4 font-medium border-b transition-colors duration-300 flex justify-between items-center ${
        theme === 'dark' 
          ? 'border-[#252525] text-[#FFFFFF]' 
          : 'border-[#E0E0E0] text-[#000000]'
      }`}>
        <h2>Your Notes ({notes.length})</h2>
        <button
          onClick={handleExportAllToPDF}
          className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors duration-300 ${
            theme === 'dark'
              ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]'
              : 'bg-[#E0E0E0] text-[#000000] hover:bg-[#D0D0D0]'
          }`}
          title="Export all notes to PDF"
        >
          <Printer className="w-3 h-3" />
          <span>Export All</span>
        </button>
      </div>
      
      <div className="max-h-[70vh] overflow-y-auto">
        {topics.map(topic => (
          <div 
            key={topic}
            className={`border-b transition-colors duration-300 ${
              theme === 'dark' ? 'border-[#252525]' : 'border-[#E0E0E0]'
            }`}
          >
            <div 
              className={`flex justify-between items-center text-sm px-6 py-3 transition-colors duration-300 ${
                theme === 'dark'
                  ? 'hover:bg-[#151515]'
                  : 'hover:bg-[#F5F5F5]'
              }`}
            >
              <div 
                className="flex-grow cursor-pointer flex items-center"
                onClick={() => toggleTopic(topic)}
              >
                <h3 className={`font-medium transition-colors duration-300 ${
                  theme === 'dark' ? 'text-[#FFFFFF]' : 'text-gray-600'
                }`}>
                  {topic} <span className="text-sm font-normal">({notesByTopic[topic].length})</span>
                </h3>
                {expandedTopics[topic] ? (
                  <ChevronUp className={`w-4 h-4 ml-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'
                  }`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ml-2 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'
                  }`} />
                )}
              </div>
              
              <button
                onClick={() => handleExportTopicToPDF(topic)}
                className={`flex items-center gap-1 px-2 py-1 ml-2 rounded text-xs transition-colors duration-300 ${
                  theme === 'dark'
                    ? 'bg-[#252525] text-[#FFFFFF] hover:bg-[#3A3A3A]'
                    : 'bg-[#E0E0E0] text-[#000000] hover:bg-[#D0D0D0]'
                }`}
                title={`Export ${topic} notes to PDF`}
              >
                <Printer className="w-3 h-3" />
                <span>Print</span>
              </button>
            </div>
            
            {expandedTopics[topic] && (
              <div>
                {notesByTopic[topic]
                  .sort((a, b) => a.videoTitle.localeCompare(b.videoTitle) || a.timestamp.localeCompare(b.timestamp))
                  .map(note => (
                    <div 
                      key={note.id}
                      className={`px-6 py-4 border-t transition-colors duration-300 ${
                        theme === 'dark' ? 'border-[#252525]' : 'border-[#E0E0E0]'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {note.screenshot && (
                          <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 rounded-md overflow-hidden">
                            <img 
                              src={note.screenshot} 
                              alt="Video screenshot" 
                              className="w-full h-auto object-cover"
                              style={{ maxHeight: '120px', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-medium transition-colors duration-300 text-sm text-gray-300 ${
                              theme === 'dark' ? 'text-[#FFFFFF]' : 'text-[#000000]'
                            }`}>
                              {note.videoTitle}
                            </h4>
                            <span className={`text-sm transition-colors duration-300 ${
                              theme === 'dark' ? 'text-[#8E8E8E]' : 'text-[#666666]'
                            }`}>
                              {note.timestamp}
                            </span>
                          </div>
                          
                          <p className={`mb-3 transition-colors duration-300 text-sm ${
                            theme === 'dark' ? 'text-[#DDDDDD]' : 'text-[#333333]'
                          }`}>
                            {note.noteText}
                          </p>
                          
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleCopyToClipboard(note)}
                              className={`p-1 rounded transition-colors duration-300 ${
                                theme === 'dark'
                                  ? 'text-[#8E8E8E] hover:bg-[#252525] hover:text-[#FFFFFF]'
                                  : 'text-[#666666] hover:bg-[#E0E0E0] hover:text-[#000000]'
                              }`}
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenInNewTab(note.videoUrl, note.timestamp)}
                              className={`p-1 rounded transition-colors duration-300 ${
                                theme === 'dark'
                                  ? 'text-[#8E8E8E] hover:bg-[#252525] hover:text-[#FFFFFF]'
                                  : 'text-[#666666] hover:bg-[#E0E0E0] hover:text-[#000000]'
                              }`}
                              title="Open in new tab"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExportToPDF(note.id)}
                              className={`p-1 rounded transition-colors duration-300 ${
                                theme === 'dark'
                                  ? 'text-[#8E8E8E] hover:bg-[#252525] hover:text-[#FFFFFF]'
                                  : 'text-[#666666] hover:bg-[#E0E0E0] hover:text-[#000000]'
                              }`}
                              title="Export to PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className={`p-1 rounded transition-colors duration-300 ${
                                theme === 'dark'
                                  ? 'text-[#8E8E8E] hover:bg-[#252525] hover:text-[#FF4D4D]'
                                  : 'text-[#666666] hover:bg-[#E0E0E0] hover:text-[#FF4D4D]'
                              }`}
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
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesLibrary; 