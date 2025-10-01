import { Database } from '../database.js';

export interface ChatMessage {
  id?: number;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: string;
  created_at?: string;
}

export class ChatRepository {
  constructor(private db: Database) {}

  async create(message: ChatMessage): Promise<ChatMessage> {
    const result = await this.db.run(
      `INSERT INTO chat_messages (session_id, role, content, metadata)
       VALUES (?, ?, ?, ?)`,
      [message.session_id, message.role, message.content, message.metadata || null]
    );

    return { ...message, id: result.lastID };
  }

  async findBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return this.db.all(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );
  }

  async findAllSessions(): Promise<{ session_id: string; last_message: string; timestamp: string }[]> {
    return this.db.all(`
      SELECT
        session_id,
        content as last_message,
        created_at as timestamp
      FROM chat_messages
      WHERE id IN (
        SELECT MAX(id)
        FROM chat_messages
        GROUP BY session_id
      )
      ORDER BY created_at DESC
    `);
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    const result = await this.db.run('DELETE FROM chat_messages WHERE session_id = ?', [sessionId]);
    return result.changes > 0;
  }
}
