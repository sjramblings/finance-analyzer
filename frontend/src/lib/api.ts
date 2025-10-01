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

// Add response interceptor to unwrap data
api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

// Transactions
export const transactionsApi = {
  getAll: (filter?: TransactionFilter) =>
    api.get('/transactions', { params: filter }) as Promise<TransactionsResponse>,

  getById: (id: number) =>
    api.get(`/transactions/${id}`) as Promise<Transaction>,

  getStats: (startDate?: string, endDate?: string) =>
    api.get('/transactions/stats', { params: { startDate, endDate } }) as Promise<TransactionStats>,

  update: (id: number, data: Partial<Transaction>) =>
    api.put(`/transactions/${id}`, data) as Promise<Transaction>,

  updateCategory: (id: number, categoryId: number) =>
    api.put(`/transactions/${id}/category`, { category_id: categoryId }) as Promise<Transaction>,

  delete: (id: number) =>
    api.delete(`/transactions/${id}`),
};

// Categories
export const categoriesApi = {
  getAll: () =>
    api.get('/categories') as Promise<Category[]>,

  getById: (id: number) =>
    api.get(`/categories/${id}`) as Promise<Category>,

  create: (data: Category) =>
    api.post('/categories', data) as Promise<Category>,

  update: (id: number, data: Partial<Category>) =>
    api.put(`/categories/${id}`, data) as Promise<Category>,

  delete: (id: number) =>
    api.delete(`/categories/${id}`),
};

// Upload
export const uploadApi = {
  uploadCSV: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }) as Promise<{ jobId: string; transactionsCount: number }>;
  },

  getJobStatus: (jobId: string) =>
    api.get(`/upload/${jobId}/status`) as Promise<UploadJob>,

  confirmUpload: (jobId: string, corrections?: { transactionId: number; categoryId: number }[]) =>
    api.post(`/upload/${jobId}/confirm`, { corrections }),
};

// Budget
export const budgetApi = {
  getAll: () =>
    api.get('/budget') as Promise<Budget[]>,

  getActive: () =>
    api.get('/budget/active') as Promise<BudgetStatus[]>,

  getStatus: (month?: string) =>
    api.get('/budget/status', { params: { month } }) as Promise<BudgetStatus>,

  create: (data: { categoryId: number; amount: number; period: string }) =>
    api.post('/budget', data) as Promise<Budget>,

  update: (categoryId: number, amount: number, period: 'monthly' | 'quarterly' | 'yearly') =>
    api.put(`/budget/${categoryId}`, { amount, period }) as Promise<Budget>,

  delete: (id: number) =>
    api.delete(`/budget/${id}`),
};

// Insights
export const insightsApi = {
  getAll: (dismissed?: boolean) =>
    api.get('/insights', { params: { dismissed } }) as Promise<Insight[]>,

  generate: (days?: number) =>
    api.post('/insights/generate', { days }) as Promise<{ generated: number; insights: Insight[] }>,

  dismiss: (id: number) =>
    api.put(`/insights/${id}/dismiss`),

  delete: (id: number) =>
    api.delete(`/insights/${id}`),
};

// Chat
export const chatApi = {
  createSession: () =>
    api.post('/chat/sessions') as Promise<ChatSession>,

  sendMessage: (sessionId: number, message: string) =>
    api.post('/chat', { message, sessionId }) as Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }>,

  getSessions: () =>
    api.get('/chat/sessions') as Promise<ChatSession[]>,

  getMessages: (sessionId: number) =>
    api.get(`/chat/sessions/${sessionId}`) as Promise<ChatMessage[]>,

  deleteSession: (sessionId: number) =>
    api.delete(`/chat/sessions/${sessionId}`),
};

export default api;
