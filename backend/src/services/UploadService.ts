import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { parserFactory } from '../parsers/ParserFactory.js';
import { TransactionRepository } from '../db/repositories/TransactionRepository.js';
import { CategoryService } from './CategoryService.js';
import { AgentService } from './AgentService.js';
import { BedrockAgentService } from './BedrockAgentService.js';
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
  private categoryService: CategoryService;
  private agentService: AgentService | BedrockAgentService | null;
  private jobs: Map<string, UploadJob> = new Map();

  constructor() {
    this.transactionRepo = new TransactionRepository(db);
    this.categoryService = new CategoryService();

    // Initialize AI service based on available configuration
    // Priority: AWS Bedrock > Direct Anthropic API > None
    this.agentService = null;

    try {
      // Try AWS Bedrock first if AWS region is configured
      if (config.aws.region) {
        this.agentService = new BedrockAgentService();
        console.log('Using AWS Bedrock for AI features');
      }
      // Fall back to direct Anthropic API
      else if (config.anthropicApiKey) {
        this.agentService = new AgentService();
        console.log('Using Direct Anthropic API for AI features');
      }
    } catch (error) {
      console.warn('AI service not available:', error);
      this.agentService = null;
    }
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
      const dbTransactions = transactions.map((t, index) => ({
        id: index, // Temporary ID for categorization
        date: t.date.toISOString().split('T')[0],
        description: t.description,
        amount: t.amount,
        transaction_type: t.type,
        merchant: t.merchant,
        original_description: t.originalDescription,
      }));

      // Try to categorize with AI if available
      if (this.agentService) {
        console.log(`📊 Starting AI categorization for ${dbTransactions.length} transactions`);
        try {
          const categories = await this.categoryService.getAllCategories();
          console.log(`📋 Available categories: ${categories.map(c => c.name).join(', ')}`);
          const categoryNames = categories.map(c => c.name);

          console.log('🤖 Calling AI service for categorization...');
          const categorized = await this.agentService.categorizeTransactions(
            dbTransactions,
            categoryNames
          );
          console.log(`✅ AI categorization complete: ${categorized.length} results`);

          // Apply categories to transactions
          let appliedCount = 0;
          for (const result of categorized) {
            const transaction = dbTransactions[result.transactionId];
            if (transaction) {
              const category = categories.find(c => c.name === result.suggestedCategory);
              if (category) {
                transaction.category_id = category.id;
                transaction.confidence_score = result.confidence;
                appliedCount++;
                console.log(`  ✓ ${transaction.description} → ${category.name} (${Math.round(result.confidence * 100)}%)`);
              } else {
                console.log(`  ⚠️ Category not found: ${result.suggestedCategory} for transaction ${result.transactionId}`);
              }
            }
          }
          console.log(`✅ Applied ${appliedCount} categories to transactions`);
        } catch (error) {
          console.error('❌ AI categorization failed:', error);
          // Continue without categorization
        }
      } else {
        console.log('⚠️ AI service not available - transactions will be uncategorized');
      }

      // Remove temporary IDs
      dbTransactions.forEach(t => delete t.id);

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
