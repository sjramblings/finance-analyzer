import axios from 'axios';
import type { Transaction, TransactionFilter, TransactionsResponse, TransactionStats } from '../types/transaction';
import type { Category } from '../types/category';
import type { Budget, BudgetStatus } from '../types/budget';
import type { UploadJob, Insight, ChatMessage, ChatSession } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transactions
export const transactionsApi = {
  getAll: (filter?: TransactionFilter) =>
    api.get<TransactionsResponse>('/transactions', { params: filter }),

  getById: (id: number) =>
    api.get<Transaction>(`/transactions/${id}`),

  getStats: (startDate?: string, endDate?: string) =>
    api.get<TransactionStats>('/transactions/stats', { params: { startDate, endDate } }),

  update: (id: number, data: Partial<Transaction>) =>
    api.put<Transaction>(`/transactions/${id}`, data),

  updateCategory: (id: number, categoryId: number) =>
    api.put<Transaction>(`/transactions/${id}/category`, { category_id: categoryId }),

  delete: (id: number) =>
    api.delete(`/transactions/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>('/categories'),

  getById: (id: number) =>
    api.get<Category>(`/categories/${id}`),

  create: (data: Category) =>
    api.post<Category>('/categories', data),

  update: (id: number, data: Partial<Category>) =>
    api.put<Category>(`/categories/${id}`, data),

  delete: (id: number) =>
    api.delete(`/categories/${id}`),
};

// Upload
export const uploadApi = {
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ jobId: string }>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  getJobStatus: (jobId: string) =>
    api.get<UploadJob>(`/upload/${jobId}/status`),

  confirmUpload: (jobId: string, corrections?: { transactionId: number; categoryId: number }[]) =>
    api.post(`/upload/${jobId}/confirm`, { corrections }),
};

// Budget
export const budgetApi = {
  getAll: () =>
    api.get<Budget[]>('/budget'),

  getActive: () =>
    api.get<BudgetStatus[]>('/budget/active'),

  getStatus: (month?: string) =>
    api.get<BudgetStatus>('/budget/status', { params: { month } }),

  create: (data: { categoryId: number; amount: number; period: string }) =>
    api.post<Budget>('/budget', data),

  update: (categoryId: number, amount: number, period: 'monthly' | 'quarterly' | 'yearly') =>
    api.put<Budget>(`/budget/${categoryId}`, { amount, period }),

  delete: (id: number) =>
    api.delete(`/budget/${id}`),
};

// Insights
export const insightsApi = {
  getAll: (dismissed?: boolean) =>
    api.get<Insight[]>('/insights', { params: { dismissed } }),

  generate: () =>
    api.post<{ generated: number; insights: Insight[] }>('/insights/generate'),

  dismiss: (id: number) =>
    api.put(`/insights/${id}/dismiss`),

  delete: (id: number) =>
    api.delete(`/insights/${id}`),
};

// Chat
export const chatApi = {
  createSession: () =>
    api.post<ChatSession>('/chat/sessions'),

  sendMessage: (sessionId: number, message: string) =>
    api.post<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>('/chat', { message, sessionId }),

  getSessions: () =>
    api.get<ChatSession[]>('/chat/sessions'),

  getMessages: (sessionId: number) =>
    api.get<ChatMessage[]>(`/chat/sessions/${sessionId}`),

  deleteSession: (sessionId: number) =>
    api.delete(`/chat/sessions/${sessionId}`),
};

export default api;
