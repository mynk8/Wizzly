import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  Search,
  Filter,
  Eye,
  Copy,
  Trash2,
  Edit3,
  Star,
  StarOff,
  Play,
  RotateCcw,
  FileText,
  Tag,
  ChevronDown,
  ChevronRight,
  Target,
  CheckCircle,
  Circle,
  BarChart3,
  TrendingUp,
  UserCheck,
  UserX,
  UserPlus,
  ClipboardList,
  Percent
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  present: boolean;
  late?: boolean;
  excused?: boolean;
  notes?: string;
}

interface HistoryLesson {
  id: string;
  title: string;
  subject: string;
  gradeLevel: string;
  date: Date;
  duration: number;
  actualDuration?: number;
  status: 'completed' | 'in-progress' | 'cancelled';
  canvasData?: any;
  objectives: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  activities: Array<{
    id: string;
    title: string;
    duration: number;
    completed: boolean;
  }>;
  notes: string;
  homework: string;
  tags: string[];
  isFavorite: boolean;
  attendance: Student[];
  attendanceRate?: number;
  reflection?: string;
}

const LessonHistory: React.FC = () => {
  const [lessons, setLessons] = useState<HistoryLesson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'attendance'>('date');
  const [expandedLesson, setExpandedLesson] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    const saved = localStorage.getItem('lessonHistory');
    if (saved) {
      const parsed = JSON.parse(saved);
      setLessons(parsed.map((lesson: any) => ({
        ...lesson,
        date: new Date(lesson.date),
        attendance: lesson.attendance || []
      })));
    } else {
      const sampleLessons: HistoryLesson[] = [
        {
          id: '1',
          title: 'Introduction to Algebra',
          subject: 'Mathematics',
          gradeLevel: '9-12',
          date: new Date('2024-01-15'),
          duration: 45,
          actualDuration: 48,
          status: 'completed',
          objectives: [
            { id: '1', text: 'Understand basic algebraic expressions', completed: true },
            { id: '2', text: 'Solve simple linear equations', completed: true },
            { id: '3', text: 'Apply algebra to word problems', completed: false }
          ],
          activities: [
            { id: '1', title: 'Warm-up review', duration: 5, completed: true },
            { id: '2', title: 'Algebraic expressions lesson', duration: 20, completed: true },
            { id: '3', title: 'Practice problems', duration: 15, completed: true },
            { id: '4', title: 'Group work', duration: 5, completed: false }
          ],
          notes: 'Students struggled with word problems. Need more practice next time.',
          homework: 'Complete worksheet pages 15-17',
          tags: ['algebra', 'introduction', 'equations'],
          isFavorite: true,
          attendance: [
            { id: '1', name: 'Alice Johnson', present: true },
            { id: '2', name: 'Bob Smith', present: true },
            { id: '3', name: 'Carol Davis', present: false, excused: true },
            { id: '4', name: 'David Wilson', present: true, late: true },
            { id: '5', name: 'Emma Brown', present: true }
          ],
          attendanceRate: 80,
          reflection: 'Good lesson overall, but need to spend more time on word problems.'
        },
        {
          id: '2',
          title: 'Cell Structure and Function',
          subject: 'Biology',
          gradeLevel: '6-8',
          date: new Date('2024-01-12'),
          duration: 50,
          actualDuration: 52,
          status: 'completed',
          objectives: [
            { id: '1', text: 'Identify parts of a cell', completed: true },
            { id: '2', text: 'Explain cell functions', completed: true }
          ],
          activities: [
            { id: '1', title: 'Cell diagram activity', duration: 25, completed: true },
            { id: '2', title: 'Microscope lab', duration: 25, completed: true }
          ],
          notes: 'Great engagement with microscope lab. Students loved seeing real cells.',
          homework: 'Read chapter 3, complete cell diagram',
          tags: ['biology', 'cells', 'lab'],
          isFavorite: false,
          attendance: [
            { id: '1', name: 'Alex Chen', present: true },
            { id: '2', name: 'Maya Patel', present: true },
            { id: '3', name: 'Jake Miller', present: false },
            { id: '4', name: 'Sophie Lee', present: true }
          ],
          attendanceRate: 75,
          reflection: 'Excellent lesson! The hands-on approach really worked.'
        },
        {
          id: '3',
          title: 'Solar System Exploration',
          subject: 'Science',
          gradeLevel: 'K-5',
          date: new Date('2024-01-10'),
          duration: 40,
          actualDuration: 35,
          status: 'completed',
          objectives: [
            { id: '1', text: 'Name the planets in order', completed: true },
            { id: '2', text: 'Describe planet characteristics', completed: true }
          ],
          activities: [
            { id: '1', title: 'Planet song', duration: 10, completed: true },
            { id: '2', title: 'Planet facts presentation', duration: 20, completed: true },
            { id: '3', title: 'Drawing activity', duration: 10, completed: true }
          ],
          notes: 'Kids loved the planet song! Very engaged throughout.',
          homework: 'Draw your favorite planet with 3 facts',
          tags: ['astronomy', 'planets', 'elementary'],
          isFavorite: true,
          attendance: [
            { id: '1', name: 'Lily Zhang', present: true },
            { id: '2', name: 'Noah Garcia', present: true },
            { id: '3', name: 'Zoe Taylor', present: true },
            { id: '4', name: 'Ethan Kim', present: false, excused: true }
          ],
          attendanceRate: 75,
          reflection: 'Great lesson! The planet song was a hit.'
        }
      ];
      setLessons(sampleLessons);
    }
  }, []);

  useEffect(() => {
    if (lessons.length > 0) {
      localStorage.setItem('lessonHistory', JSON.stringify(lessons));
    }
  }, [lessons]);

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
    const matchesStatus = selectedStatus === 'all' || lesson.status === selectedStatus;
    const matchesFavorites = !showFavoritesOnly || lesson.isFavorite;
    
    return matchesSearch && matchesSubject && matchesStatus && matchesFavorites;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'attendance':
        return (b.attendanceRate || 0) - (a.attendanceRate || 0);
      case 'date':
      default:
        return b.date.getTime() - a.date.getTime();
    }
  });

  const handleToggleFavorite = (id: string) => {
    setLessons(prev => prev.map(lesson => 
      lesson.id === id ? { ...lesson, isFavorite: !lesson.isFavorite } : lesson
    ));
  };

  const handleDeleteLesson = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lesson from history?')) {
      setLessons(prev => prev.filter(lesson => lesson.id !== id));
    }
  };

  const handleDuplicateLesson = (lesson: HistoryLesson) => {
    const lessonPlan = {
      id: Date.now().toString(),
      title: `${lesson.title} (Copy)`,
      subject: lesson.subject,
      gradeLevel: lesson.gradeLevel,
      duration: lesson.duration,
      date: new Date(),
      objectives: lesson.objectives.map(obj => ({ ...obj, completed: false })),
      activities: lesson.activities.map(act => ({ ...act, completed: false })),
      materials: [],
      homework: lesson.homework,
      notes: lesson.notes,
      tags: lesson.tags
    };
    
    localStorage.setItem('currentLessonPlan', JSON.stringify(lessonPlan));
    alert('Lesson duplicated to current lesson planner!');
  };

  const getStatusColor = (status: HistoryLesson['status']) => {
    switch (status) {
      case 'completed': return 'badge-success';
      case 'in-progress': return 'badge-warning';
      case 'cancelled': return 'badge-error';
      default: return 'badge-ghost';
    }
  };

  const getCompletionRate = (lesson: HistoryLesson) => {
    const totalObjectives = lesson.objectives.length;
    const completedObjectives = lesson.objectives.filter(obj => obj.completed).length;
    return totalObjectives > 0 ? Math.round((completedObjectives / totalObjectives) * 100) : 0;
  };

  const getAttendanceRate = (lesson: HistoryLesson) => {
    if (!lesson.attendance || lesson.attendance.length === 0) return 0;
    const presentStudents = lesson.attendance.filter(student => student.present).length;
    return Math.round((presentStudents / lesson.attendance.length) * 100);
  };

  const getAttendanceStats = (lesson: HistoryLesson) => {
    if (!lesson.attendance || lesson.attendance.length === 0) {
      return { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    }
    
    const present = lesson.attendance.filter(s => s.present && !s.late).length;
    const late = lesson.attendance.filter(s => s.present && s.late).length;
    const excused = lesson.attendance.filter(s => !s.present && s.excused).length;
    const absent = lesson.attendance.filter(s => !s.present && !s.excused).length;
    
    return {
      present,
      late,
      excused,
      absent,
      total: lesson.attendance.length
    };
  };

  const subjects = Array.from(new Set(lessons.map(lesson => lesson.subject)));

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Lesson History</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
              className="btn btn-ghost btn-sm gap-2"
            >
              {viewMode === 'list' ? <Calendar className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              {viewMode === 'list' ? 'Calendar' : 'List'} View
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10 input-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in-progress">In Progress</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="select select-bordered select-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="attendance">Sort by Attendance</option>
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{lessons.length}</div>
            <div className="text-gray-600">Total Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {lessons.filter(l => l.status === 'completed').length}
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.round(lessons.reduce((sum, l) => sum + getCompletionRate(l), 0) / lessons.length) || 0}%
            </div>
            <div className="text-gray-600">Avg. Completion</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600">
              {lessons.filter(l => l.attendanceRate).length > 0 
                ? (lessons.reduce((sum, l) => sum + (l.attendanceRate || 0), 0) / lessons.filter(l => l.attendanceRate).length).toFixed(1)
                : 'N/A'
              }
            </div>
            <div className="text-gray-600">Avg. Attendance</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedSubject !== 'all' || selectedStatus !== 'all' || showFavoritesOnly
                ? 'Try adjusting your filters'
                : 'Your lesson history will appear here after you complete lessons'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLessons.map(lesson => (
              <div
                key={lesson.id}
                className="card bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          {expandedLesson === lesson.id ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <h3 className="font-semibold text-lg">{lesson.title}</h3>
                        <div className={`badge ${getStatusColor(lesson.status)}`}>
                          {lesson.status}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          {lesson.subject}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Grade {lesson.gradeLevel}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {lesson.date.toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {lesson.actualDuration || lesson.duration} min
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{getCompletionRate(lesson)}% completed</span>
                        </div>
                        {lesson.attendanceRate && (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">{lesson.attendanceRate}% attendance</span>
                          </div>
                        )}
                        {lesson.attendance && lesson.attendance.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-sm">{lesson.attendance.length} students</span>
                          </div>
                        )}
                      </div>

                      {lesson.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {lesson.tags.map(tag => (
                            <span key={tag} className="badge badge-xs badge-ghost">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFavorite(lesson.id)}
                        className="btn btn-ghost btn-sm btn-circle"
                      >
                        {lesson.isFavorite ? (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      <div className="dropdown dropdown-end">
                        <button tabIndex={0} className="btn btn-ghost btn-sm">⋯</button>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 z-10">
                          <li><a onClick={() => handleDuplicateLesson(lesson)}><Copy className="w-4 h-4" />Use as Template</a></li>
                          <li><a><Eye className="w-4 h-4" />View Canvas</a></li>
                          <li><a><Edit3 className="w-4 h-4" />Edit Reflection</a></li>
                          <li><a onClick={() => handleDeleteLesson(lesson.id)} className="text-error"><Trash2 className="w-4 h-4" />Delete</a></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {expandedLesson === lesson.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Learning Objectives
                        </h4>
                        <div className="space-y-1">
                          {lesson.objectives.map(objective => (
                            <div key={objective.id} className="flex items-center gap-2 text-sm">
                              {objective.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={objective.completed ? 'line-through text-gray-500' : ''}>
                                {objective.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Play className="w-4 h-4" />
                          Activities
                        </h4>
                        <div className="space-y-1">
                          {lesson.activities.map(activity => (
                            <div key={activity.id} className="flex items-center gap-2 text-sm">
                              {activity.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className={activity.completed ? 'line-through text-gray-500' : ''}>
                                {activity.title} ({activity.duration} min)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {lesson.attendance && lesson.attendance.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <ClipboardList className="w-4 h-4" />
                            Attendance ({getAttendanceRate(lesson)}%)
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-xs">
                              <div className="flex items-center gap-1">
                                <UserCheck className="w-3 h-3 text-green-500" />
                                <span>Present: {getAttendanceStats(lesson).present}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-yellow-500" />
                                <span>Late: {getAttendanceStats(lesson).late}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <UserX className="w-3 h-3 text-red-500" />
                                <span>Absent: {getAttendanceStats(lesson).absent}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-blue-500" />
                                <span>Excused: {getAttendanceStats(lesson).excused}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {lesson.attendance.map(student => (
                                <div key={student.id} className="flex items-center gap-2 text-sm p-2 bg-white rounded border">
                                  {student.present ? (
                                    student.late ? (
                                      <Clock className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                      <UserCheck className="w-4 h-4 text-green-500" />
                                    )
                                  ) : student.excused ? (
                                    <FileText className="w-4 h-4 text-blue-500" />
                                  ) : (
                                    <UserX className="w-4 h-4 text-red-500" />
                                  )}
                                  <span className={`flex-1 ${!student.present && !student.excused ? 'text-gray-500' : ''}`}>
                                    {student.name}
                                  </span>
                                  {student.late && <span className="badge badge-xs badge-warning">Late</span>}
                                  {student.excused && <span className="badge badge-xs badge-info">Excused</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {(lesson.notes || lesson.reflection) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lesson.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Lesson Notes</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{lesson.notes}</p>
                            </div>
                          )}
                          {lesson.reflection && (
                            <div>
                              <h4 className="font-medium mb-2">Reflection</h4>
                              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">{lesson.reflection}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {lesson.homework && (
                        <div>
                          <h4 className="font-medium mb-2">Homework Assigned</h4>
                          <p className="text-sm text-gray-600">{lesson.homework}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonHistory;