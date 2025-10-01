import { ChatRepository, ChatMessage } from '../db/repositories/ChatRepository.js';
import { AgentService } from './AgentService.js';
import { BedrockAgentService } from './BedrockAgentService.js';
import { TransactionRepository } from '../db/repositories/TransactionRepository.js';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

export class ChatService {
  private chatRepo: ChatRepository;
  private agentService: AgentService | BedrockAgentService | null;
  private transactionRepo: TransactionRepository;

  constructor() {
    this.chatRepo = new ChatRepository(db);
    this.transactionRepo = new TransactionRepository(db);

    // Initialize AI service based on available configuration
    // Priority: AWS Bedrock > Direct Anthropic API > None
    this.agentService = null;

    try {
      // Try AWS Bedrock first if AWS region is configured
      if (config.aws.region) {
        this.agentService = new BedrockAgentService();
        console.log('ChatService: Using AWS Bedrock for AI features');
      }
      // Fall back to direct Anthropic API
      else if (config.anthropicApiKey) {
        this.agentService = new AgentService();
        console.log('ChatService: Using Direct Anthropic API for AI features');
      }
    } catch (error) {
      console.warn('ChatService: AI service not available:', error);
      this.agentService = null;
    }
  }

  async chat(message: string, sessionId?: string) {
    const sid = sessionId || uuidv4();

    // Check if AI service is available
    if (!this.agentService) {
      throw new Error('AI service is not configured. Please set up ANTHROPIC_API_KEY or AWS credentials.');
    }

    // Save user message
    await this.chatRepo.create({
      session_id: sid,
      role: 'user',
      content: message,
    });

    // Get conversation history
    const history = await this.chatRepo.findBySessionId(sid);

    // Build context from recent transactions
    const { transactions } = await this.transactionRepo.findAll({ limit: 100 });
    const context = `Recent transactions count: ${transactions.length}
Total spending: $${transactions.filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
Transaction data is available for detailed queries.`;

    // Get response from agent
    const response = await this.agentService.chat(message, context);

    // Save assistant response
    await this.chatRepo.create({
      session_id: sid,
      role: 'assistant',
      content: response,
    });

    return {
      sessionId: sid,
      response,
    };
  }

  async getSessions() {
    return this.chatRepo.findAllSessions();
  }

  async getSession(sessionId: string) {
    return this.chatRepo.findBySessionId(sessionId);
  }

  async deleteSession(sessionId: string) {
    const success = await this.chatRepo.deleteSession(sessionId);
    if (!success) {
      throw new Error('Session not found');
    }
    return { success: true };
  }
}
