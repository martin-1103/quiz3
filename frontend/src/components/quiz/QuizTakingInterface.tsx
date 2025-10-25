'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SecurityProvider } from '@/components/security/SecurityProvider';
import { Clock, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
// Define SecurityEventType locally to avoid import issues
type SecurityEventType = 
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'RIGHT_CLICK'
  | 'TAB_SWITCH'
  | 'SCREENSHOT_ATTEMPT'
  | 'DEV_TOOLS_OPEN'
  | 'KEYBOARD_SHORTCUT'
  | 'FULLSCREEN_EXIT'
  | 'FOCUS_LOST';

interface Question {
  id: string;
  questionText: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY' | 'FILL_BLANK';
  options?: Array<{
    id: string;
    optionText: string;
    order: number;
  }>;
  maxPoints: number;
  timeLimit?: number;
}

interface QuizSession {
  id: string;
  quizId: string;
  sessionToken: string;
  startedAt: string;
  timeLimit?: number;
  questions: Array<{
    question: Question;
    order: number;
    points: number;
  }>;
}

interface QuizTakingInterfaceProps {
  sessionToken: string;
  onComplete: (answers: any) => void;
  enableSecurity?: boolean;
}

export function QuizTakingInterface({ 
  sessionToken, 
  onComplete, 
  enableSecurity = true 
}: QuizTakingInterfaceProps) {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchQuizSession();
  }, [sessionToken]);

  useEffect(() => {
    if (!session?.timeLimit) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.timeLimit]);

  const fetchQuizSession = async () => {
    try {
      const response = await fetch(`/api/v1/quizzes/sessions/${sessionToken}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.data);
        setTimeRemaining(data.data.timeLimit || 0);
      }
    } catch (error) {
      console.error('Failed to fetch quiz session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityEvent = useCallback((eventType: SecurityEventType, data?: any) => {
    console.log('Security event detected:', eventType, data);
    // You can implement additional security actions here
    if (eventType === 'DEV_TOOLS_OPEN') {
      // Could implement more strict actions like ending the quiz
    }
  }, []);

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleQuestionChange = (direction: 'prev' | 'next') => {
    // Record time spent on current question
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const currentQuestion = session?.questions[currentQuestionIndex];
    
    if (currentQuestion) {
      setQuestionTimes(prev => ({
        ...prev,
        [currentQuestion.question.id]: timeSpent
      }));
    }

    if (direction === 'next') {
      setCurrentQuestionIndex(prev => Math.min(prev + 1, (session?.questions.length || 1) - 1));
    } else {
      setCurrentQuestionIndex(prev => Math.max(prev - 1, 0));
    }

    setQuestionStartTime(Date.now());
  };

  const toggleFlagQuestion = () => {
    const currentQuestion = session?.questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.question.id)) {
        newSet.delete(currentQuestion.question.id);
      } else {
        newSet.add(currentQuestion.question.id);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);

    try {
      // Record time spent on last question
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const currentQuestion = session?.questions[currentQuestionIndex];
      
      if (currentQuestion) {
        setQuestionTimes(prev => ({
          ...prev,
          [currentQuestion.question.id]: timeSpent
        }));
      }

      // Submit all answers
      const submitPromises = Object.entries(answers).map(([questionId, answer]) => {
        return fetch(`/api/v1/quizzes/sessions/${sessionToken}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId,
            answer,
            timeSpent: questionTimes[questionId] || 0,
          }),
        });
      });

      await Promise.all(submitPromises);

      // Complete the quiz
      const completeResponse = await fetch(`/api/v1/quizzes/sessions/${sessionToken}/complete`, {
        method: 'POST',
      });

      if (completeResponse.ok) {
        onComplete(answers);
      }
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = session ? ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <p>Quiz session not found or expired.</p>
      </div>
    );
  }

  const currentQuestion = session.questions[currentQuestionIndex]?.question;

  return (
    <SecurityProvider 
      enableAntiCopy={enableSecurity}
      sessionId={session.id}
      onSecurityEvent={handleSecurityEvent}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Quiz in Progress</h1>
            {timeRemaining > 0 && (
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          
          <div className="mb-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Question {currentQuestionIndex + 1} of {session.questions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">
                {currentQuestion?.questionText}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlagQuestion}
                className={flaggedQuestions.has(currentQuestion?.id || '') ? 'bg-yellow-50 border-yellow-300' : ''}
              >
                <Flag className={`h-4 w-4 mr-2 ${flaggedQuestions.has(currentQuestion?.id || '') ? 'text-yellow-600' : ''}`} />
                Flag
              </Button>
            </div>
            {currentQuestion?.maxPoints > 1 && (
              <CardDescription>
                Worth {currentQuestion.maxPoints} points
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent>
            {currentQuestion?.type === 'MULTIPLE_CHOICE' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options
                  .sort((a, b) => a.order - b.order)
                  .map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={option.id}
                        checked={answers[currentQuestion.id] === option.id}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                        className="mr-3"
                      />
                      <span>{option.optionText}</span>
                    </label>
                  ))}
              </div>
            )}

            {currentQuestion?.type === 'TRUE_FALSE' && (
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="true"
                    checked={answers[currentQuestion.id] === 'true'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-3"
                  />
                  <span>True</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value="false"
                    checked={answers[currentQuestion.id] === 'false'}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                    className="mr-3"
                  />
                  <span>False</span>
                </label>
              </div>
            )}

            {currentQuestion?.type === 'ESSAY' && (
              <textarea
                className="w-full p-3 border rounded-lg"
                rows={6}
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}

            {currentQuestion?.type === 'FILL_BLANK' && (
              <input
                type="text"
                className="w-full p-3 border rounded-lg"
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => handleQuestionChange('prev')}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: session.questions.length }, (_, i) => (
              <button
                key={i}
                className={`w-8 h-8 rounded-full text-sm ${
                  i === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : flaggedQuestions.has(session.questions[i].question.id)
                    ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
                onClick={() => {
                  handleQuestionChange('prev');
                  setCurrentQuestionIndex(i);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === session.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={() => handleQuestionChange('next')}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </SecurityProvider>
  );
}
