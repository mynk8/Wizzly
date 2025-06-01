import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Users,
  Eye,
  Clock,
  Share2,
  Download,
  RefreshCw,
  ArrowUpRight,
  Target,
  Zap,
  BookOpen,
  Video,
  MessageSquare,
  Star,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalViews: number;
    uniqueViewers: number;
    avgSessionDuration: string;
    engagementRate: number;
    totalShares: number;
    totalDownloads: number;
  };
  trends: {
    viewsOverTime: Array<{ date: string; views: number; engagement: number }>;
    topContent: Array<{ title: string; views: number; engagement: number; type: 'canvas' | 'video' | 'note' }>;
    deviceBreakdown: Array<{ device: string; percentage: number; users: number }>;
    timeDistribution: Array<{ hour: number; activity: number }>;
  };
  performance: {
    mostEngaging: string;
    leastEngaging: string;
    averageTimeSpent: string;
    peakUsageTime: string;
    retentionRate: number;
    completionRate: number;
  };
  demographics: {
    ageGroups: Array<{ group: string; percentage: number }>;
    subjects: Array<{ subject: string; popularity: number }>;
    locations: Array<{ location: string; users: number }>;
  };
}

const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'engagement' | 'shares'>('views');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const mockData: AnalyticsData = {
      overview: {
        totalViews: 12847,
        uniqueViewers: 3421,
        avgSessionDuration: '18m 32s',
        engagementRate: 78.5,
        totalShares: 234,
        totalDownloads: 156
      },
      trends: {
        viewsOverTime: [
          { date: '2024-01-01', views: 120, engagement: 65 },
          { date: '2024-01-02', views: 145, engagement: 72 },
          { date: '2024-01-03', views: 189, engagement: 68 },
          { date: '2024-01-04', views: 167, engagement: 75 },
          { date: '2024-01-05', views: 203, engagement: 82 },
          { date: '2024-01-06', views: 178, engagement: 79 },
          { date: '2024-01-07', views: 234, engagement: 85 }
        ],
        topContent: [
          { title: 'Pythagorean Theorem Explanation', views: 1247, engagement: 89, type: 'canvas' },
          { title: 'Cell Structure Diagram', views: 987, engagement: 76, type: 'canvas' },
          { title: 'Solar System Overview', views: 834, engagement: 82, type: 'canvas' },
          { title: 'Physics Concepts Video', views: 723, engagement: 71, type: 'video' },
          { title: 'Math Problem Solving', views: 656, engagement: 68, type: 'note' }
        ],
        deviceBreakdown: [
          { device: 'Desktop', percentage: 45, users: 1540 },
          { device: 'Tablet', percentage: 35, users: 1197 },
          { device: 'Mobile', percentage: 20, users: 684 }
        ],
        timeDistribution: [
          { hour: 8, activity: 15 },
          { hour: 9, activity: 35 },
          { hour: 10, activity: 65 },
          { hour: 11, activity: 85 },
          { hour: 12, activity: 45 },
          { hour: 13, activity: 55 },
          { hour: 14, activity: 75 },
          { hour: 15, activity: 95 },
          { hour: 16, activity: 70 },
          { hour: 17, activity: 40 },
          { hour: 18, activity: 25 },
          { hour: 19, activity: 15 }
        ]
      },
      performance: {
        mostEngaging: 'Pythagorean Theorem Explanation',
        leastEngaging: 'Basic Algebra Review',
        averageTimeSpent: '18m 32s',
        peakUsageTime: '3:00 PM',
        retentionRate: 67.8,
        completionRate: 84.2
      },
      demographics: {
        ageGroups: [
          { group: '13-15', percentage: 35 },
          { group: '16-18', percentage: 45 },
          { group: '19-22', percentage: 20 }
        ],
        subjects: [
          { subject: 'Mathematics', popularity: 85 },
          { subject: 'Science', popularity: 72 },
          { subject: 'Biology', popularity: 68 },
          { subject: 'Physics', popularity: 61 },
          { subject: 'Chemistry', popularity: 54 }
        ],
        locations: [
          { location: 'United States', users: 1247 },
          { location: 'Canada', users: 834 },
          { location: 'United Kingdom', users: 567 },
          { location: 'Australia', users: 423 },
          { location: 'Germany', users: 350 }
        ]
      }
    };

    setTimeout(() => {
      setData(mockData);
      setIsLoading(false);
    }, 1000);
  }, [selectedPeriod]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'tablet':
        return <Tablet className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'canvas':
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'video':
        return <Video className="w-4 h-4 text-red-500" />;
      case 'note':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Insights into your teaching performance and student engagement</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn btn-ghost btn-sm gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="btn btn-ghost btn-sm gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Period and Metric Selectors */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Period:</span>
            {(['7d', '30d', '90d', '1y'] as const).map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`btn btn-sm ${selectedPeriod === period ? 'btn-primary' : 'btn-ghost'}`}
              >
                {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Metric:</span>
            {(['views', 'engagement', 'shares'] as const).map(metric => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`btn btn-sm ${selectedMetric === metric ? 'btn-secondary' : 'btn-ghost'}`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <Eye className="w-5 h-5 text-blue-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.totalViews)}</div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <Users className="w-5 h-5 text-purple-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.uniqueViewers)}</div>
                <div className="text-sm text-gray-600">Unique Viewers</div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <Clock className="w-5 h-5 text-orange-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{data.overview.avgSessionDuration}</div>
                <div className="text-sm text-gray-600">Avg. Session</div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <Target className="w-5 h-5 text-green-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{data.overview.engagementRate}%</div>
                <div className="text-sm text-gray-600">Engagement</div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <Share2 className="w-5 h-5 text-blue-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{data.overview.totalShares}</div>
                <div className="text-sm text-gray-600">Shares</div>
              </div>
            </div>
          </div>

          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <Download className="w-5 h-5 text-indigo-600" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900">{data.overview.totalDownloads}</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trends Chart */}
          <div className="lg:col-span-2 card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Trends Over Time</h3>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm">
                    <LineChart className="w-4 h-4" />
                  </button>
                  <button className="btn btn-ghost btn-sm">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Mock Chart */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-600">Interactive trend charts</p>
                  <p className="text-sm text-gray-500">Views and engagement over time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Usage</h3>
              
              <div className="space-y-4">
                {data.trends.deviceBreakdown.map(device => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.device)}
                      <span className="text-sm font-medium text-gray-900">{device.device}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{device.percentage}%</div>
                      <div className="text-xs text-gray-500">{formatNumber(device.users)} users</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mock Pie Chart */}
              <div className="mt-6 h-32 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="w-8 h-8 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">Device distribution chart</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Performance and Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Content */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
              
              <div className="space-y-3">
                {data.trends.topContent.map((content, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      {getContentIcon(content.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{content.title}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-gray-500">{formatNumber(content.views)} views</span>
                        <span className="text-xs text-gray-500">{content.engagement}% engagement</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="badge badge-sm badge-ghost">#{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Popularity */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Popularity</h3>
              
              <div className="space-y-4">
                {data.demographics.subjects.map(subject => (
                  <div key={subject.subject} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                      <span className="text-sm text-gray-600">{subject.popularity}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${subject.popularity}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Key Metrics */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Retention Rate</span>
                  <span className="text-sm font-medium text-gray-900">{data.performance.retentionRate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-medium text-gray-900">{data.performance.completionRate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Peak Usage</span>
                  <span className="text-sm font-medium text-gray-900">{data.performance.peakUsageTime}</span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900">Top Performer</span>
                  </div>
                  <p className="text-sm text-gray-600">{data.performance.mostEngaging}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity by Hour</h3>
              
              <div className="grid grid-cols-6 gap-1">
                {data.trends.timeDistribution.map(time => (
                  <div
                    key={time.hour}
                    className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                    style={{
                      backgroundColor: `rgba(59, 130, 246, ${time.activity / 100})`,
                      color: time.activity > 50 ? 'white' : '#374151'
                    }}
                    title={`${time.hour}:00 - ${time.activity}% activity`}
                  >
                    {time.hour}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                <span>Low Activity</span>
                <span>High Activity</span>
              </div>
            </div>
          </div>

          {/* Geographic Distribution */}
          <div className="card bg-white shadow-sm border border-gray-200">
            <div className="card-body p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Reach</h3>
              
              <div className="space-y-3">
                {data.demographics.locations.map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-sm text-gray-900">{location.location}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-600">
                      {formatNumber(location.users)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Insights and Recommendations */}
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
          <div className="card-body p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Insights & Recommendations</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Peak Performance</span>
                </div>
                <p className="text-sm text-gray-600">
                  Your content performs best between 2-4 PM. Consider scheduling important releases during this time.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-900">Engagement Boost</span>
                </div>
                <p className="text-sm text-gray-600">
                  Interactive elements increase engagement by 23%. Add more interactive components to your canvases.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-900">Audience Growth</span>
                </div>
                <p className="text-sm text-gray-600">
                  Mathematics content has the highest retention rate. Consider creating more math-focused materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;