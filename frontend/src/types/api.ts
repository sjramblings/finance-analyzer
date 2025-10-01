export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
  success?: boolean;
}

export interface UploadJob {
  id: string;
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_transactions?: number;
  processed_transactions?: number;
  bank_format?: string;
  error_message?: string;
  transactions?: any[];
}

export interface Insight {
  id?: number;
  type: 'anomaly' | 'trend' | 'recommendation' | 'alert';
  title: string;
  description?: string;
  priority?: number;
  metadata?: string;
  is_dismissed?: boolean;
  is_read?: boolean;
  created_at?: string;
  expires_at?: string;
}

export interface ChatMessage {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: string;
  created_at?: string;
}

export interface ChatSession {
  session_id: string;
  last_message: string;
  timestamp: string;
}
