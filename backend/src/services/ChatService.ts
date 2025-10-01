import { ChatRepository, ChatMessage } from '../db/repositories/ChatRepository.js';
import { AgentService } from './AgentService.js';
import { TransactionRepository } from '../db/repositories/TransactionRepository.js';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export class ChatService {
  private chatRepo: ChatRepository;
  private agentService: AgentService;
  private transactionRepo: TransactionRepository;

  constructor() {
    this.chatRepo = new ChatRepository(db);
    this.agentService = new AgentService();
    this.transactionRepo = new TransactionRepository(db);
  }

  async chat(message: string, sessionId?: string) {
    const sid = sessionId || uuidv4();

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
