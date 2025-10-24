'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface GeneratedQuestion {
  questionText: string;
  options?: Array<{
    text: string;
    points: number;
    isCorrect: boolean;
  }>;
  explanation?: string;
  difficulty: string;
  type: string;
}

export function AIChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you create quiz questions, improve existing ones, and provide educational content. What would you like to work on today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const assistantMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        // If questions were generated, store them
        if (data.data.questions) {
          setGeneratedQuestions(data.data.questions);
        }
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const saveQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      // This would save the generated questions to the database
      console.log('Saving questions:', generatedQuestions);
    } catch (error) {
      console.error('Failed to save questions:', error);
    }
  };

  return (
    <div className="flex h-full">
      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col m-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-blue-500" />
              <span>AI Assistant</span>
            </CardTitle>
            <CardDescription>
              Ask me to create questions, explain concepts, or help with your quiz content
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-blue-500" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-md rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-sm text-gray-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t pt-4">
              <div className="flex items-end space-x-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me to create questions or help with your quiz content..."
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Questions Panel */}
      {generatedQuestions.length > 0 && (
        <div className="w-96 m-4 ml-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <span>Generated Questions ({generatedQuestions.length})</span>
              </CardTitle>
              <CardDescription>
                Review and save the questions generated by AI
              </CardDescription>
            </CardHeader>
            
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {generatedQuestions.map((question, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Question {index + 1}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {question.type}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {question.questionText}
                    </p>
                    
                    {question.options && (
                      <div className="space-y-1 mb-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center space-x-2 text-xs">
                            <span className={`w-2 h-2 rounded-full ${
                              option.isCorrect ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span>{option.text}</span>
                            <span className="text-gray-500">({option.points} pts)</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.explanation && (
                      <p className="text-xs text-gray-500 italic">
                        {question.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
                <Button onClick={saveQuestions} className="w-full">
                  Save All Questions
                </Button>
                <Button variant="outline" className="w-full">
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
