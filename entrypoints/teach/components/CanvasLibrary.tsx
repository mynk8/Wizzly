import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Folder, 
  Trash2, 
  Search, 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  Tag,
  Star,
  StarOff,
  Filter,
  Grid,
  List,
  Plus,
  Edit3,
  Copy
} from 'lucide-react';

interface CanvasItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  canvasData: any;
  subject?: string;
  gradeLevel?: string;
  viewCount: number;
  shareCount: number;
}

interface CanvasLibraryProps {
  onLoadCanvas?: (canvasData: any) => void;
  onSaveCanvas?: (canvasData: any, metadata: Partial<CanvasItem>) => void;
  currentCanvasData?: any;
}

const CanvasLibrary: React.FC<CanvasLibraryProps> = ({
  onLoadCanvas,
  onSaveCanvas,
  currentCanvasData
}) => {
  const [canvases, setCanvases] = useState<CanvasItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'recent' | 'title' | 'popular'>('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCanvas, setEditingCanvas] = useState<CanvasItem | null>(null);
  const [newCanvasData, setNewCanvasData] = useState({
    title: '',
    description: '',
    tags: '',
    subject: '',
    gradeLevel: '',
    isPublic: false
  });

  useEffect(() => {
    const mockCanvases: CanvasItem[] = [
      {
        id: '1',
        title: 'Pythagorean Theorem Explanation',
        description: 'Visual proof of the Pythagorean theorem with interactive elements',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmOWZmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NzNkYyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1hdGggRGlhZ3JhbTwvdGV4dD48L3N2Zz4=',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20'),
        tags: ['mathematics', 'geometry', 'theorem'],
        isFavorite: true,
        isPublic: true,
        canvasData: {},
        subject: 'Mathematics',
        gradeLevel: '9-12',
        viewCount: 45,
        shareCount: 12
      },
      {
        id: '2',
        title: 'Cell Structure Diagram',
        description: 'Detailed diagram of plant and animal cells with labels',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmZGY0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzE2OWY0ZCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJpb2xvZ3kgRGlhZ3JhbTwvdGV4dD48L3N2Zz4=',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18'),
        tags: ['biology', 'cells', 'anatomy'],
        isFavorite: false,
        isPublic: false,
        canvasData: {},
        subject: 'Biology',
        gradeLevel: '6-8',
        viewCount: 23,
        shareCount: 5
      },
      {
        id: '3',
        title: 'Solar System Overview',
        description: 'Interactive solar system with planet information',
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmVmM2M3Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2Q5N2QwNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFzdHJvbm9teSBEaWFncmFtPC90ZXh0Pjwvc3ZnPg==',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15'),
        tags: ['astronomy', 'space', 'planets'],
        isFavorite: true,
        isPublic: true,
        canvasData: {},
        subject: 'Science',
        gradeLevel: 'K-5',
        viewCount: 67,
        shareCount: 18
      }
    ];

    setTimeout(() => {
      setCanvases(mockCanvases);
      setIsLoading(false);
    }, 1000);
  }, []);

  const allTags = Array.from(new Set(canvases.flatMap(canvas => canvas.tags)));

  const filteredCanvases = canvases
    .filter(canvas => {
      const matchesSearch = canvas.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           canvas.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => canvas.tags.includes(tag));
      const matchesFavorites = !showFavoritesOnly || canvas.isFavorite;
      
      return matchesSearch && matchesTags && matchesFavorites;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'popular':
          return b.viewCount - a.viewCount;
        case 'recent':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

  const handleSaveCurrentCanvas = () => {
    if (!currentCanvasData) return;
    setEditingCanvas(null);
    setNewCanvasData({
      title: '',
      description: '',
      tags: '',
      subject: '',
      gradeLevel: '',
      isPublic: false
    });
    setIsModalOpen(true);
  };

  const handleEditCanvas = (canvas: CanvasItem) => {
    setEditingCanvas(canvas);
    setNewCanvasData({
      title: canvas.title,
      description: canvas.description || '',
      tags: canvas.tags.join(', '),
      subject: canvas.subject || '',
      gradeLevel: canvas.gradeLevel || '',
      isPublic: canvas.isPublic
    });
    setIsModalOpen(true);
  };

  const handleSubmitCanvas = () => {
    const canvasData = {
      ...newCanvasData,
      tags: newCanvasData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    if (editingCanvas) {
      setCanvases(prev => prev.map(canvas => 
        canvas.id === editingCanvas.id 
          ? { ...canvas, ...canvasData, updatedAt: new Date() }
          : canvas
      ));
    } else {
      const newCanvas: CanvasItem = {
        id: Date.now().toString(),
        ...canvasData,
        thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzM3NDE1MSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5ldyBDYW52YXM8L3RleHQ+PC9zdmc+',
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        canvasData: currentCanvasData,
        viewCount: 0,
        shareCount: 0
      };
      setCanvases(prev => [newCanvas, ...prev]);
      onSaveCanvas?.(currentCanvasData, canvasData);
    }

    setIsModalOpen(false);
    setEditingCanvas(null);
  };

  const handleDeleteCanvas = (canvasId: string) => {
    if (window.confirm('Are you sure you want to delete this canvas?')) {
      setCanvases(prev => prev.filter(canvas => canvas.id !== canvasId));
    }
  };

  const handleToggleFavorite = (canvasId: string) => {
    setCanvases(prev => prev.map(canvas => 
      canvas.id === canvasId 
        ? { ...canvas, isFavorite: !canvas.isFavorite }
        : canvas
    ));
  };

  const handleLoadCanvas = (canvas: CanvasItem) => {
    onLoadCanvas?.(canvas.canvasData);
    setCanvases(prev => prev.map(c => 
      c.id === canvas.id 
        ? { ...c, viewCount: c.viewCount + 1 }
        : c
    ));
  };

  const handleDuplicateCanvas = (canvas: CanvasItem) => {
    const duplicatedCanvas: CanvasItem = {
      ...canvas,
      id: Date.now().toString(),
      title: `${canvas.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      shareCount: 0,
      isFavorite: false
    };
    setCanvases(prev => [duplicatedCanvas, ...prev]);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Canvas Library</h2>
          <button
            onClick={handleSaveCurrentCanvas}
            disabled={!currentCanvasData}
            className="btn btn-primary btn-sm gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save Current
          </button>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search canvases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 input-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select select-bordered select-sm"
            >
              <option value="recent">Recent</option>
              <option value="title">Title</option>
              <option value="popular">Popular</option>
            </select>

            <div className="flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm btn-square ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`btn btn-sm btn-square ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`btn btn-sm gap-1 ${showFavoritesOnly ? 'btn-warning' : 'btn-ghost'}`}
            >
              <Star className="w-4 h-4" />
              Favorites
            </button>
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev => 
                      prev.includes(tag) 
                        ? prev.filter(t => t !== tag)
                        : [...prev, tag]
                    );
                  }}
                  className={`badge badge-sm cursor-pointer ${
                    selectedTags.includes(tag) ? 'badge-primary' : 'badge-ghost'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : filteredCanvases.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No canvases found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedTags.length > 0 || showFavoritesOnly
                ? 'Try adjusting your filters'
                : 'Start creating and saving your teaching canvases'
              }
            </p>
            {currentCanvasData && (
              <button
                onClick={handleSaveCurrentCanvas}
                className="btn btn-primary gap-2"
              >
                <Plus className="w-4 h-4" />
                Save Current Canvas
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredCanvases.map(canvas => (
              <div
                key={canvas.id}
                className={`card bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${
                  viewMode === 'list' ? 'card-side' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <figure className="relative">
                      <img
                        src={canvas.thumbnail}
                        alt={canvas.title}
                        className="w-full h-32 object-cover"
                      />
                      <button
                        onClick={() => handleToggleFavorite(canvas.id)}
                        className="absolute top-2 right-2 btn btn-circle btn-sm btn-ghost bg-white/80 hover:bg-white"
                      >
                        {canvas.isFavorite ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                    </figure>
                    <div className="card-body p-4">
                      <h3 className="card-title text-sm">{canvas.title}</h3>
                      {canvas.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{canvas.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {canvas.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="badge badge-xs badge-ghost">{tag}</span>
                        ))}
                        {canvas.tags.length > 2 && (
                          <span className="badge badge-xs badge-ghost">+{canvas.tags.length - 2}</span>
                        )}
                      </div>
                      <div className="card-actions justify-between items-center mt-3">
                        <div className="text-xs text-gray-500">
                          {canvas.viewCount} views
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleLoadCanvas(canvas)}
                            className="btn btn-primary btn-xs"
                            title="Load Canvas"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          <div className="dropdown dropdown-end">
                            <button tabIndex={0} className="btn btn-ghost btn-xs">⋯</button>
                            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40 z-10">
                              <li><a onClick={() => handleEditCanvas(canvas)}><Edit3 className="w-4 h-4" />Edit</a></li>
                              <li><a onClick={() => handleDuplicateCanvas(canvas)}><Copy className="w-4 h-4" />Duplicate</a></li>
                              <li><a><Share2 className="w-4 h-4" />Share</a></li>
                              <li><a><Download className="w-4 h-4" />Export</a></li>
                              <li><a onClick={() => handleDeleteCanvas(canvas.id)} className="text-error"><Trash2 className="w-4 h-4" />Delete</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <figure className="w-24 h-16">
                      <img
                        src={canvas.thumbnail}
                        alt={canvas.title}
                        className="w-full h-full object-cover rounded-l-lg"
                      />
                    </figure>
                    <div className="card-body p-3 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{canvas.title}</h3>
                          <p className="text-xs text-gray-600 mt-1">{canvas.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                            <span>{canvas.viewCount} views</span>
                            <span>•</span>
                            <span>{canvas.updatedAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleToggleFavorite(canvas.id)}
                            className="btn btn-ghost btn-xs btn-square"
                          >
                            {canvas.isFavorite ? (
                              <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            ) : (
                              <StarOff className="w-3 h-3" />
                            )}
                          </button>
                          <button
                            onClick={() => handleLoadCanvas(canvas)}
                            className="btn btn-primary btn-xs"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <dialog open className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCanvas ? 'Edit Canvas' : 'Save Canvas'}
            </h3>
            
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title *</span>
                </label>
                <input
                  type="text"
                  value={newCanvasData.title}
                  onChange={(e) => setNewCanvasData(prev => ({ ...prev, title: e.target.value }))}
                  className="input input-bordered"
                  placeholder="Enter canvas title"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  value={newCanvasData.description}
                  onChange={(e) => setNewCanvasData(prev => ({ ...prev, description: e.target.value }))}
                  className="textarea textarea-bordered"
                  placeholder="Describe your canvas"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Subject</span>
                  </label>
                  <select
                    value={newCanvasData.subject}
                    onChange={(e) => setNewCanvasData(prev => ({ ...prev, subject: e.target.value }))}
                    className="select select-bordered"
                  >
                    <option value="">Select subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Biology">Biology</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Physics">Physics</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Language Arts">Language Arts</option>
                    <option value="Art">Art</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Grade Level</span>
                  </label>
                  <select
                    value={newCanvasData.gradeLevel}
                    onChange={(e) => setNewCanvasData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    className="select select-bordered"
                  >
                    <option value="">Select grade</option>
                    <option value="K-2">K-2</option>
                    <option value="3-5">3-5</option>
                    <option value="6-8">6-8</option>
                    <option value="9-12">9-12</option>
                    <option value="College">College</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Tags</span>
                </label>
                <input
                  type="text"
                  value={newCanvasData.tags}
                  onChange={(e) => setNewCanvasData(prev => ({ ...prev, tags: e.target.value }))}
                  className="input input-bordered"
                  placeholder="Enter tags separated by commas"
                />
              </div>

              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text">Make this canvas public</span>
                  <input
                    type="checkbox"
                    checked={newCanvasData.isPublic}
                    onChange={(e) => setNewCanvasData(prev => ({ ...prev, isPublic: e.target.checked }))}
                    className="checkbox checkbox-primary"
                  />
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCanvas}
                disabled={!newCanvasData.title.trim()}
                className="btn btn-primary"
              >
                {editingCanvas ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default CanvasLibrary;