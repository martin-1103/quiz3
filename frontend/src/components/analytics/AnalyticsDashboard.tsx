'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Shield, 
  Clock,
  Target,
  AlertTriangle,
  Download,
  Calendar
} from 'lucide-react';

interface AnalyticsOverview {
  totalQuizzes: number;
  totalParticipants: number;
  totalQuestions: number;
  averageScore: number;
  completionRate: number;
  totalSecurityEvents: number;
}

interface QuizPerformance {
  quizId: string;
  title: string;
  totalParticipants: number;
  completedSessions: number;
  averageScore: number;
  averageTimeSpent: number;
  completionRate: number;
}

interface SecurityEvent {
  id: string;
  eventType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: string;
  quizTitle?: string;
}

export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [quizPerformance, setQuizPerformance] = useState<QuizPerformance[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Fetch overview data
      const overviewResponse = await fetch(`/api/v1/analytics/overview?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        setOverview(overviewData.data);
      }

      // Fetch quiz performance data
      const performanceResponse = await fetch(`/api/v1/analytics/quizzes/performance?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setQuizPerformance(performanceData.data || []);
      }

      // Fetch security events
      const securityResponse = await fetch(`/api/v1/analytics/security/events?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (securityResponse.ok) {
        const securityData = await securityResponse.json();
        setSecurityEvents(securityData.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/analytics/export?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Monitor your quiz platform performance and security</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">
                Active quizzes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                Total users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                In question banks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.averageScore}%</div>
              <p className="text-xs text-muted-foreground">
                Across all quizzes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Quiz completion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Events</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overview.totalSecurityEvents}</div>
              <p className="text-xs text-muted-foreground">
                Suspicious activities
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Quiz Performance</CardTitle>
            <CardDescription>Top performing quizzes by completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizPerformance.slice(0, 5).map((quiz) => (
                <div key={quiz.quizId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{quiz.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{quiz.totalParticipants} participants</span>
                      <span>{quiz.averageScore}% avg score</span>
                      <span>{(quiz.averageTimeSpent / 60).toFixed(1)}m avg time</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{quiz.completionRate}%</div>
                    <div className="text-xs text-gray-500">completion</div>
                  </div>
                </div>
              ))}
              
              {quizPerformance.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No quiz performance data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Recent Security Events</span>
            </CardTitle>
            <CardDescription>Latest security monitoring alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {securityEvents.slice(0, 6).map((event) => (
                <div 
                  key={event.id} 
                  className={`p-3 border rounded-lg ${getSeverityColor(event.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.eventType.replace(/_/g, ' ')}</h4>
                      <p className="text-xs mt-1">{event.description}</p>
                      {event.quizTitle && (
                        <p className="text-xs mt-1 font-medium">Quiz: {event.quizTitle}</p>
                      )}
                    </div>
                    <div className="text-xs text-right">
                      <div>{new Date(event.timestamp).toLocaleDateString()}</div>
                      <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}
              
              {securityEvents.length === 0 && (
                <div className="text-center py-8 text-green-600">
                  <Shield className="h-8 w-8 mx-auto mb-2" />
                  <p>No security events detected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* AI Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <span>AI Assistant Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Questions Generated</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Chat Sessions</span>
                <span className="font-medium">456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Essays Scored</span>
                <span className="font-medium">89</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <span>User Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-medium">892</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="font-medium">+47</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Retention Rate</span>
                <span className="font-medium text-green-600">78%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg. Session Time</span>
                <span className="font-medium">23m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span>System Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="font-medium text-green-600">124ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="font-medium text-green-600">99.8%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="font-medium">0.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Requests</span>
                <span className="font-medium">45.2k</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
