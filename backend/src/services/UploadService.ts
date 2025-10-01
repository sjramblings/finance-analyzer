import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { parserFactory } from '../parsers/ParserFactory.js';
import { TransactionRepository } from '../db/repositories/TransactionRepository.js';
import { db } from '../db/database.js';
import { config } from '../config.js';

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

export class UploadService {
  private transactionRepo: TransactionRepository;
  private jobs: Map<string, UploadJob> = new Map();

  constructor() {
    this.transactionRepo = new TransactionRepository(db);
  }

  async processCSV(filename: string, filePath: string): Promise<string> {
    const jobId = uuidv4();

    const job: UploadJob = {
      id: jobId,
      filename,
      status: 'pending',
    };

    this.jobs.set(jobId, job);

    // Process asynchronously
    this.processFile(jobId, filePath).catch((error) => {
      job.status = 'failed';
      job.error_message = error.message;
    });

    return jobId;
  }

  private async processFile(jobId: string, filePath: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      job.status = 'processing';

      // Read CSV file
      const csvContent = await fs.readFile(filePath, 'utf-8');

      // Parse CSV
      const { parser, transactions } = parserFactory.parseCSV(csvContent);

      job.bank_format = parser;
      job.total_transactions = transactions.length;
      job.processed_transactions = 0;

      // Convert parsed transactions to database format
      const dbTransactions = transactions.map((t) => ({
        date: t.date.toISOString().split('T')[0],
        description: t.description,
        amount: t.amount,
        transaction_type: t.type,
        merchant: t.merchant,
        original_description: t.originalDescription,
      }));

      job.transactions = dbTransactions;
      job.processed_transactions = transactions.length;
      job.status = 'completed';

      // Clean up uploaded file
      await fs.unlink(filePath).catch(() => {});
    } catch (error: any) {
      job.status = 'failed';
      job.error_message = error.message;
    }
  }

  async getJobStatus(jobId: string): Promise<UploadJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Upload job not found');
    }
    return job;
  }

  async confirmUpload(jobId: string, corrections?: { transactionId: number; categoryId: number }[]) {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error('Upload job not found');
    }

    if (job.status !== 'completed') {
      throw new Error('Upload job is not completed');
    }

    if (!job.transactions) {
      throw new Error('No transactions to save');
    }

    // Apply corrections if provided
    if (corrections) {
      for (const correction of corrections) {
        const transaction = job.transactions[correction.transactionId];
        if (transaction) {
          transaction.category_id = correction.categoryId;
          transaction.manually_categorized = true;
        }
      }
    }

    // Save transactions to database
    const count = await this.transactionRepo.bulkCreate(job.transactions);

    // Clean up job
    this.jobs.delete(jobId);

    return {
      success: true,
      savedCount: count,
    };
  }
}
