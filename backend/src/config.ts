import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from root directory (two levels up from src/config.ts)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  database: {
    path: process.env.DB_PATH || path.join(__dirname, '../../data/transactions.db'),
  },
  upload: {
    dir: process.env.UPLOAD_DIR || path.join(__dirname, '../../data/uploads'),
    maxSize: parseInt(process.env.MAX_UPLOAD_SIZE || '10485760', 10), // 10MB
  },
  reports: {
    dir: process.env.REPORTS_DIR || path.join(__dirname, '../../data/reports'),
  },
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost:5173',
      'http://localhost:5174',
    ],
  },
};
