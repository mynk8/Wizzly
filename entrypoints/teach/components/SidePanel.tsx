import React, { useState } from 'react';
import { Editor } from '@tldraw/tldraw';
import { MessageCircle, Mic, BookOpen, Camera, X, Minimize2, Maximize2, Youtube, BarChart3, Home, Folder, Expand, Shrink } from 'lucide-react';
import useStore from '../../store/store';
import './SidePanel.css';

import Chat from '../../content/components/Chat';
import MicrophoneControls from '../../content/components/MicrophoneControls';
import NotesLibrary from '../../content/components/NotesLibrary';
import CanvasNoteModal from './CanvasNoteModal';
import LessonPlanner from './LessonPlanner';
import ResourceManager from './ResourceManager';
import LessonHistory from './LessonHistory';
import { GenAIProvider } from '../../contexts/ChatAPIContext';
import { LiveAPIProvider } from '../../contexts/LiveAPIContext';

const apiKey = "";

const FULLSCREEN_TABS = ['planner', 'resources', 'history'];

interface SidePanelProps {
  editor: Editor | null;
}

const SidePanel: React.FC<SidePanelProps> = ({ editor }) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'chat' | 'voice' | 'notes' | 'resources' | 'history'>('planner');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const { theme } = useStore();

  const handleCaptureCanvas = () => {
    setNoteModalOpen(true);
  };

  const handleSaveCanvas = (canvasData: any, metadata: any) => {
    // Handle canvas saving logic here
    console.log('Saving canvas:', { canvasData, metadata });
  };

  const handleLoadCanvas = (canvasData: any) => {
    // Handle canvas loading logic here
    console.log('Loading canvas:', canvasData);
    // You would integrate this with the Tldraw editor to load the canvas data
  };

  const getCurrentCanvasData = () => {
    // Get current canvas data from the editor
    if (!editor) return null;
    try {
      return editor.store.serialize();
    } catch (error) {
      console.warn('Failed to serialize canvas data:', error);
      return null;
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (isCollapsed) {
      setIsCollapsed(false);
    }
  };

  const isFullscreenBeneficialTab = FULLSCREEN_TABS.includes(activeTab);
  
  const canGoFullScreen = isFullscreenBeneficialTab;

  const shouldShowCompactView = !isFullScreen && isFullscreenBeneficialTab;

  if (isCollapsed) {
    return (
      <div className="w-12 border-l border-gray-200 bg-gray-50 flex flex-col h-full relative z-50">
        <div className="p-2 space-y-2">
          <button 
            onClick={() => setIsCollapsed(false)}
            className="btn btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Expand sidebar"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setActiveTab('planner'); setIsCollapsed(false); }}
            className="btn btn-ghost btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Lesson Planner"
          >
            <Home className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setActiveTab('chat'); setIsCollapsed(false); }}
            className="btn btn-ghost btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Chat"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setActiveTab('voice'); setIsCollapsed(false); }}
            className="btn btn-ghost btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Voice"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setActiveTab('notes'); setIsCollapsed(false); }}
            className="btn btn-ghost btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Notes"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setActiveTab('resources'); setIsCollapsed(false); }}
            className="btn btn-ghost btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Resources"
          >
            <Folder className="w-4 h-4" />
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setIsCollapsed(false); }}
            className="btn btn-ghost btn-sm btn-square w-full transition-all duration-200 hover:scale-105"
            title="Lesson History"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCaptureCanvas}
            className="btn btn-primary btn-sm btn-square w-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
            title="Capture Canvas"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`side-panel border-l border-gray-200 bg-gray-50 flex flex-col h-full panel-transition ${
      isFullScreen ? 'fixed inset-0 z-[60] w-full' : 'w-96 z-50'
    }`}>
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-100">
        <div className={`tabs tabs-bordered flex-1 ${isFullScreen ? 'flex flex-row gap-1' : 'grid grid-cols-3 gap-1'}`}>
          <button 
            className={`tab tab-xs h-12 ${activeTab === 'planner' ? 'tab-active bg-gray-300 rounded-lg' : ''} ${(isFullScreen || activeTab === 'planner') ? 'flex-col' : ''}`}
            onClick={() => setActiveTab('planner')}
            title="Lesson Planner"
          >
            <Home className="w-4 h-4" />
            {(isFullScreen || activeTab === 'planner') && <span className={`text-xs ${isFullScreen ? 'ml-1' : 'mt-1'}`}>Planner</span>}
          </button>
          <button 
            className={`tab tab-xs h-12 ${activeTab === 'chat' ? 'tab-active bg-gray-300 rounded-lg' : ''} ${(isFullScreen || activeTab === 'chat') ? 'flex-col' : ''}`}
            onClick={() => setActiveTab('chat')}
            title="Chat"
          >
            <MessageCircle className="w-4 h-4" />
            {(isFullScreen || activeTab === 'chat') && <span className={`text-xs ${isFullScreen ? 'ml-1' : 'mt-1'}`}>Chat</span>}
          </button>
          <button 
            className={`tab tab-xs h-12 ${activeTab === 'voice' ? 'tab-active bg-gray-300 rounded-lg' : ''} ${(isFullScreen || activeTab === 'voice') ? 'flex-col' : ''}`}
            onClick={() => setActiveTab('voice')}
            title="Voice"
          >
            <Mic className="w-4 h-4" />
            {(isFullScreen || activeTab === 'voice') && <span className={`text-xs ${isFullScreen ? 'ml-1' : 'mt-1'}`}>Voice</span>}
          </button>
          <button 
            className={`tab tab-xs h-12 ${activeTab === 'notes' ? 'tab-active bg-gray-300 rounded-lg' : ''} ${(isFullScreen || activeTab === 'notes') ? 'flex-col' : ''}`}
            onClick={() => setActiveTab('notes')}
            title="Notes"
          >
            <BookOpen className="w-4 h-4" />
            {(isFullScreen || activeTab === 'notes') && <span className={`text-xs ${isFullScreen ? 'ml-1' : 'mt-1'}`}>Notes</span>}
          </button>
          <button 
            className={`tab tab-xs h-12 ${activeTab === 'resources' ? 'tab-active bg-gray-300 rounded-lg' : ''} ${(isFullScreen || activeTab === 'resources') ? 'flex-col' : ''}`}
            onClick={() => setActiveTab('resources')}
            title="Resources"
          >
            <Folder className="w-4 h-4" />
            {(isFullScreen || activeTab === 'resources') && <span className={`text-xs ${isFullScreen ? 'ml-1' : 'mt-1'}`}>Resources</span>}
          </button>
          <button 
            className={`tab tab-xs h-12 ${activeTab === 'history' ? 'tab-active bg-gray-300 rounded-lg' : ''} ${(isFullScreen || activeTab === 'history') ? 'flex-col' : ''}`}
            onClick={() => setActiveTab('history')}
            title="History"
          >
            <BarChart3 className="w-4 h-4" />
            {(isFullScreen || activeTab === 'history') && <span className={`text-xs ${isFullScreen ? 'ml-1' : 'mt-1'}`}>History</span>}
          </button>
        </div>
        <div className={`flex ${isFullScreen ? 'flex-row gap-2 ml-4' : 'flex-col gap-1 ml-2'}`}>
          <button 
            onClick={handleCaptureCanvas}
            className={`btn btn-primary btn-sm transition-all duration-200 hover:scale-105 hover:shadow-lg ${
              isFullScreen ? 'text-xs px-3' : 'w-full text-xs px-2'
            }`}
            title="Capture Canvas"
          >
            <Camera className="w-4 h-4" />
            <span className="ml-1">Capture</span>
          </button>
          {canGoFullScreen && (
            <button 
              onClick={toggleFullScreen}
              className={`btn btn-secondary btn-sm transition-all duration-200 hover:scale-105 ${
                isFullScreen ? 'text-xs px-3' : 'w-full text-xs px-2'
              }`}
              title={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              {isFullScreen ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              <span className="ml-1">{isFullScreen ? "Exit Fullscreen" : "Expand"}</span>
            </button>
          )}
          <button 
            onClick={() => setIsCollapsed(true)}
            className={`btn btn-ghost btn-sm transition-all duration-200 hover:scale-105 ${
              isFullScreen ? 'text-xs px-3' : 'w-full text-xs px-2'
            }`}
            title="Collapse sidebar"
          >
            <Minimize2 className="w-4 h-4" />
            <span className="ml-1">Collapse</span>
          </button>
        </div>
      </div>

      {/* Full Screen Header (when in full screen mode) */}
      {isFullScreen && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 expand-animation">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                {activeTab === 'planner' && <Home className="w-5 h-5" />}
                {activeTab === 'resources' && <Folder className="w-5 h-5" />}
                {activeTab === 'history' && <BarChart3 className="w-5 h-5" />}
                {activeTab === 'chat' && <MessageCircle className="w-5 h-5" />}
                {activeTab === 'voice' && <Mic className="w-5 h-5" />}
                {activeTab === 'notes' && <BookOpen className="w-5 h-5" />}
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  {activeTab === 'planner' && 'Lesson Planner'}
                  {activeTab === 'resources' && 'Resource Manager'}
                  {activeTab === 'history' && 'Lesson History'}
                  {activeTab === 'chat' && 'AI Assistant'}
                  {activeTab === 'voice' && 'Voice Controls'}
                  {activeTab === 'notes' && 'Notes Library'}
                </h1>
                <p className="text-white/80 text-sm">
                  {activeTab === 'planner' && 'Plan and organize your lesson structure and flow'}
                  {activeTab === 'resources' && 'Manage lesson materials, links, and attachments'}
                  {activeTab === 'history' && 'Review and reuse your previous lessons'}
                  {activeTab === 'chat' && 'Get help with lesson planning and content creation'}
                  {activeTab === 'voice' && 'Hands-free interaction with voice commands'}
                  {activeTab === 'notes' && 'Organize and search your teaching notes'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleFullScreen}
              className="btn btn-ghost btn-sm text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
              Exit Full Screen
            </button>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className={`flex-1 overflow-hidden ${shouldShowCompactView ? 'mobile-optimized-view' : ''}`}>
        {activeTab === 'planner' && (
          <div className="h-full overflow-auto">
            <LessonPlanner editor={editor} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="h-full">
            <GenAIProvider apiKey={apiKey}>
              <Chat />
            </GenAIProvider>
          </div>
        )}
        
        {activeTab === 'voice' && (
          <div className="h-full">
            <LiveAPIProvider options={{ apiKey: apiKey }}>
              <MicrophoneControls />
            </LiveAPIProvider>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="h-full">
            <NotesLibrary />
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="h-full">
            {shouldShowCompactView ? (
              <div className="p-4">
                <div className="text-center p-4 bg-base-200 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Resource Manager</h3>
                  <p className="text-sm text-gray-600 mb-3">Manage all your teaching resources</p>
                  <button 
                    onClick={toggleFullScreen}
                    className="btn btn-primary btn-sm"
                  >
                    <Expand className="w-4 h-4 mr-1" />
                    Open Full Resource Manager
                  </button>
                </div>
                
                {/* Compact view for resources */}
                <div className="space-y-4">
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">Quick Resource Access</h3>
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Search Resources</span>
                        </label>
                        <input type="text" placeholder="Search..." className="input input-bordered input-sm" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">Recent Resources</h3>
                      <div className="resource-grid">
                        <div className="p-2 bg-base-200 rounded-lg flex items-center text-sm">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-2">
                            <i className="text-blue-500">PDF</i>
                          </div>
                          <span className="truncate-text">Lesson Worksheet</span>
                        </div>
                        <div className="p-2 bg-base-200 rounded-lg flex items-center text-sm">
                          <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center mr-2">
                            <i className="text-green-500">IMG</i>
                          </div>
                          <span className="truncate-text">Diagram</span>
                        </div>
                        <div className="p-2 bg-base-200 rounded-lg flex items-center text-sm">
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center mr-2">
                            <i className="text-red-500">URL</i>
                          </div>
                          <span className="truncate-text">Educational Video</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ResourceManager 
                onLoadCanvas={handleLoadCanvas}
                onSaveCanvas={handleSaveCanvas}
                currentCanvasData={getCurrentCanvasData()}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="h-full">
            {shouldShowCompactView ? (
              <div className="p-4">
                <div className="text-center p-4 bg-base-200 rounded-lg mb-4">
                  <h3 className="font-semibold mb-2">Lesson History</h3>
                  <p className="text-sm text-gray-600 mb-3">View and manage your past lessons</p>
                  <button 
                    onClick={toggleFullScreen}
                    className="btn btn-primary btn-sm"
                  >
                    <Expand className="w-4 h-4 mr-1" />
                    Open Full History
                  </button>
                </div>
                
                {/* Compact view for lesson history */}
                <div className="space-y-4">
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">Recent History</h3>
                      <div className="space-y-2">
                        <div className="p-2 bg-base-200 rounded-lg text-sm flex justify-between">
                          <span className="truncate-text">Math - Fractions</span>
                          <span className="text-xs text-gray-500">Yesterday</span>
                        </div>
                        <div className="p-2 bg-base-200 rounded-lg text-sm flex justify-between">
                          <span className="truncate-text">Science - Plants</span>
                          <span className="text-xs text-gray-500">May 30</span>
                        </div>
                        <div className="p-2 bg-base-200 rounded-lg text-sm flex justify-between">
                          <span className="truncate-text">History - Civil War</span>
                          <span className="text-xs text-gray-500">May 28</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card bg-base-100 shadow-sm">
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">Quick Stats</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-base-200 p-2 rounded-lg text-center">
                          <div className="text-lg font-bold">12</div>
                          <div className="text-xs">Lessons</div>
                        </div>
                        <div className="bg-base-200 p-2 rounded-lg text-center">
                          <div className="text-lg font-bold">4</div>
                          <div className="text-xs">Subjects</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <LessonHistory />
            )}
          </div>
        )}
      </div>

      <CanvasNoteModal 
        isOpen={noteModalOpen} 
        onClose={() => setNoteModalOpen(false)}
        editor={editor}
      />
    </div>
  );
};

export default SidePanel; 