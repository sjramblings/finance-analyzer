import { Database } from '../database.js';

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

export class InsightRepository {
  constructor(private db: Database) {}

  async create(insight: Insight): Promise<Insight> {
    const result = await this.db.run(
      `INSERT INTO insights (type, title, description, priority, metadata, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        insight.type,
        insight.title,
        insight.description || null,
        insight.priority || 0,
        insight.metadata || null,
        insight.expires_at || null,
      ]
    );

    return { ...insight, id: result.lastID };
  }

  async findAll(dismissed?: boolean): Promise<Insight[]> {
    if (dismissed !== undefined) {
      return this.db.all('SELECT * FROM insights WHERE is_dismissed = ? ORDER BY created_at DESC', [
        dismissed ? 1 : 0,
      ]);
    }
    return this.db.all('SELECT * FROM insights ORDER BY created_at DESC');
  }

  async findById(id: number): Promise<Insight | undefined> {
    return this.db.get('SELECT * FROM insights WHERE id = ?', [id]);
  }

  async dismiss(id: number): Promise<boolean> {
    const result = await this.db.run('UPDATE insights SET is_dismissed = 1 WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async markAsRead(id: number): Promise<boolean> {
    const result = await this.db.run('UPDATE insights SET is_read = 1 WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM insights WHERE id = ?', [id]);
    return result.changes > 0;
  }

  async deleteExpired(): Promise<number> {
    const result = await this.db.run(
      'DELETE FROM insights WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP'
    );
    return result.changes;
  }
}
