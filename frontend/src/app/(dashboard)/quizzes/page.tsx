'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Play, Eye, Edit, Trash2, Copy, Users, Clock, Shield } from 'lucide-react';

interface Quiz {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  timeLimit?: number;
  maxAttempts: number;
  participantCount: number;
  averageScore?: number;
  completionRate?: number;
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const duplicateQuiz = async (quizId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/quizzes/${quizId}/duplicate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchQuizzes(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to duplicate quiz:', error);
    }
  };

  const deleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchQuizzes(); // Refresh the list
      }
    } catch (error) {
      console.error('Failed to delete quiz:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading quizzes...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quizzes</h1>
          <p className="mt-2 text-gray-600">Create and manage your quizzes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Quiz
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          Filters
        </Button>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{quiz.title}</CardTitle>
                  {quiz.description && (
                    <CardDescription className="line-clamp-2">
                      {quiz.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {quiz.isPublic && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Public
                    </span>
                  )}
                  {quiz.publishedAt && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Published
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {/* Quiz Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>{quiz.participantCount} participants</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.timeLimit / 60}m</span>
                  </div>
                )}
                {quiz.averageScore !== undefined && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Avg Score: {quiz.averageScore}%</span>
                  </div>
                )}
                {quiz.completionRate !== undefined && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>{quiz.completionRate}% completion</span>
                  </div>
                )}
              </div>

              {/* Security Features */}
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-600">Anti-copy protection enabled</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => duplicateQuiz(quiz.id)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => deleteQuiz(quiz.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Quiz Card */}
        <Card className="border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Quiz</h3>
              <p className="text-sm text-gray-500 mb-4">Build a new quiz from scratch</p>
              <Button>Create Quiz</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <Play className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first quiz to get started'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </div>
      )}
    </div>
  );
}
