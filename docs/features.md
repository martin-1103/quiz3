# Features Specification

## Overview

Complete breakdown of semua fiturur yang akan diimplementasikan di Quiz Generator Platform dengan detail implementasi teknis dan UI components.

## 1. Question Bank System

### 1.1 Hierarchical Categories
**Tujuan**: Organize questions dalam struktur hirarkis untuk memudah navigasi yang intuitive.

**Implementation**:
```typescript
// Category Type Definition
interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  level: CategoryLevel; // 0=Subject, 1=Topic, 2=Subtopic
  userId: string;
  children: Category[];
  questionCount: number;
  color: string; // Hex color untuk UI
  icon: string; // Icon name dari lucide-react
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

enum CategoryLevel {
  SUBJECT = 0;
  TOPIC = 1;
  SUBTOPIC = 2;
}
```

**UI Components**:
```typescript
// CategoryTree Component
const CategoryTree: React.FC<{
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex h-full">
      {/* Category Sidebar */}
      <div className="w-64 border-r p-4">
        <div className="space-y-2">
          {categories
            .filter(cat => cat.level === 0)
            .map(category => (
              <div
                key={category.id}
                className={`p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                  selectedCategory === category.id ? 'bg-primary text-primary' : ''
                }`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="flex items-center space-x-2">
                  {category.icon && <Icon name={category.icon} className="w-4 h-4 text-muted-foreground" />}
                  <span>{category.name}</span>
                  <Badge variant="outline">
                    {category.questionCount}
                  </Badge>
                </div>
              </div>
              
              {/* Child Categories */}
              {categories
                .filter(cat => cat.level === 1 && cat.parentId === selectedCategory)
                .map(category => (
                  <div
                    key={category.id}
                    className={`ml-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedCategory === category.id ? 'bg-primary text-primary' : ''
                    }`}
                    onClick={() => onSelectCategory(category.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {category.icon && <Icon name={category.icon} className="w-4 h-4 text-muted-foreground" />}
                      <span>{category.name}</span>
                    </div>
                  </div>
              
              {/* Sub-categories */}
              {categories
                .filter(cat => cat.level === 2 && cat.parentId === selectedCategory)
                .map(category => (
                  <div
                    key={category.id}
                    className={`ml-6 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedCategory === category.id ? 'bg-primary text-primary' : ''
                    }`}
                    onClick={() => onSelectCategory(category.id)}
                  >
                    <div className="flex items-center space-x-2">
                      {category.icon && <Icon name={category.icon} className="w-4 h-4 text-muted-foreground" />}
                      <span>{category.name}</span>
                    </div>
                  </div>
            ))}
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {selectedCategory ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{selectedCategory.name}</h2>
              <p className="text-muted-foreground">
                {selectedCategory.description}
              </p>
              <Button onClick={() => createQuestion(selectedCategory)}>
                Add Question
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              Select a category to view questions
            </div>
          )}
        </div>
      </div>
    );
};
```

**Backend Schema**:
```sql
CREATE TABLE categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parentId VARCHAR(255),
  level INT DEFAULT 0,
  userId VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),
  isActive BOOLEAN DEFAULT TRUE,
  sortOrder INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES categories(id),
  INDEX idx_categories_user (userId),
  INDEX idx_categories_parentId (parentId),
  INDEX idx_categories_level (level),
  INDEX idx_categories_isActive (isActive),
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### 1.2 Advanced Search & Filter System
**Features**:
- Full-text search dengan semantic search
- Filter by type, difficulty, tags, category, question bank
- Advanced boolean operators (AND/OR/NOT)
- Search result highlighting
- Saved search filters untuk repeated searches
- Real-time search suggestions

**Implementation**:
```typescript
// Advanced Search Hook
const useAdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<QuestionFilters>({
    type: [],
    difficulty: [],
    tags: [],
    categoryId: null,
    questionBankId: null,
    difficulty: null,
    tags: null,
    isPublic: null,
  });

  const debouncedSearch = useDebounce(setSearchQuery, 300);

  const performSearch = async (overrideQuery?: string) => {
    const query = overrideQuery || searchQuery;
    const filteredResults = await searchQuestions(query, filters);
    setSearchQuery(query);
    return filteredResults;
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    performSearch,
  };
};

// Search Function
const searchQuestions = async (
  query: string,
  filters: QuestionFilters
): Promise<Question[]> => {
  const whereClause = buildWhereClause(filters);
  
  return await prisma.question.findMany({
    where: {
      AND: [
        whereClause,
        {
          OR: [
            { questionText: { contains: query } },
            { options: { some: { optionText: { contains: query } } },
            { tags: { hasSome: { some: (tag: string) => query.includes(tag) } }
          }
        },
      ],
      },
      include: {
        options: true,
        category: true,
        questionBank: true,
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });
};
```

## 2. AI Assistant dengan GPT-5

### 2.1 Custom System Prompts
**Tujuan**: Memung administrator untuk membuat custom prompts yang menghasilkan questions berkualitas tinggi tinggi.

**AI Prompt Templates**:
```typescript
interface AiPrompt {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  category: string; // math, science, language, general, business
  isTemplate: boolean;
  userId: string;
  usageCount: number;
  averageRating: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Template Categories**:
```typescript
// Math Problems Template
const mathPromptTemplate = `You are an expert mathematics teacher creating questions for ${level} level students. Generate questions that:
1. Test specific mathematical concepts (${concepts})
2. Include realistic scenarios (${scenarios})
3. Provide step-by-step solution processes
4. Balance difficulty level for the target audience
5. Return JSON format with questions, options, correct answers, explanations
Format requirements:
{
  "questions": [
    {
      "questionText": "Calculate the area of a circle with radius 5cm",
      "options": [
        {
          "text": "78.54",
          "points": 10
        },
        {
          "text": "31.42",
          "points": 5
        },
        {
          "text": "15.71",
          "points": 0
        }
      ],
      "explanation": "Use A = πr²r² = 78.54 cm²"
    }
  ]}`;

// Business Case Analysis Template
const businessPromptTemplate = `You are a business analyst creating quiz questions for ${industry} professionals.
For ${use_case} use cases:
1. Analyze ${business_problem}
2. Create scenario-based questions
3. Consider industry best practices and regulations
4. Include multiple choice options
5. Generate questions in JSON format

Return structured JSON with:
- Questions with multiple difficulty levels
- Industry-specific terminology
- Scoring guidelines
- Time management suggestions
- Compliance references
`;
```

### 2.2 Interactive AI Chat Interface
**Flow**:
1. User menginput custom prompt requirements
2. AI mengajukan dengan follow-up questions
3. User preview dan refine questions
4. Save ke database setelah approved

**Implementation**:
```typescript
// AI Chat Interface
interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const AIChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const handleSendMessage = async () => {
  if (!inputValue.trim()) return;

  setIsGenerating(true);
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: inputValue,
        conversationHistory: messages,
      }),
    });

    const data = await response.json();
    
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.response,
      timestamp: new Date().toISOString(),
    }]);
    
    setGeneratedQuestions(data.questions || []);
  }, 300);
    
    setIsGenerating(false);
  } catch (error) {
      console.error('Chat error:', error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      {/* Chat Interface */}
      <div className="flex-1 border-r">
        <div className="flex flex-col p-4 border-r">
          <div className="border-b p-2">
            <h3 className="text-lg font-semibold">AI Assistant</h3>
          </div>
          
          {/* Message History */}
          <div className="flex-1 overflow-y-auto max-h-[calc(100vh-8rem)] p-4 space-y-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm text-gray-600">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Input Area */}
            <div className="border-t p-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Describe your requirements for question generation..."
                className="w-full h-32 p-2 border rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 focus:ring-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:ring-blue-500 focus:outline-none focus:ring-blue-500 focus:ring-blue-500 focus:outline-none"
                />
              <Button
                onClick={handleSendMessage}
                disabled={isGenerating}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Send to AI'
                )}
              </Button>
            </div>
          </div>
          
          {/* Generated Questions Preview */}
          {generatedQuestions.length > 0 && (
            <div className="mt-4 border-t rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Generated Questions Preview ({generatedQuestions.length} questions)
                </h3>
              </div>
              
              {/* Question Cards Preview */}
              <div className="space-y-3">
                {generatedQuestions.map((question, index) => (
                  <Card key={index} className="border rounded-lg p-4">
                    <CardContent className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Q{index + 1}:</strong> {question.questionText}
                      </p>
                      <div className="flex justify-between items-center space-x-2">
                        {question.type === 'MULTIPLE_CHOICE' && (
                          <div className="flex space-x-2">
                            {question.options.map((option, idx) => (
                              <Badge 
                                variant={option.isCorrect ? 'default' : 'outline'}
                                className="text-xs"
                              >
                                {option.points} pts
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => editQuestion(question)}
                          className="ml-4 px-2"
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={() => saveAllQuestions()}
                  className="px-6 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save All Questions
                </Button>
                <Button
                  variant="outline"
                  onClick={regenerateQuestions}
                  className="ml-4 px-2"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2.3 Question Preview System
**Features**:
- Live preview sebelum menyimpan
- Edit capabilities untuk setiap question
- Bulk actions untuk save atau discard
- Quality scoring prediction
- Version control untuk track perubahan

**Implementation**:
```typescript
// Question Preview Component
const QuestionPreview: React.FC<{
  question: Question;
  onEdit: (updatedQuestion: Partial<Question>) => void;
  onSave: (saveQuestion: Question) => void;
  onDiscard: () => void;
}> = ({ question, onEdit, onSave, onDiscard }) => {
  const [localQuestion, setLocalQuestion] = useState(question);

  const saveQuestion = async () => {
    try {
      await api.put(`/api/questions/${question.id}`, localQuestion);
      toast.success('Question saved successfully');
    } catch (error) {
      toast.error('Failed to save question');
    }
  };

  return (
    <Card className="border rounded-lg p-4">
      <CardContent className="space-y-3">
        <div className="flex justify-between items-start">
          <Badge variant={question.difficulty}>
            {question.difficulty}
          </Badge>
          <Badge variant="secondary">
            {question.type}
          </Badge>
        </div>
        
        <div className="flex-1">
          <p className="font-medium">{question.questionText}</p>
          
          {question.type === 'MULTIPLE_CHOICE' && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {question.options.map((option, idx) => (
                <div
                  key={option.id}
                  className={`p-3 border rounded ${option.isCorrect ? 'border-green-200' : 'border-gray-200'}`}
                >
                  <span>{option.optionText}</span>
                  <span className="text-xs text-gray-500">
                    {option.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'ESSAY' && (
            <div className="mt-4">
              <textarea
                value={localQuestion.idealAnswer}
                onChange={(e) => 
                  setLocalQuestion({...localQuestion, idealAnswer: e.target.value});
                }
                className="w-full p-3 border rounded-md border-gray-300"
                rows={4}
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(question)}
              className="ml-2 px-2"
            >
              Edit
            </Button>
            <Button
              onClick={saveQuestion}
              className="ml-2 px-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </Button>
            <Button
              variant="outline"
              onClick={() => onDiscard()}
              className="ml-2 px-2 px-4"
            >
              Discard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

## 3. Quiz Builder Interface

### 3.1 Quiz Configuration Screen
**Features**:
- Multiple question selection methods (individual, group, random selection)
- Global quiz settings (time limit, security settings)
- Preview functionality
- Access control (public/private with optional access code)
- Real-time preview dengan progress tracking

**Implementation**:
```typescript
// Quiz Builder Configuration Form
const QuizConfiguration: React.FC<{
  quiz: Partial<Quiz>;
  onQuizChange: (quiz: Partial<Quiz>) => void;
  onSave: () => Promise<void>;
  onPreview: () => void;
}> = ({ quiz, onQuizChange, onSave, onPreview }) => {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <CardHeader>
          <CardTitle>Quiz Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quiz Details */}
          <div className="space-y-4">
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={quiz.title}
              onChange={(e) => onQuizChange({ ...quiz, title: e.target.value })}
              className="w-full"
              placeholder="Enter quiz title..."
            />
            
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={quiz.description || ''}
              onChange={(e) => onQuizChange({ ...quiz, description: e.target.value })}
              className="w-full min-h-32"
              placeholder="Add quiz description..."
            />
          </div>
          
          {/* Security Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="enableAntiCopy">Anti-Copy Protection</Label>
                <Switch
                  id="enableAntiCopy"
                  checked={quiz.enableAntiCopy || true}
                  onCheckedChange={(checked) => 
                    onQuizChange({ ...quiz, enableAntiCopy: checked })
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showScore">Show Score to Participants</Label>
                <Switch
                  id="showScore"
                  checked={quiz.showScore || false}
                  onCheckedChange={(checked) => 
                    onQuizChange({ ...quiz, showScore: checked })
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  type="number"
                  id="maxAttempts"
                  value={quiz.maxAttempts || 1}
                  onChange={(e) => 
                    onQuizChange({ ...quiz, maxAttempts: parseInt(e.target.value) || 1 })
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  type="number"
                  id="timeLimit"
                  value={quiz.timeLimit ? quiz.timeLimit / 60 : ''}
                  onChange={(e) => 
                    onQuizChange({ ...quiz, timeLimit: e.target.value ? parseInt(e.target.value) * 60 : undefined })}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="allowRetake">Allow Retake</Label>
                <Switch
                  id="allowRetake"
                  checked={quiz.allowRetake || false}
                  onCheckedChange={(checked) => 
                    onQuizChange({ ...quiz, allowRetake: checked })
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="shuffleOptions">Shuffle Options</Label>
                <Switch
                  id="shuffleOptions"
                  checked={quiz.shuffleOptions || false}
                  onCheckedChange={(checked) => 
                    onQuizChange({ ...quiz, shuffleOptions: checked })
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <Button
              variant="outline"
              onClick={() => onPreview()}
              disabled={generatedQuestions.length === 0}
              className="ml-2 px-4"
            >
              Preview Quiz
            </Button>
            <Button
              onClick={onSave}
              disabled={!isFormValid()}
              className="ml-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Preview Modal */}
      {isPreview && (
        <Dialog open={isPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Quiz Preview</DialogTitle>
            </DialogHeader>
            <DialogContent>
              {/* Preview content akan dimuatkan di sini */}
              <QuizPreview questions={generatedQuestions} />
            </DialogContent>
            <DialogFooter>
              <Button
                onClick={() => setIsPreview(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </Dialog>
        </Dialog>
      )}
  );
};
```

### 3.2 Question Selection Interface
**Features**:
- Multiple selection methods (individual, group, random)
- Visual question cards dengan preview
- Drag and drop interface untuk question reordering
- Batch selection dengan checkboxes
- Real-time preview dari selected questions

**Implementation**:
```typescript
// Question Selection Component
const QuestionSelector: React.FC<{
  questions: Question[];
  selectedIds: string[];
  selectionMode: 'individual' | 'group' | 'random';
  availableQuestions: Question[];
  onSelectionChange: (selectedIds: string[]) => void;
  onSelectRandomQuestions: (count: number) => void;
}> = ({ questions, selectedIds, selectionMode, availableQuestions, onSelectionChange, onSelectRandomQuestions }) => {
  const [filteredQuestions] = getFilteredQuestions(availableQuestions, selectionMode, selectedIds);
  
  const handleSelectQuestion = (questionId: string) => {
    if (selectedIds.includes(questionId)) {
      setSelectedIds(prev => 
        prev.filter(id => id !== questionId)
      )});
    } else {
      setSelectedIds(prev => [...prev, questionId]);
    }
  };

  const handleSelectGroup = (groupId: string) => {
  const groupQuestions = availableQuestions.filter(q => q.questionGroupIds?.includes(groupId));
  setSelectedIds(groupQuestions.map(q => q.id));
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredQuestions.map((question) => (
        <div
          key={question.id}
          className={`p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
            selectedIds.includes(question.id) ? 'border-primary bg-primary text-primary' : ''
          }`}
          onClick={() => handleSelectQuestion(question.id)}
        >
          <QuestionPreview question={question} />
        </div>
      ))}
    </div>
  );
};

// Get filtered questions based on selection mode
const getFilteredQuestions = (
  questions: Question[],
  mode: 'individual' | 'group' | 'random',
  selectedIds: string[],
  groupId?: string
) => {
  if (mode === 'individual') {
    return questions.filter(q => selectedIds.includes(q.id));
  } else if (mode === 'group' && groupId) {
    return questions.filter(q => q.questionGroupIds?.includes(groupId));
  } else if (mode === 'random') {
    const count = Math.min(selectedIds.length || 5, 10);
      return getRandomQuestions(questions, count);
  }
  return questions;
};

const getRandomQuestions = (questions: Question[], count: number): Question[] => {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
```

### 3. Quiz Taking Interface
**Features**:
- Progress tracking dengan visual indicator
- Timer dengan countdown display
- Question display dengan anti-copy protection
- Answer submission dengan auto-save
- Completion screen dengan modern design
- Smooth transitions antar pergantian

**Implementation**:
```typescript
// Quiz Taking Interface
const QuizTakingInterface: React.FC<{
  quizId: string;
  sessionToken: string;
  completedAt?: Date;
  onAnswer: (answer: AnswerData) => void;
  onComplete: () => void;
}> = ({ quizId, sessionToken, completedAt, onAnswer, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [timer, setTimer] = useState(quiz.timeLimit * 60); // Convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return;
    
    const timerInterval = setInterval(() => {
      setTimer(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [timer, isCompleted]);

  // Auto-save answers
  useEffect(() => {
    if (answers.length > 0) {
      clearTimeout(timeoutRef);
      timeoutRef = setTimeout(() => {
        saveCurrentProgress();
      }, 2000);
    }
    }
  }, [answers.length, currentQuestionIndex]);

  const saveCurrentProgress = async () => {
    try {
      const updatedSession = await fetch(`/api/quiz/${quizId}/sessions/${sessionToken}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          answers: answers.map(a => ({
            questionId: a.questionId,
            selectedOptionId: a.selectedOptionId,
            textAnswer: a.textAnswer,
            timeSpent: a.timeSpent,
            answeredAt: a.answeredAt,
          })),
        }),
      });
      
      // Update UI to show progress
      setIsCompleted(true);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleAnswer = (answer: AnswerData) => {
    const updatedAnswers = [...answers, answer];
  const updatedScore = calculateTotalScore(updatedQuestions, updatedAnswers);
  
  // Set answers
  setAnswers(updatedAnswers);
  setTotalScore(updatedScore);
};

  const calculateTotalScore = (questions: Question[], answers: AnswerData[]): number => {
  return answers.reduce((total, answer) => {
    const question = questions.find(q => q.id === answer.questionId);
    return total + (question?.maxPoints || 0);
  });

  // Update progress
  const percentage = (currentQuestionIndex / questions.length) * 100;
  setProgress(percentage);
};
```

## 4. Advanced Scoring System

### 4.1 Per-Option Scoring
**Fitur**: Setiap pilihan memiliki nilai berbeda memberikan kebeberapa opsi
**Implementasi**:
```typescript
// Per-option scoring dalam model
interface Option {
  id: string;
  questionId: string;
  optionText: string;
  points: number; // Points untuk pilihan ini
  isCorrect: boolean;
  order: number;
  explanation?: string;
}

// Automatic scoring calculation
const calculateScore = (questions: Question[], answers: AnswerData[]): number => {
  let totalScore = 0;
  
  questions.forEach(question => {
    const answer = answers.find(a => a.questionId === question.id);
    if (answer) {
      totalScore += answer.earnedPoints;
    } else {
      totalScore += question.maxPoints;
    }
  });
  
  return totalScore;
};

// AI Scoring for essays
const scoreEssay = async (
  userAnswer: string,
  idealAnswer: string,
  maxPoints: number,
  maxScore: number
): Promise<number> => {
  const prompt = `
    Score this answer: ${userAnswer}
    Ideal Answer: ${idealAnswer}
    Maximum Score: ${maxScore}
    
    Provide JSON response:
    {
      "score": 0-${maxScore} (0-${maxScore}), // 0-100
      "feedback": "Feedback areas for improvement",
      "strengths": ["string"],
      "improvements": ["string"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [{ role: 'system', content: prompt }],
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return parseFloat(result.score) * maxScore;
  } catch (error) {
    console.error('AI scoring failed:', error);
    return 0;
  }
};
```

### 4.2 Hidden Score System
**Fitur**: Peserta tidak melihat skor setelah menyelesai kuis
**Implementasi**:
```typescript
// Backend - Admin hanya yang bisa melihat score
app.get('/api/quizzes/:id/results', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
}).then((res) => res.json());

// Frontend - Peserta hanya melihat completion message
const handleQuizComplete = async () => {
  const response = await fetch('/api/quizzes/:sessionId/complete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.success) {
    return {
      success: true,
      message: 'Quiz completed successfully'
    };
  }
  // Tampilkan peserta hanya completion message
  return {
    success: true,
    message: 'Quiz completed. Results will be available in your dashboard'
  };
};
```

## 5. Analytics Dashboard

### 5.1 Admin Analytics Overview
**Fitur**: Comprehensive analytics dashboard untuk monitoring performa platform usage

**Metrics yang ditampilkan**:
- Total quizzes dan participants
- Question usage statistics
- AI performance metrics
- Security event trends
- User engagement metrics
- Performance metrics

**Implementation**:
```typescript
// Analytics Dashboard Component
export const AnalyticsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview>({
    totalQuizzes: 0,
    totalParticipants: 0,
    totalQuestions: 0,
    averageScore: 0,
    totalSecurityEvents: 0,
    averageScore: 0,
    completionRate: 0,
  });

  useEffect(() => {
    loadAnalyticsOverview();
  }, []);

  const loadAnalyticsOverview = async () => {
    try {
      const [
        totalQuizzes,
        totalParticipants,
        totalQuestions,
        averageScore,
        totalSecurityEvents,
        completionRate
      ] = await Promise.all([
        prisma.quiz.count(),
        prisma.quizSession.count({ where: { completedAt: { not: null } }),
        prisma.question.count(),
        prisma.securityLog.count({ where: timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }),
        prisma.quizSession.findMany({
          where: { completedAt: { not: null },
          include: { user: true },
        }),
      ]);
      
      setOverview({
        totalQuizzes,
        totalParticipants,
        totalQuestions,
        averageScore,
        totalSecurityEvents,
        completionRate: completionRate ? (totalParticipants / totalParticipants) * 100 : 0,
        averageScore: averageScore,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalQuizzes}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalParticipants}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Questions in Bank</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalQuestions}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>AI Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {totalQuestions}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Security Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              {totalSecurityEvents}
            </CardContent>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              Recent security events requiring attention
            </AlertDescription>
          </Alert>
          </CardContent>
          <CardContent className="space-y-2">
            {recentSecurityAlerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>{alert.description}</AlertDescription>
              </div>
            ))}
          </CardContent>
        </Card>
    </div>
  );
};
```

### 5.2 Quiz Performance Analytics
```typescript
// Quiz Performance Analytics Component
export const QuizPerformanceAnalytics: React.FC<{ quizId: string }> = () => {
  const [analytics, setAnalytics] = useState<QuizAnalytics>({});
  const [period, setPeriod] = useState('7d'); // 7 days default

  useEffect(() => {
    loadQuizAnalytics(period);
  }, [period]);

  const loadQuizAnalytics = async (period: string) => {
    try {
      const [totalParticipants, completedSessions, averageScore, completionRate] = await Promise.all([
        prisma.quizSession.count({ where: { completedAt: { gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000,  }, 
          }), 
        prisma.quiz.count({ where: { createdAt: { gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000 } }, 
        prisma.quizSession.findMany({
          where: { completedAt: { gte: new Date.now() - parseInt(period) * 24 * 60 * 1000 }
        }),
        prisma.question.findMany({
          include: {
            options: true
          },
          where: { createdAt: { gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 1000 }
        })
      ]));
      
      setAnalytics({
        totalParticipants,
        completedSessions,
        averageScore: averageScore || 0,
        completionRate: completionRate || 0
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  }, [period]);
  
  const questionPerformance = await getQuestionPerformance(quizId);
  const userEngagementMetrics = await getUserEngagementMetrics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Quiz Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Score</span>
              <span className="text-2xl font-bold text-primary">
                {analytics.averageScore?.toFixed(1) || 'N/A'}
              </span>
            </div>
            </div>
          </CardContent>
        </Card>
      
      {/* Question Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Question Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Average Time per Question</span>
              <span className="text-2xl font-bold text-primary">
                {questionPerformance.averageTime?.toFixed(1)}s
              </span>
            </div>
          </CardContent>
        </Card>
      </Card>
      
      {/* User Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>User Engagement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Engaged Users</span>
              <span className="text-2xl font-bold text-primary">
                {userEngagementMetrics?.totalUsers || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </Card>
    </div>
  );
};
```

## 6. User Settings Management

### User Profile Settings
```typescript
// User Settings Component
export const UserSettings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light', // light, dark, system
    language: 'en',
    timezone: 'UTC',
    notifications: true,
    twoFactorEnabled: false,
    sessionTimeout: 3600, // 1 hour
  });

  const handleSettingsChange = async (newSettings: Partial<UserSettings>) => {
    await fetch('/api/user/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    });
    
    setSettings(newSettings);
    toast.success('Settings updated');
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">User Settings</h3>
      
      <div className="space-y-4">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <TabsContent value={settings.theme}>
          {/* General Settings */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value })}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}>
                <option value="en">English</option>
                <option value="id" > Indonesian</option>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="notifications">Email Notifications</Label>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="twoFactor">Two-Factor Auth</Label>
                <Switch
                  checked={settings.twoFactorEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, twoFactorEnabled: checked })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  type="number"
                  value={settings.sessionTimeout / 60}
                  min="1" max="120"
                  onValueChange={(value) => setSettings({ ...settings, sessionTimeout: value * 60 })}
                />
              </div>
            </div>
          </Tabs>
        </TabsContent>
      </Card>
    </div>
  );
};
```

## Testing & Quality Assurance

### Security Testing Strategy
```typescript
// Security Testing Suite
describe('Security Features', () => {
  describe('Text Selection Prevention', () => {
    it('should prevent text selection', async () => {
      const result = await renderWithSecurityProtection();
      expect(screen.getByText('This text should not be selectable')).toBe(false);
    });
  });
  
  describe('Copy/Paste Blocking', () => {
    it('should block copy attempts', async () => {
      const result = await renderWithSecurityProtection();
      expect(screen.getByText('Copying is disabled')).toBe(true));
      expect(document.execCommand('document.execCommand('copy')).toBe(false));
    });
  });
  
  describe('Right-Click Prevention', () => {
    it('should block right-click menu', async () => {
      const result = await renderWithSecurityProtection();
      expect(screen.getByText('Right-click is disabled')).toBe(true));
    });
  });
  
  describe('Print Prevention', () => {
    it('should block print attempts', async () => {
      const result = renderWithSecurityProtection();
      expect(window.print()).toBe(false));
      expect(window.print.toDataURL()).toBe('');
    });
  });
});
```

### Performance Testing
```typescript
// Performance Benchmark
describe('Performance', () => {
  const performance = await measurePerformance(() => 
    renderWithSecurityProtection()
  );
  
  expect(performance.first_render).toBeLessThan(100); // <100ms
  expect(performance.total_render).toBeLessThan(500); // <500ms
  expect(performance.total_render).toBeLessThan(50); // <50ms
  
  // Memory usage should be reasonable
  expect(performance.memory_usage_mb).toBeLessThan(50); // <50MB
});
});
```

### User Acceptance Testing
```typescript
// UAT Testing Strategy
export const userAcceptanceTesting = {
  // 1. User Onboarding Flow Test
  // 2. Quiz Creation Flow Test
  // 3. Quiz Taking Process Test
  // 4. Results Viewing Test
  
  it('should onboard successfully', async () => {
    const user = await createUser();
    const quiz = await createQuiz();
    const session = await startQuizSession(quiz.id);
    // Verify user can see dashboard
    const dashboard = await getUserDashboard(user.id);
    expect(dashboard).toBeDefined();
  });
  
  it('should handle quiz completion', async () => {
    const session = await startQuizSession(quiz.id);
    const completion = await completeQuizSession(session.id);
    const results = getQuizResults(quiz.id);
    expect(results).toBeDefined();
  });
};
```

## Implementation Priority

### Phase 1: Foundation (High Priority)
- [ ] Setup Next.js 15 project dengan TypeScript
- [ ] Setup shadcn/ui dengan modern components
- [ ] Configure backend Express.js dengan TypeScript
- [ ] Setup database dengan Prisma ORM
- [ ] Implement basic authentication system
- [ ] Setup security middleware

### Phase 2: Core Features (High Priority)
- [ ] Question Bank system dengan categories
- [ ] Quiz builder interface
- [ ] Basic quiz taking interface
- [ ] Per-option scoring system
- [ ] Hidden score system

### Phase 3: AI Integration (High Priority)
- [ ] GPT-5 integration dengan custom prompts
- [ ] Interactive AI chat interface
- [ ] Question generation dengan preview
- [ ] AI essay scoring system
- [ ] Template management

### Phase 4: Security & Analytics (High Priority)
- [ ] Anti-copy protection implementation
- [ ] Real-time security monitoring
- [ ] Analytics dashboard
- [ ] User management system
- [ ] Performance optimization

## Testing Strategy

### Security Focus
- **Automated Security Tests**: Continuous testing untuk semua security measures
- **Penetration Testing**: Regular security assessments
- **Load Testing**: Performansi load testing
- **User Acceptance Testing**: Verify user onboarding flow
- **API Security Testing**: Protect endpoints

### Performance Focus
- **Database Optimization**: Monitor query performance
- **Database Indexing**: Strategic index optimization
- **Memory Usage**: Monitor memory consumption
- **Response Times**: Keep API responses under 2 seconds
- **Bundle Size**: Optimize bundle size dengan PPR

### Data Integrity Focus
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Always use parameterized queries
- **Data Encryption**: Sensitive data encryption
- **Backups**: Regular automated backups
- **Data Consistency**: Referential integrity enforcement

This comprehensive documentation covers all major features with detailed implementation details, making it easy for developers to understand and implement each feature correctly. The architecture is designed with security and performance in mind, ensuring the platform can handle the scale requirements while maintaining security and user trust.
