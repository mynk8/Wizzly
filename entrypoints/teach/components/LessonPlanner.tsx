import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Clock,
  Users,
  Target,
  CheckCircle,
  Circle,
  ArrowUp,
  ArrowDown,
  Save,
  FileText,
  BookOpen,
  Calendar,
  AlertCircle,
  Lightbulb,
  GraduationCap,
  UserCheck,
  UserX,
  UserPlus,
  ClipboardList,
  Sparkles,
  Wand2,
  ExternalLink
} from 'lucide-react';
import { useAIService } from '@/entrypoints/hooks/use-ai-service';
import useStore from '@/entrypoints/store/store';

interface LessonPlannerProps {
  editor?: any;
}

interface LessonObjective {
  id: string;
  text: string;
  completed: boolean;
}

interface LessonActivity {
  id: string;
  title: string;
  description: string;
  duration: number;
  type: 'introduction' | 'instruction' | 'activity' | 'assessment' | 'wrap-up';
  resources: string[];
  notes: string;
}

interface Student {
  id: string;
  name: string;
  present: boolean;
  late?: boolean;
  excused?: boolean;
  notes?: string;
}

interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number;
  date: Date;
  objectives: LessonObjective[];
  activities: LessonActivity[];
  materials: string[];
  homework: string;
  notes: string;
  tags: string[];
  students: Student[];
}

interface AiModalState {
  isOpen: boolean;
  type: 'lessonPlan' | 'objective' | null;
  objectiveId?: string;
  objectiveText?: string;
}

const LessonPlanner: React.FC<LessonPlannerProps> = ({ editor }) => {
  const { geminiApiKey, setAppContext } = useStore();
  const aiService = useAIService({ 
    apiKey: geminiApiKey || '', 
    context: 'lesson-planner' 
  });

  const [currentLesson, setCurrentLesson] = useState<LessonPlan>({
    id: '',
    title: '',
    subject: '',
    gradeLevel: '',
    duration: 45,
    date: new Date(),
    objectives: [],
    activities: [],
    materials: [],
    homework: '',
    notes: '',
    tags: [],
    students: []
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'objectives' | 'activities' | 'materials' | 'attendance'>('overview');
  const [aiModalState, setAiModalState] = useState<AiModalState>({ isOpen: false, type: null });
  const [aiLessonPlanForm, setAiLessonPlanForm] = useState({ topic: '', grade: '', duration: '45' });
  const [aiObjectiveForm, setAiObjectiveForm] = useState({ originalText: '', refinedText: ''});

  // Set context when component mounts
  useEffect(() => {
    setAppContext('lesson-planner');
  }, [setAppContext]);

  useEffect(() => {
    const saved = localStorage.getItem('currentLessonPlan');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrentLesson({
        ...parsed,
        date: new Date(parsed.date),
        students: parsed.students || [] // Ensure students array exists
      });
    } else {
      setCurrentLesson(prev => ({
        ...prev,
        id: crypto.randomUUID(),
        title: `Lesson - ${new Date().toLocaleDateString()}`
      }));
      setIsEditing(true);
    }
  }, []);

  useEffect(() => {
    if (currentLesson.id) {
      localStorage.setItem('currentLessonPlan', JSON.stringify(currentLesson));
    }
  }, [currentLesson]);

  const addObjective = () => {
    const newObjective: LessonObjective = {
      id: crypto.randomUUID(),
      text: '',
      completed: false
    };
    setCurrentLesson(prev => ({
      ...prev,
      objectives: [...prev.objectives, newObjective]
    }));
  };

  const updateObjective = (id: string, text: string) => {
    setCurrentLesson(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj => 
        obj.id === id ? { ...obj, text } : obj
      )
    }));
  };

  const toggleObjective = (id: string) => {
    setCurrentLesson(prev => ({
      ...prev,
      objectives: prev.objectives.map(obj => 
        obj.id === id ? { ...obj, completed: !obj.completed } : obj
      )
    }));
  };

  const removeObjective = (id: string) => {
    setCurrentLesson(prev => ({
      ...prev,
      objectives: prev.objectives.filter(obj => obj.id !== id)
    }));
  };

  const addActivity = () => {
    const newActivity: LessonActivity = {
      id: crypto.randomUUID(),
      title: '',
      description: '',
      duration: 10,
      type: 'instruction',
      resources: [],
      notes: ''
    };
    setCurrentLesson(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity]
    }));
  };

  const updateActivity = (id: string, updates: Partial<LessonActivity>) => {
    setCurrentLesson(prev => ({
      ...prev,
      activities: prev.activities.map(activity => 
        activity.id === id ? { ...activity, ...updates } : activity
      )
    }));
  };

  const removeActivity = (id: string) => {
    setCurrentLesson(prev => ({
      ...prev,
      activities: prev.activities.filter(activity => activity.id !== id)
    }));
  };

  const moveActivity = (id: string, direction: 'up' | 'down') => {
    setCurrentLesson(prev => {
      const activities = [...prev.activities];
      const index = activities.findIndex(a => a.id === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= activities.length) return prev;

      [activities[index], activities[newIndex]] = [activities[newIndex], activities[index]];
      
      return { ...prev, activities };
    });
  };

  const getActivityTypeColor = (type: LessonActivity['type']) => {
    switch (type) {
      case 'introduction': return 'badge-info';
      case 'instruction': return 'badge-primary';
      case 'activity': return 'badge-success';
      case 'assessment': return 'badge-warning';
      case 'wrap-up': return 'badge-secondary';
      default: return 'badge-ghost';
    }
  };

  const getActivityTypeIcon = (type: LessonActivity['type']) => {
    switch (type) {
      case 'introduction': return <Lightbulb className="w-4 h-4" />;
      case 'instruction': return <BookOpen className="w-4 h-4" />;
      case 'activity': return <Users className="w-4 h-4" />;
      case 'assessment': return <CheckCircle className="w-4 h-4" />;
      case 'wrap-up': return <GraduationCap className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const addStudent = () => {
    const name = prompt('Enter student name:');
    const trimmedName = name?.trim();
    if (!trimmedName) return;

    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: trimmedName,
      present: false
    };

    setCurrentLesson(prev => ({
      ...prev,
      students: [...prev.students, newStudent]
    }));
  };

  const updateStudentAttendance = (id: string, updates: Partial<Student>) => {
    setCurrentLesson(prev => ({
      ...prev,
      students: prev.students.map(student => 
        student.id === id ? { ...student, ...updates } : student
      )
    }));
  };

  const removeStudent = (id: string) => {
    if (window.confirm('Remove this student from the class list?')) {
      setCurrentLesson(prev => ({
        ...prev,
        students: prev.students.filter(student => student.id !== id)
      }));
    }
  };

  const getAttendanceStats = () => {
    if (!currentLesson.students || currentLesson.students.length === 0) {
      return { present: 0, absent: 0, late: 0, excused: 0, total: 0, rate: 0 };
    }
    
    const present = currentLesson.students.filter(s => s.present && !s.late).length;
    const late = currentLesson.students.filter(s => s.present && s.late).length;
    const excused = currentLesson.students.filter(s => !s.present && s.excused).length;
    const absent = currentLesson.students.filter(s => !s.present && !s.excused).length;
    const total = currentLesson.students.length;
    const rate = Math.round(((present + late) / total) * 100);
    
    return { present, late, excused, absent, total, rate };
  };

  const totalDuration = currentLesson.activities.reduce((sum, activity) => sum + activity.duration, 0);

  const handleGenerateLessonPlanAI = async () => {
    if (!geminiApiKey) {
      alert('Please set your Gemini API key first.');
      return;
    }

    try {
      const result = await aiService.generateLessonPlan(
        aiLessonPlanForm.topic,
        aiLessonPlanForm.grade,
        parseInt(aiLessonPlanForm.duration) || 45
      );

      if ('error' in result) {
        alert(`Error generating lesson plan: ${result.error}`);
        return;
      }

      // Convert AI response to lesson plan format
      const aiObjectives: LessonObjective[] = result.objectives.map(text => ({
        id: crypto.randomUUID(),
        text,
        completed: false
      }));

      const aiActivities: LessonActivity[] = result.activities.map(activity => ({
        id: crypto.randomUUID(),
        title: activity.title,
        description: activity.description,
        duration: activity.duration,
        type: activity.type,
        resources: [],
        notes: 'Generated by AI'
      }));

    setCurrentLesson(prev => ({
      ...prev,
        title: result.title,
      subject: prev.subject || aiLessonPlanForm.topic,
      gradeLevel: prev.gradeLevel || aiLessonPlanForm.grade,
      duration: parseInt(aiLessonPlanForm.duration) || prev.duration,
        objectives: aiObjectives,
        activities: aiActivities,
        materials: result.materials,
        notes: `${prev.notes}\n\n${result.notes}`
    }));

    setAiModalState({ isOpen: false, type: null });
      alert('AI Lesson Plan Generated Successfully!');
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      alert('Failed to generate lesson plan. Please try again.');
    }
  };

  const handleRefineObjectiveAI = async (objectiveId: string, currentText: string) => {
    if (!geminiApiKey) {
      alert('Please set your Gemini API key first.');
      return;
    }

    setAiObjectiveForm({ originalText: currentText, refinedText: '' });
    setAiModalState({ isOpen: true, type: 'objective', objectiveId, objectiveText: currentText });

    try {
      const result = await aiService.refineObjective(
        currentText,
        currentLesson.gradeLevel,
        currentLesson.subject
      );

      if ('error' in result) {
        alert(`Error refining objective: ${result.error}`);
        setAiModalState({ isOpen: false, type: null });
        return;
      }

      setAiObjectiveForm({ 
        originalText: currentText, 
        refinedText: result.refined 
      });
    } catch (error) {
      console.error('Error refining objective:', error);
      alert('Failed to refine objective. Please try again.');
      setAiModalState({ isOpen: false, type: null });
    }
  };
  
  const applyRefinedObjective = () => {
    if (aiModalState.objectiveId && aiObjectiveForm.refinedText) {
      updateObjective(aiModalState.objectiveId, aiObjectiveForm.refinedText);
    }
    setAiModalState({ isOpen: false, type: null });
  };

  // Show API key warning
  const showApiKeyWarning = !geminiApiKey;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-2 sm:p-3 lg:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={currentLesson.title}
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, title: e.target.value }))}
                  className="input input-bordered w-full text-sm sm:text-base lg:text-lg font-semibold h-8 sm:h-10"
                  placeholder="Lesson Title"
                />
              ) : (
                <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate leading-tight">
                  {currentLesson.title || 'Untitled Lesson'}
                </h1>
              )}
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0">
              <button
                onClick={() => setAiModalState({ isOpen: true, type: 'lessonPlan' })}
                className="btn btn-accent btn-xs sm:btn-sm gap-1 text-xs min-h-8 h-8 px-2 sm:px-3"
                title="Generate Lesson Plan with AI"
              >
                <Sparkles className="w-3 h-3" />
                <span className="hidden sm:inline">AI</span>
              </button>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-ghost btn-xs sm:btn-sm gap-1 text-xs min-h-8 h-8 px-2 sm:px-3"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
              </button>
              <button className="btn btn-primary btn-xs sm:btn-sm gap-1 text-xs min-h-8 h-8 px-2 sm:px-3">
                <Save className="w-3 h-3" />
                <span className="hidden sm:inline">Save</span>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 sm:p-4 border border-blue-100">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-2 grid-rows-2">
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subject</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={currentLesson.subject}
                    onChange={(e) => setCurrentLesson(prev => ({ ...prev, subject: e.target.value }))}
                    className="input input-bordered input-sm w-full text-sm font-medium"
                    placeholder="Enter subject"
                  />
                ) : (
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {currentLesson.subject || 'Not specified'}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Grade Level</span>
                </div>
                {isEditing ? (
                  <select
                    value={currentLesson.gradeLevel}
                    onChange={(e) => setCurrentLesson(prev => ({ ...prev, gradeLevel: e.target.value }))}
                    className="select select-bordered select-sm w-full text-sm font-medium"
                  >
                    <option value="">Select grade</option>
                    <option value="K-2">K-2</option>
                    <option value="3-5">3-5</option>
                    <option value="6-8">6-8</option>
                    <option value="9-12">9-12</option>
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-gray-900">
                    {currentLesson.gradeLevel || 'Not specified'}
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Duration</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-lg font-bold text-gray-900">{totalDuration}</p>
                  <span className="text-xs text-gray-500">minutes</span>
                </div>
                {totalDuration !== currentLesson.duration && (
                  <p className="text-xs text-orange-600 mt-1">
                    Planned: {currentLesson.duration}min
                  </p>
                )}
              </div>

              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date</span>
                </div>
                {isEditing ? (
                  <input
                    type="date"
                    value={currentLesson.date.toISOString().split('T')[0]}
                    onChange={(e) => setCurrentLesson(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    className="input input-bordered input-sm w-full text-sm font-medium"
                  />
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {currentLesson.date.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {currentLesson.date.getFullYear()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="tabs tabs-boxed overflow-x-auto bg-gray-100 p-1">
            <div className="flex gap-0.5 min-w-max">
              <button 
                className={`tab tab-xs sm:tab-sm lg:tab-md whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${activeSection === 'overview' ? 'tab-active' : ''}`}
                onClick={() => setActiveSection('overview')}
              >
                Overview
              </button>
              <button 
                className={`tab tab-xs sm:tab-sm lg:tab-md whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${activeSection === 'objectives' ? 'tab-active' : ''}`}
                onClick={() => setActiveSection('objectives')}
              >
                <span className="hidden sm:inline">Objectives</span>
                <span className="sm:hidden">Obj</span>
                <span className="ml-0.5 sm:ml-1">({currentLesson.objectives.length})</span>
              </button>
              <button 
                className={`tab tab-xs sm:tab-sm lg:tab-md whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${activeSection === 'activities' ? 'tab-active' : ''}`}
                onClick={() => setActiveSection('activities')}
              >
                <span className="hidden sm:inline">Activities</span>
                <span className="sm:hidden">Act</span>
                <span className="ml-0.5 sm:ml-1">({currentLesson.activities.length})</span>
              </button>
              <button 
                className={`tab tab-xs sm:tab-sm lg:tab-md whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${activeSection === 'materials' ? 'tab-active' : ''}`}
                onClick={() => setActiveSection('materials')}
              >
                <span className="hidden sm:inline">Materials</span>
                <span className="sm:hidden">Mat</span>
              </button>
              <button 
                className={`tab tab-xs sm:tab-sm lg:tab-md whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${activeSection === 'attendance' ? 'tab-active' : ''}`}
                onClick={() => setActiveSection('attendance')}
              >
                <span className="hidden sm:inline">Attendance</span>
                <span className="sm:hidden">Att</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Warning */}
      {showApiKeyWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Gemini API Key Required:</strong> Please set your Gemini API key to use AI-powered lesson planning features.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto p-2 sm:p-3 lg:p-4">
        {activeSection === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Lesson Notes</h3>
                <textarea
                  value={currentLesson.notes}
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add general notes about this lesson..."
                  className="textarea textarea-bordered w-full h-24 sm:h-32 text-sm"
                  readOnly={!isEditing}
                />
              </div>
            </div>

            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Homework Assignment</h3>
                <textarea
                  value={currentLesson.homework}
                  onChange={(e) => setCurrentLesson(prev => ({ ...prev, homework: e.target.value }))}
                  placeholder="Describe homework assignment..."
                  className="textarea textarea-bordered w-full h-20 sm:h-24 text-sm"
                  readOnly={!isEditing}
                />
              </div>
            </div>

            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {currentLesson.tags.map((tag, index) => (
                    <div key={index} className="badge badge-outline gap-1 sm:gap-2 text-xs">
                      {tag}
                      {isEditing && (
                        <button
                          onClick={() => {
                            setCurrentLesson(prev => ({
                              ...prev,
                              tags: prev.tags.filter((_, i) => i !== index)
                            }));
                          }}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && (
                    <button
                      onClick={() => {
                        const tag = prompt('Enter tag:');
                        if (tag) {
                          setCurrentLesson(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }));
                        }
                      }}
                      className="badge badge-outline badge-primary gap-1 sm:gap-2 text-xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden xs:inline">Add Tag</span>
                      <span className="xs:hidden">+</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'objectives' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold">Learning Objectives</h3>
              {isEditing && (
                <button
                  onClick={addObjective}
                  className="btn btn-primary btn-sm gap-2 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Objective
                </button>
              )}
            </div>

            <div className="space-y-3">
              {currentLesson.objectives.map((objective, index) => (
                <div key={objective.id} className="card bg-white shadow-sm border border-gray-200">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleObjective(objective.id)}
                        className="btn btn-ghost btn-sm btn-circle mt-1 flex-shrink-0"
                        disabled={!isEditing}
                      >
                        {objective.completed ? (
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="badge badge-sm badge-outline">#{index + 1}</span>
                          <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        </div>
                        {isEditing ? (
                          <textarea
                            value={objective.text}
                            onChange={(e) => updateObjective(objective.id, e.target.value)}
                            placeholder="Students will be able to..."
                            className="textarea textarea-bordered w-full text-sm"
                            rows={2}
                          />
                        ) : (
                          <p className={`text-sm ${objective.completed ? 'line-through text-gray-500' : ''}`}>
                            {objective.text || 'No objective text'}
                          </p>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleRefineObjectiveAI(objective.id, objective.text)}
                            className="btn btn-ghost btn-xs btn-square text-accent"
                            title="Refine with AI"
                          >
                            <Wand2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => removeObjective(objective.id)}
                            className="btn btn-ghost btn-xs btn-square text-red-500"
                            title="Delete Objective"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {currentLesson.objectives.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">No learning objectives yet</p>
                  {isEditing && (
                    <button
                      onClick={addObjective}
                      className="btn btn-primary btn-sm mt-3 gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Objective
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'activities' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold">Lesson Activities</h3>
              {isEditing && (
                <button
                  onClick={addActivity}
                  className="btn btn-primary btn-sm gap-2 w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Activity
                </button>
              )}
            </div>

            <div className="space-y-3">
              {currentLesson.activities.map((activity, index) => (
                <div key={activity.id} className="card bg-white shadow-sm border border-gray-200">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <span className="badge badge-sm badge-outline">#{index + 1}</span>
                        {isEditing && (
                          <div className="flex flex-col gap-1">
                            {index > 0 && (
                              <button
                                onClick={() => moveActivity(activity.id, 'up')}
                                className="btn btn-ghost btn-xs btn-square"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                            )}
                            {index < currentLesson.activities.length - 1 && (
                              <button
                                onClick={() => moveActivity(activity.id, 'down')}
                                className="btn btn-ghost btn-xs btn-square"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <div className={`badge ${getActivityTypeColor(activity.type)} gap-1 sm:gap-2 text-xs`}>
                            {getActivityTypeIcon(activity.type)}
                            <span className="capitalize">{activity.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            {activity.duration} min
                          </div>
                        </div>

                        {isEditing ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={activity.title}
                              onChange={(e) => updateActivity(activity.id, { title: e.target.value })}
                              placeholder="Activity title"
                              className="input input-bordered w-full text-sm"
                            />
                            <textarea
                              value={activity.description}
                              onChange={(e) => updateActivity(activity.id, { description: e.target.value })}
                              placeholder="Activity description"
                              className="textarea textarea-bordered w-full text-sm"
                              rows={3}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <select
                                value={activity.type}
                                onChange={(e) => updateActivity(activity.id, { type: e.target.value as LessonActivity['type'] })}
                                className="select select-bordered select-sm"
                              >
                                <option value="introduction">Introduction</option>
                                <option value="instruction">Instruction</option>
                                <option value="activity">Activity</option>
                                <option value="assessment">Assessment</option>
                                <option value="wrap-up">Wrap-up</option>
                              </select>
                              <input
                                type="number"
                                value={activity.duration}
                                onChange={(e) => {
                                  const value = e.target.value.trim();
                                  if (value === '') {
                                    // Keep the current duration when input is cleared
                                    return;
                                  }
                                  const parsedValue = parseInt(value, 10);
                                  if (!isNaN(parsedValue) && parsedValue > 0) {
                                    updateActivity(activity.id, { duration: parsedValue });
                                  }
                                }}
                                placeholder="Duration (min)"
                                className="input input-bordered input-sm"
                                min="1"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm sm:text-base">{activity.title || 'Untitled Activity'}</h4>
                            {activity.description && (
                              <p className="text-gray-600 text-xs sm:text-sm">{activity.description}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <button
                          onClick={() => removeActivity(activity.id)}
                          className="btn btn-ghost btn-sm btn-circle text-red-500 flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {currentLesson.activities.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">No activities planned yet</p>
                  {isEditing && (
                    <button
                      onClick={addActivity}
                      className="btn btn-primary btn-sm mt-3 gap-2 w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Add First Activity
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Duration Summary */}
            {currentLesson.activities.length > 0 && (
              <div className="card bg-blue-50 border border-blue-200">
                <div className="card-body p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="font-medium text-sm sm:text-base">Total Duration</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-bold text-blue-600">{totalDuration} minutes</div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        {totalDuration > currentLesson.duration && (
                          <span className="text-red-500">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            {totalDuration - currentLesson.duration} min over planned duration
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'materials' && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Materials & Resources</h3>
            
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-3 sm:p-4">
                <h4 className="font-medium mb-3 text-sm sm:text-base">Required Materials</h4>
                <textarea
                  value={currentLesson.materials.join('\n')}
                  onChange={(e) => setCurrentLesson(prev => ({
                    ...prev,
                    materials: e.target.value.split('\n').filter(Boolean)
                  }))}
                  placeholder="List materials needed for this lesson (one per line)..."
                  className="textarea textarea-bordered w-full h-24 sm:h-32 text-sm"
                  readOnly={!isEditing}
                />
              </div>
            </div>

            <div className="text-center py-6 sm:py-8 text-gray-500">
              <FileText className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm sm:text-base">Resource management coming soon</p>
              <p className="text-xs sm:text-sm">Add Google Drive links, PDFs, worksheets, and more</p>
            </div>
          </div>
        )}

        {activeSection === 'attendance' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-semibold">Class Attendance</h3>
              {isEditing && (
                <button
                  onClick={addStudent}
                  className="btn btn-primary btn-sm gap-2 w-full sm:w-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </button>
              )}
            </div>

            {/* Attendance Stats */}
            {currentLesson.students && currentLesson.students.length > 0 && (
              <div className="card bg-blue-50 border border-blue-200">
                <div className="card-body p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      <span className="font-medium text-sm sm:text-base">Attendance Summary</span>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-lg font-bold text-blue-600">{getAttendanceStats().rate}%</div>
                      <div className="text-xs sm:text-sm text-gray-600">Attendance Rate</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      <span>Present: {getAttendanceStats().present}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                      <span>Late: {getAttendanceStats().late}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserX className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      <span>Absent: {getAttendanceStats().absent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                      <span>Excused: {getAttendanceStats().excused}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Student List */}
            <div className="space-y-3">
              {currentLesson.students && currentLesson.students.map((student) => (
                <div key={student.id} className="card bg-white shadow-sm border border-gray-200">
                  <div className="card-body p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateStudentAttendance(student.id, { 
                            present: !student.present,
                            late: false,
                            excused: false
                          })}
                          className={`btn btn-sm btn-circle ${
                            student.present ? 'btn-success' : 'btn-ghost'
                          }`}
                          disabled={!isEditing}
                        >
                          {student.present ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm sm:text-base truncate">{student.name}</h4>
                        <div className="flex gap-2 mt-1">
                          {student.present && student.late && (
                            <span className="badge badge-xs badge-warning">Late</span>
                          )}
                          {!student.present && student.excused && (
                            <span className="badge badge-xs badge-info">Excused</span>
                          )}
                          {!student.present && !student.excused && (
                            <span className="badge badge-xs badge-error">Absent</span>
                          )}
                        </div>
                      </div>

                      {isEditing && (
                        <div className="flex flex-col sm:flex-row gap-1 flex-shrink-0">
                          {student.present && (
                            <button
                              onClick={() => updateStudentAttendance(student.id, { late: !student.late })}
                              className={`btn btn-xs ${student.late ? 'btn-warning' : 'btn-ghost'}`}
                            >
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline ml-1">{student.late ? 'On Time' : 'Late'}</span>
                            </button>
                          )}

                          {!student.present && (
                            <button
                              onClick={() => updateStudentAttendance(student.id, { excused: !student.excused })}
                              className={`btn btn-xs ${student.excused ? 'btn-info' : 'btn-ghost'}`}
                            >
                              <FileText className="w-3 h-3" />
                              <span className="hidden sm:inline ml-1">{student.excused ? 'Unexcused' : 'Excused'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => removeStudent(student.id)}
                            className="btn btn-ghost btn-xs btn-circle text-red-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {(!currentLesson.students || currentLesson.students.length === 0) && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm sm:text-base">No students added yet</p>
                  {isEditing && (
                    <button
                      onClick={addStudent}
                      className="btn btn-primary btn-sm mt-3 gap-2 w-full sm:w-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add First Student
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Modals - Mobile Optimized */}
      {aiModalState.isOpen && aiModalState.type === 'lessonPlan' && (
        <dialog open className="modal modal-open">
          <div className="modal-box w-11/12 max-w-lg mx-4">
            <button onClick={() => setAiModalState({isOpen: false, type: null})} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-accent" /> AI Lesson Plan Generator
            </h3>
            <div className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Topic/Subject</span></label>
                <input type="text" placeholder="e.g., Photosynthesis, WW2 Causes" className="input input-bordered input-sm" 
                       value={aiLessonPlanForm.topic} onChange={(e) => setAiLessonPlanForm(p => ({...p, topic: e.target.value}))} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Grade Level</span></label>
                <input type="text" placeholder="e.g., 7th Grade, K-2, High School" className="input input-bordered input-sm" 
                       value={aiLessonPlanForm.grade} onChange={(e) => setAiLessonPlanForm(p => ({...p, grade: e.target.value}))} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-sm">Desired Duration (minutes)</span></label>
                <input type="number" placeholder="e.g., 45" className="input input-bordered input-sm" 
                       value={aiLessonPlanForm.duration} onChange={(e) => setAiLessonPlanForm(p => ({...p, duration: e.target.value}))} />
              </div>
            </div>
            <div className="modal-action mt-6 flex-col sm:flex-row gap-2">
              <button className="btn btn-ghost btn-sm w-full sm:w-auto" onClick={() => setAiModalState({isOpen: false, type: null})}>Cancel</button>
              <button className="btn btn-accent btn-sm w-full sm:w-auto" onClick={handleGenerateLessonPlanAI} 
                      disabled={!aiLessonPlanForm.topic || !aiLessonPlanForm.grade || !aiLessonPlanForm.duration}>
                <Sparkles className="w-4 h-4" /> Generate Draft
              </button>
            </div>
          </div>
        </dialog>
      )}

      {aiModalState.isOpen && aiModalState.type === 'objective' && (
        <dialog open className="modal modal-open">
          <div className="modal-box w-11/12 max-w-xl mx-4">
          <button onClick={() => setAiModalState({isOpen: false, type: null})} className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
            <h3 className="font-bold text-base sm:text-lg mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-accent" /> AI Objective Refiner
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label"><span className="label-text font-medium text-sm">Original Objective:</span></label>
                <p className="p-3 bg-base-200 rounded-md text-xs sm:text-sm">{aiObjectiveForm.originalText || aiModalState.objectiveText || 'Loading objective...'}</p>
              </div>
              <div>
                <label className="label"><span className="label-text font-medium text-sm">AI Suggestion:</span></label>
                {aiObjectiveForm.refinedText ? (
                  <p className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs sm:text-sm text-blue-700">
                    {aiObjectiveForm.refinedText}
                  </p>
                ) : (
                  <div className="p-3 bg-base-200 rounded-md text-xs sm:text-sm flex items-center justify-center min-h-[60px]">
                    <span className="loading loading-dots loading-md"></span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-action mt-6 flex-col sm:flex-row gap-2">
              <button className="btn btn-ghost btn-sm w-full sm:w-auto" onClick={() => setAiModalState({isOpen: false, type: null})}>Cancel</button>
              <button className="btn btn-accent btn-sm w-full sm:w-auto" onClick={applyRefinedObjective} 
                      disabled={!aiObjectiveForm.refinedText}>
                <CheckCircle className="w-4 h-4" /> Apply Refinement
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default LessonPlanner; 