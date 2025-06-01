import React, { useState, useEffect } from 'react';
import {
  Plus,
  Link,
  FileText,
  Video,
  Image,
  Download,
  ExternalLink,
  Trash2,
  Edit3,
  Search,
  Filter,
  Upload,
  Folder,
  Globe,
  BookOpen,
  PaperclipIcon,
  Star,
  StarOff,
  Copy,
  Share2,
  Sparkles,
  Lightbulb
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'link' | 'file' | 'video' | 'document' | 'worksheet' | 'image';
  url: string;
  source: 'google-drive' | 'youtube' | 'local' | 'web' | 'google-docs' | 'google-sheets';
  tags: string[];
  isFavorite: boolean;
  dateAdded: Date;
  fileSize?: string;
  thumbnail?: string;
}

interface ResourceManagerProps {
  onLoadCanvas?: (canvasData: any) => void;
  onSaveCanvas?: (canvasData: any, metadata: any) => void;
  currentCanvasData?: any;
}

// Mock AI Modal State
interface AiResourceModalState {
  isOpen: boolean;
  context: string; // e.g., current search term, selected resource title
  suggestions: Partial<Resource>[];
  isLoading: boolean;
}

const ResourceManager: React.FC<ResourceManagerProps> = ({
  onLoadCanvas,
  onSaveCanvas,
  currentCanvasData
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    url: '',
    type: 'link' as Resource['type'],
    source: 'web' as Resource['source'],
    tags: ''
  });
  const [aiResourceModal, setAiResourceModal] = useState<AiResourceModalState>({ isOpen: false, context: '', suggestions: [], isLoading: false });

  // Load resources from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lessonResources');
    if (saved) {
      const parsed = JSON.parse(saved);
      setResources(parsed.map((r: any) => ({
        ...r,
        dateAdded: new Date(r.dateAdded)
      })));
    } else {
      // Add some sample resources
      const sampleResources: Resource[] = [
        {
          id: '1',
          title: 'Khan Academy - Algebra Basics',
          description: 'Comprehensive algebra tutorial series',
          type: 'video',
          url: 'https://www.khanacademy.org/math/algebra',
          source: 'web',
          tags: ['algebra', 'math', 'tutorial'],
          isFavorite: true,
          dateAdded: new Date('2024-01-15'),
          thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NzNkYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hdGggVmlkZW88L3RleHQ+PC9zdmc+'
        },
        {
          id: '2',
          title: 'Biology Lab Worksheet',
          description: 'Cell structure identification worksheet',
          type: 'worksheet',
          url: '/worksheets/cell-structure.pdf',
          source: 'local',
          tags: ['biology', 'cells', 'worksheet'],
          isFavorite: false,
          dateAdded: new Date('2024-01-10'),
          fileSize: '2.3 MB'
        },
        {
          id: '3',
          title: 'Google Slides - Solar System',
          description: 'Interactive presentation about planets',
          type: 'document',
          url: 'https://docs.google.com/presentation/d/example',
          source: 'google-docs',
          tags: ['astronomy', 'planets', 'presentation'],
          isFavorite: true,
          dateAdded: new Date('2024-01-08')
        }
      ];
      setResources(sampleResources);
    }
  }, []);

  // Save resources to localStorage
  useEffect(() => {
    if (resources.length > 0) {
      localStorage.setItem('lessonResources', JSON.stringify(resources));
    }
  }, [resources]);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSource = selectedSource === 'all' || resource.source === selectedSource;
    const matchesFavorites = !showFavoritesOnly || resource.isFavorite;
    
    return matchesSearch && matchesType && matchesSource && matchesFavorites;
  });

  const handleAddResource = () => {
    if (!newResource.title || !newResource.url) return;

    const resource: Resource = {
      id: Date.now().toString(),
      title: newResource.title,
      description: newResource.description,
      type: newResource.type,
      url: newResource.url,
      source: newResource.source,
      tags: newResource.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isFavorite: false,
      dateAdded: new Date()
    };

    setResources(prev => [resource, ...prev]);
    setNewResource({
      title: '',
      description: '',
      url: '',
      type: 'link',
      source: 'web',
      tags: ''
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteResource = (id: string) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      setResources(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleToggleFavorite = (id: string) => {
    setResources(prev => prev.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  };

  const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
      case 'link': return <Link className="w-5 h-5 text-blue-500" />;
      case 'video': return <Video className="w-5 h-5 text-red-500" />;
      case 'document': return <FileText className="w-5 h-5 text-green-500" />;
      case 'worksheet': return <BookOpen className="w-5 h-5 text-purple-500" />;
      case 'image': return <Image className="w-5 h-5 text-pink-500" />;
      case 'file': return <PaperclipIcon className="w-5 h-5 text-gray-500" />;
      default: return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSourceIcon = (source: Resource['source']) => {
    switch (source) {
      case 'google-drive': return <Folder className="w-4 h-4 text-blue-600" />;
      case 'google-docs': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'google-sheets': return <FileText className="w-4 h-4 text-green-600" />;
      case 'youtube': return <Video className="w-4 h-4 text-red-600" />;
      case 'web': return <Globe className="w-4 h-4 text-gray-600" />;
      case 'local': return <Upload className="w-4 h-4 text-purple-600" />;
      default: return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleQuickAdd = (type: 'google-drive' | 'youtube' | 'google-docs') => {
    const url = prompt(`Enter ${type} URL:`);
    if (!url) return;

    let resourceType: Resource['type'] = 'link';
    let title = '';

    switch (type) {
      case 'google-drive':
        resourceType = 'file';
        title = 'Google Drive File';
        break;
      case 'youtube':
        resourceType = 'video';
        title = 'YouTube Video';
        break;
      case 'google-docs':
        resourceType = 'document';
        title = 'Google Document';
        break;
    }

    const resource: Resource = {
      id: Date.now().toString(),
      title,
      description: '',
      type: resourceType,
      url,
      source: type,
      tags: [],
      isFavorite: false,
      dateAdded: new Date()
    };

    setResources(prev => [resource, ...prev]);
  };

  // Mock AI Function for Resource Suggestions
  const handleAISuggestResources = async () => {
    const context = searchTerm || 'general educational topics';
    setAiResourceModal({ isOpen: true, context, suggestions: [], isLoading: true });

    console.log(`AI: Suggesting resources for "${context}"`);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

    const mockSuggestions: Partial<Resource>[] = [
      {
        title: `Interactive ${context} Simulation Game`,
        description: `Engaging game to learn about ${context}.`,
        type: 'link',
        url: 'https://example.com/interactive-game/' + context.replace(/\s+/g, '-').toLowerCase(),
        source: 'web',
        tags: [context.split(' ')[0], 'interactive', 'AI suggestion']
      },
      {
        title: `Video Explainer: ${context} for Beginners`,
        description: `Clear and concise video on ${context}.`,
        type: 'video',
        url: 'https://youtube.com/results?search_query=' + context.replace(/\s+/g, '+'),
        source: 'youtube',
        tags: [context.split(' ')[0], 'video', 'explainer', 'AI suggestion']
      },
      {
        title: `In-depth Article on ${context}`,
        description: `Comprehensive article from a reputable source.`,
        type: 'link',
        url: 'https://en.wikipedia.org/wiki/' + context.replace(/\s+/g, '_'),
        source: 'web',
        tags: [context.split(' ')[0], 'article', 'research', 'AI suggestion']
      }
    ];
    setAiResourceModal({ isOpen: true, context, suggestions: mockSuggestions, isLoading: false });
  };

  const addSuggestedResource = (suggestedRes: Partial<Resource>) => {
    const resource: Resource = {
      id: Date.now().toString() + Math.random().toString(36).substring(2,7),
      title: suggestedRes.title || 'AI Suggested Resource',
      description: suggestedRes.description || '',
      type: suggestedRes.type || 'link',
      url: suggestedRes.url || '#',
      source: suggestedRes.source || 'web',
      tags: suggestedRes.tags || ['AI'],
      isFavorite: false,
      dateAdded: new Date()
    };
    setResources(prev => [resource, ...prev]);
    // Optionally, close modal or remove suggestion from list
    setAiResourceModal(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.title !== suggestedRes.title)
    }));
    alert(`Added "${resource.title}" to resources!`);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Resource Manager</h2>
          <div className="flex gap-2">
            <button
              onClick={handleAISuggestResources}
              className="btn btn-accent btn-sm gap-2"
              title="Suggest Resources with AI"
            >
              <Lightbulb className="w-4 h-4" />
              AI Suggestions
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary btn-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Resource
            </button>
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleQuickAdd('google-drive')}
            className="btn btn-outline btn-sm gap-2"
          >
            <Folder className="w-4 h-4" />
            Google Drive
          </button>
          <button
            onClick={() => handleQuickAdd('youtube')}
            className="btn btn-outline btn-sm gap-2"
          >
            <Video className="w-4 h-4" />
            YouTube
          </button>
          <button
            onClick={() => handleQuickAdd('google-docs')}
            className="btn btn-outline btn-sm gap-2"
          >
            <FileText className="w-4 h-4" />
            Google Docs
          </button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 input-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">All Types</option>
              <option value="link">Links</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
              <option value="worksheet">Worksheets</option>
              <option value="image">Images</option>
              <option value="file">Files</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">All Sources</option>
              <option value="google-drive">Google Drive</option>
              <option value="google-docs">Google Docs</option>
              <option value="google-sheets">Google Sheets</option>
              <option value="youtube">YouTube</option>
              <option value="web">Web</option>
              <option value="local">Local Files</option>
            </select>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`btn btn-sm gap-1 ${showFavoritesOnly ? 'btn-warning' : 'btn-ghost'}`}
            >
              <Star className="w-4 h-4" />
              Favorites
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType !== 'all' || selectedSource !== 'all' || showFavoritesOnly
                ? 'Try adjusting your filters'
                : 'Start adding resources for your lessons'
              }
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary gap-2"
            >
              <Plus className="w-4 h-4" />
              Add First Resource
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                className="card bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <div className="flex items-center gap-1">
                        {getSourceIcon(resource.source)}
                        <span className="text-xs text-gray-500 capitalize">{resource.source}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(resource.id)}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      {resource.isFavorite ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="font-medium text-sm mb-2 line-clamp-2">{resource.title}</h3>
                  
                  {resource.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                  )}

                  {resource.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {resource.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-xs badge-ghost">{tag}</span>
                      ))}
                      {resource.tags.length > 3 && (
                        <span className="badge badge-xs badge-ghost">+{resource.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>{resource.dateAdded.toLocaleDateString()}</span>
                    {resource.fileSize && <span>{resource.fileSize}</span>}
                  </div>

                  <div className="card-actions justify-between">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-xs gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open
                    </a>
                    <div className="flex gap-1">
                      <button
                        onClick={() => navigator.clipboard.writeText(resource.url)}
                        className="btn btn-ghost btn-xs"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs"
                        title="Share"
                      >
                        <Share2 className="w-3 h-3" />
                      </button>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-xs">⋯</button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-32 z-10">
                          <li><a><Edit3 className="w-4 h-4" />Edit</a></li>
                          <li><a><Download className="w-4 h-4" />Download</a></li>
                          <li><a onClick={() => handleDeleteResource(resource.id)} className="text-error"><Trash2 className="w-4 h-4" />Delete</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {isAddModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Add New Resource</h3>
            
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title *</span>
                </label>
                <input
                  type="text"
                  value={newResource.title}
                  onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                  className="input input-bordered"
                  placeholder="Resource title"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">URL *</span>
                </label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  className="input input-bordered"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Type</span>
                  </label>
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as Resource['type'] }))}
                    className="select select-bordered"
                  >
                    <option value="link">Link</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="image">Image</option>
                    <option value="file">File</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Source</span>
                  </label>
                  <select
                    value={newResource.source}
                    onChange={(e) => setNewResource(prev => ({ ...prev, source: e.target.value as Resource['source'] }))}
                    className="select select-bordered"
                  >
                    <option value="web">Web</option>
                    <option value="google-drive">Google Drive</option>
                    <option value="google-docs">Google Docs</option>
                    <option value="google-sheets">Google Sheets</option>
                    <option value="youtube">YouTube</option>
                    <option value="local">Local File</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea textarea-bordered"
                  placeholder="Brief description of the resource"
                  rows={3}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <input
                  type="text"
                  value={newResource.tags}
                  onChange={(e) => setNewResource(prev => ({ ...prev, tags: e.target.value }))}
                  className="input input-bordered"
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResource}
                disabled={!newResource.title.trim() || !newResource.url.trim()}
                className="btn btn-primary"
              >
                Add Resource
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* AI Resource Suggestions Modal */}
      {aiResourceModal.isOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <button 
              onClick={() => setAiResourceModal(prev => ({...prev, isOpen: false}))} 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> AI Resource Suggestions
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on your current context (e.g., search term: <span className="font-semibold">"{aiResourceModal.context}"</span>), here are some AI-powered suggestions:
            </p>

            {aiResourceModal.isLoading ? (
              <div className="text-center py-10">
                <span className="loading loading-lg loading-dots"></span>
                <p className="mt-2 text-gray-500">Finding amazing resources for you...</p>
              </div>
            ) : aiResourceModal.suggestions.length > 0 ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {aiResourceModal.suggestions.map((suggestion, index) => (
                  <div key={index} className="card card-compact bg-base-200 shadow-sm">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="card-title text-sm">{suggestion.title}</h4>
                          <p className="text-xs text-gray-600 mb-1 line-clamp-2">{suggestion.description}</p>
                          <p className="text-xs text-blue-500 hover:underline break-all">
                            <a href={suggestion.url} target="_blank" rel="noopener noreferrer">{suggestion.url}</a>
                          </p>
                        </div>
                        <button 
                          className="btn btn-primary btn-xs ml-2 whitespace-nowrap"
                          onClick={() => addSuggestedResource(suggestion)}
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="badge badge-xs badge-outline capitalize">{suggestion.type}</span>
                        <span className="badge badge-xs badge-outline capitalize">{suggestion.source}</span>
                        {suggestion.tags?.map(tag => (
                          <span key={tag} className="badge badge-xs badge-ghost">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No suggestions found for this context, or AI is still thinking!</p>
              </div>
            )}
            
            <div className="modal-action mt-6">
              <button 
                className="btn btn-ghost"
                onClick={() => setAiResourceModal(prev => ({...prev, isOpen: false}))}
              >
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default ResourceManager; 