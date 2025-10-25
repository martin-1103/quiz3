import { ApiResponse } from '../types';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}/api/v1${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle token refresh
        if (response.status === 401 && typeof window !== 'undefined') {
          await this.refreshToken();
          // Retry the request with new token
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${newToken}`,
            };
            const retryResponse = await fetch(`${this.baseURL}/api/v1${endpoint}`, config);
            return await retryResponse.json();
          }
        }
        throw data;
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshToken(): Promise<void> {
    if (typeof window === 'undefined') return;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return;

    try {
      const response = await fetch(`${this.baseURL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          localStorage.setItem('accessToken', data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
      } else {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Question bank methods
  async getQuestionBanks(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/question-banks${queryString}`);
  }

  async createQuestionBank(data: any) {
    return this.request('/question-banks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestionBank(id: string, data: any) {
    return this.request(`/question-banks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestionBank(id: string) {
    return this.request(`/question-banks/${id}`, {
      method: 'DELETE',
    });
  }

  // Question methods
  async getQuestions(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/questions${queryString}`);
  }

  async createQuestion(data: any) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(id: string, data: any) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  async searchQuestions(data: any) {
    return this.request('/questions/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Quiz methods
  async getQuizzes(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/quizzes${queryString}`);
  }

  async createQuiz(data: any) {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuiz(id: string, data: any) {
    return this.request(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuiz(id: string) {
    return this.request(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  async startQuizSession(quizId: string) {
    return this.request(`/quizzes/${quizId}/start`, {
      method: 'POST',
    });
  }

  async submitAnswer(sessionToken: string, data: any) {
    return this.request(`/quizzes/sessions/${sessionToken}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completeQuiz(sessionToken: string) {
    return this.request(`/quizzes/sessions/${sessionToken}/complete`, {
      method: 'POST',
    });
  }

  // AI methods
  async chat(data: any) {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateQuestions(data: any) {
    return this.request('/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async improveQuestion(id: string, data: any) {
    return this.request(`/ai/improve-question/${id}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async scoreEssay(data: any) {
    return this.request('/ai/score-essay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics methods
  async getOverview() {
    return this.request('/analytics/overview');
  }

  async getQuizPerformance(quizId: string) {
    return this.request(`/analytics/quizzes/${quizId}/performance`);
  }

  async getSecurityEvents(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/analytics/security/events${queryString}`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;
