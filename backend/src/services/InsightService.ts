import { InsightRepository, Insight } from '../db/repositories/InsightRepository.js';
import { AgentService } from './AgentService.js';
import { BedrockAgentService } from './BedrockAgentService.js';
import { TransactionRepository, TransactionFilter } from '../db/repositories/TransactionRepository.js';
import { db } from '../db/database.js';
import { config } from '../config.js';

export class InsightService {
  private insightRepo: InsightRepository;
  private transactionRepo: TransactionRepository;
  private agentService: AgentService | BedrockAgentService | null;

  constructor() {
    this.insightRepo = new InsightRepository(db);
    this.transactionRepo = new TransactionRepository(db);

    // Initialize AI service based on available configuration
    // Priority: AWS Bedrock > Direct Anthropic API > None
    this.agentService = null;

    try {
      // Try AWS Bedrock first if AWS region is configured
      if (config.aws.region) {
        this.agentService = new BedrockAgentService();
        console.log('InsightService: Using AWS Bedrock for AI features');
      }
      // Fall back to direct Anthropic API
      else if (config.anthropicApiKey) {
        this.agentService = new AgentService();
        console.log('InsightService: Using Direct Anthropic API for AI features');
      }
    } catch (error) {
      console.warn('InsightService: AI service not available:', error);
      this.agentService = null;
    }
  }

  async getAllInsights(dismissed?: boolean) {
    return this.insightRepo.findAll(dismissed);
  }

  async generateInsights() {
    // Check if AI service is available
    if (!this.agentService) {
      throw new Error('AI service is not configured. Please set up ANTHROPIC_API_KEY or AWS credentials.');
    }

    // Get all transactions to analyze
    const { transactions } = await this.transactionRepo.findAll({});

    if (transactions.length === 0) {
      throw new Error('No transactions found. Please upload transactions first.');
    }

    // Get date range from actual transactions
    const dates = transactions.map(t => new Date(t.date).getTime());
    const startDate = new Date(Math.min(...dates)).toISOString().split('T')[0];
    const endDate = new Date(Math.max(...dates)).toISOString().split('T')[0];

    // Use agent to analyze spending
    const analysis = await this.agentService.analyzeSpending(startDate, endDate, transactions);

    const insights: Insight[] = [];

    // Create insights from subscriptions
    if (analysis.subscriptions) {
      for (const sub of analysis.subscriptions.slice(0, 5)) {
        insights.push({
          type: 'recommendation',
          title: `Subscription: ${sub.merchant}`,
          description: `You have a ${sub.frequency} subscription for $${sub.amount}`,
          priority: 1,
        });
      }
    }

    // Create insights from anomalies
    if (analysis.anomalies) {
      for (const anomaly of analysis.anomalies.slice(0, 3)) {
        insights.push({
          type: 'anomaly',
          title: 'Unusual Transaction Detected',
          description: anomaly.reason,
          priority: 2,
          metadata: JSON.stringify({ transactionId: anomaly.transactionId }),
        });
      }
    }

    // Create insights from trends
    if (analysis.trends) {
      for (const trend of analysis.trends.slice(0, 3)) {
        insights.push({
          type: 'trend',
          title: `${trend.category} Spending Trend`,
          description: `${trend.category} spending is ${trend.trend} by ${trend.percentage}%`,
          priority: 1,
        });
      }
    }

    // Create insights from recommendations
    if (analysis.recommendations) {
      for (const rec of analysis.recommendations.slice(0, 3)) {
        insights.push({
          type: 'recommendation',
          title: 'Savings Opportunity',
          description: rec,
          priority: 1,
        });
      }
    }

    // Save insights to database
    const savedInsights = [];
    for (const insight of insights) {
      const saved = await this.insightRepo.create(insight);
      savedInsights.push(saved);
    }

    return {
      generated: savedInsights.length,
      insights: savedInsights,
    };
  }

  async dismissInsight(id: number) {
    const success = await this.insightRepo.dismiss(id);
    if (!success) {
      throw new Error('Insight not found');
    }
    return { success: true };
  }

  async deleteInsight(id: number) {
    const success = await this.insightRepo.delete(id);
    if (!success) {
      throw new Error('Insight not found');
    }
    return { success: true };
  }

  async cleanupExpired() {
    const count = await this.insightRepo.deleteExpired();
    return { deleted: count };
  }
}
