/**
 * EduGenie Frontend API Client
 * Connects to EduGenie server endpoints with automatic URL resolution.
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  gemini_configured: boolean;
  timestamp: string;
}

export interface QAResponse {
  answer: string;
  error?: string;
}

export interface ExplanationResponse {
  answer: string;
  sections?: {
    definition: string;
    coreConcept: string;
    stepByStep: string[];
    practicalExample: string;
    importantPoints: string[];
    commonMistakes: string[];
    quickRecap: string;
  };
  error?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  error?: string;
}

export interface SummaryResponse {
  summary: string;
  sections?: {
    mainIdea: string;
    keyPoints: string[];
    importantTerms: Array<{ term: string; definition: string }>;
    importantFacts: string[];
    quickRevision: string;
  };
  error?: string;
}

export interface LearningRecommendation {
  stage: string;
  topicName: string;
  whyItMatters: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedLearningTime: string;
  suggestedNextTopic: string;
  keyLearningObjectives?: string[];
}

export interface RecommendationsResponse {
  recommendations: LearningRecommendation[];
  error?: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errMsg =
        data?.error ||
        data?.message ||
        `Request failed with status ${res.status}. Please try again.`;
      throw new Error(errMsg);
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Network error or server unavailable. Please check your connection.');
  }
}

export const api = {
  checkHealth: () => request<HealthResponse>('/health'),

  askQuestion: (text: string) =>
    request<QAResponse>('/qa', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  explainConcept: (text: string, level = 'beginner', preference = 'simple') =>
    request<ExplanationResponse>('/explain', {
      method: 'POST',
      body: JSON.stringify({ text, level, preference }),
    }),

  generateQuiz: (text: string, difficulty = 'medium') =>
    request<QuizResponse>('/quiz', {
      method: 'POST',
      body: JSON.stringify({ text, difficulty }),
    }),

  summarizeText: (text: string, length = 'medium') =>
    request<SummaryResponse>('/summarize', {
      method: 'POST',
      body: JSON.stringify({ text, length }),
    }),

  getRecommendations: (
    topic: string,
    level = 'beginner',
    goal = 'skill development',
    study_time = '30 minutes/day'
  ) =>
    request<RecommendationsResponse>('/learn/recommendations', {
      method: 'POST',
      body: JSON.stringify({ topic, level, goal, study_time }),
    }),
};
