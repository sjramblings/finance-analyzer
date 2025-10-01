import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from root directory (two levels up from src/config.ts)
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),

  // AI Provider Configuration
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',

  // AWS Bedrock Configuration
  aws: {
    region: process.env.AWS_REGION || '',
    profile: process.env.AWS_PROFILE || '',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    sessionToken: process.env.AWS_SESSION_TOKEN || '',
  },

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
    origin: true,
    credentials: true,
  },
};
