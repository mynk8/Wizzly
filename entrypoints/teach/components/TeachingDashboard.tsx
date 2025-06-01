import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  Eye,
  Download,
  Share2,
  Plus,
  ArrowRight,
  Activity,
  Target,
  Award,
  Zap,
  PieChart,
  LineChart,
  FileText,
  Video,
  Mic,
  Camera,
  Settings,
  Bell,
  Search
} from 'lucide-react';

interface DashboardStats {
  totalCanvases: number;
  totalViews: number;
  totalShares: number;
  totalNotes: number;
  weeklyActivity: number;
  popularCanvas: string;
  recentActivity: ActivityItem[];
  upcomingEvents: Event[];
  quickStats: QuickStat[];
}

interface ActivityItem {
  id: string;
  type: 'canvas_created' | 'canvas_shared' | 'note_taken' | 'video_added';
  title: string;
  timestamp: Date;
  metadata?: any;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  type: 'class' | 'meeting' | 'deadline';
  description?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const TeachingDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalCanvases: 24,
      totalViews: 1247,
      totalShares: 89,
      totalNotes: 156,
      weeklyActivity: 85,
      popularCanvas: 'Pythagorean Theorem Explanation',
      recentActivity: [
        {
          id: '1',
          type: 'canvas_created',
          title: 'Created "Cell Structure Diagram"',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
          id: '2',
          type: 'note_taken',
          title: 'Note taken during "Math Concepts" session',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        },
        {
          id: '3',
          type: 'canvas_shared',
          title: 'Shared "Solar System Overview" with Class 9A',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        },
        {
          id: '4',
          type: 'video_added',
          title: 'Added YouTube video to "Physics Concepts"',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        }
      ],
      upcomingEvents: [
        {
          id: '1',
          title: 'Physics Class - Grade 10',
          date: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          type: 'class',
          description: 'Newton\'s Laws of Motion'
        },
        {
          id: '2',
          title: 'Parent-Teacher Meeting',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          type: 'meeting',
          description: 'Quarterly progress review'
        },
        {
          id: '3',
          title: 'Assignment Deadline',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          type: 'deadline',
          description: 'Mathematics homework submission'
        }
      ],
      quickStats: [
        {
          label: 'Total Views',
          value: 1247,
          change: 12.5,
          icon: <Eye className="w-5 h-5" />,
          color: 'text-blue-600'
        },
        {
          label: 'Engagement Rate',
          value: '78%',
          change: 5.2,
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'text-green-600'
        },
        {
          label: 'Active Students',
          value: 142,
          change: -2.1,
          icon: <Users className="w-5 h-5" />,
          color: 'text-purple-600'
        },
        {
          label: 'Avg. Session',
          value: '24m',
          change: 8.7,
          icon: <Clock className="w-5 h-5" />,
          color: 'text-orange-600'
        }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'canvas_created':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'canvas_shared':
        return <Share2 className="w-4 h-4 text-green-500" />;
      case 'note_taken':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'video_added':
        return <Video className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'class':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'meeting':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const formatUpcoming = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Starting soon';
    if (diffInHours < 24) return `In ${diffInHours}h`;
    return `In ${Math.floor(diffInHours / 24)}d`;
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teaching Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's your teaching overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered input-sm pl-10 w-64"
              />
            </div>
            <button className="btn btn-ghost btn-sm btn-square">
              <Bell className="w-4 h-4" />
            </button>
            <button className="btn btn-ghost btn-sm btn-square">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`btn btn-sm ${selectedPeriod === period ? 'btn-primary' : 'btn-ghost'}`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.quickStats.map((stat, index) => (
            <div key={index} className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Placeholder */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Activity Overview</h3>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-sm">
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button className="btn btn-ghost btn-sm">
                      <PieChart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Mock Chart */}
                <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-600">Interactive charts coming soon</p>
                    <p className="text-sm text-gray-500">Canvas views, engagement, and usage analytics</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button className="btn btn-outline gap-2 h-auto py-4 flex-col">
                    <Plus className="w-5 h-5" />
                    <span className="text-xs">New Canvas</span>
                  </button>
                  <button className="btn btn-outline gap-2 h-auto py-4 flex-col">
                    <Video className="w-5 h-5" />
                    <span className="text-xs">Add Video</span>
                  </button>
                  <button className="btn btn-outline gap-2 h-auto py-4 flex-col">
                    <Camera className="w-5 h-5" />
                    <span className="text-xs">Take Note</span>
                  </button>
                  <button className="btn btn-outline gap-2 h-auto py-4 flex-col">
                    <Mic className="w-5 h-5" />
                    <span className="text-xs">Voice Note</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                  <button className="btn btn-ghost btn-sm gap-1">
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {stats.recentActivity.map(activity => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Performance Summary */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Canvas Library</span>
                    <span className="text-sm font-medium">{stats.totalCanvases} items</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Views</span>
                    <span className="text-sm font-medium">{stats.totalViews.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Shares</span>
                    <span className="text-sm font-medium">{stats.totalShares}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Notes Taken</span>
                    <span className="text-sm font-medium">{stats.totalNotes}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">Most Popular</span>
                    </div>
                    <p className="text-sm text-gray-600">{stats.popularCanvas}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="card bg-white shadow-sm border border-gray-200">
              <div className="card-body p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upcoming</h3>
                  <button className="btn btn-ghost btn-sm gap-1">
                    <Calendar className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  {stats.upcomingEvents.map(event => (
                    <div key={event.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </p>
                          {event.description && (
                            <p className="text-xs text-gray-600 mt-1 truncate">
                              {event.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatUpcoming(event.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="card bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-sm">
              <div className="card-body p-6 text-center">
                <Award className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">Great Work!</h3>
                <p className="text-sm opacity-90 mb-3">
                  You've created {stats.totalCanvases} teaching materials this month
                </p>
                <div className="badge badge-ghost bg-white/20 text-white">
                  <Zap className="w-3 h-3 mr-1" />
                  Top Educator
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachingDashboard; 