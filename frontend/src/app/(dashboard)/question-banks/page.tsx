'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  questionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function QuestionBanksPage() {
  const [questionBanks, setQuestionBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuestionBanks();
  }, []);

  const fetchQuestionBanks = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/question-banks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuestionBanks(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch question banks:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestionBanks = questionBanks.filter(bank =>
    bank.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bank.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading question banks...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Banks</h1>
          <p className="mt-2 text-gray-600">Manage your question banks and collections</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Question Bank
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search question banks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Question Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestionBanks.map((bank) => (
          <Card key={bank.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">{bank.name}</CardTitle>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              {bank.isPublic && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Public
                </span>
              )}
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {bank.description || 'No description available'}
              </CardDescription>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{bank.questionCount} questions</span>
                <span>Updated {new Date(bank.updatedAt).toLocaleDateString()}</span>
              </div>

              <div className="mt-4 flex items-center space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Question Bank Card */}
        <Card className="border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
          <CardContent className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Create Question Bank</h3>
              <p className="text-sm text-gray-500">Start a new question bank collection</p>
              <Button className="mt-4">Create Bank</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredQuestionBanks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No question banks found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first question bank to get started'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Question Bank
          </Button>
        </div>
      )}
    </div>
  );
}
