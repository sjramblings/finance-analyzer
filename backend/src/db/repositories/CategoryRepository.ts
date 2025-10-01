import { Database } from '../database.js';

export interface Category {
  id?: number;
  name: string;
  parent_id?: number;
  icon?: string;
  color?: string;
  budget_amount?: number;
  is_system?: boolean;
  created_at?: string;
  updated_at?: string;
}

export class CategoryRepository {
  constructor(private db: Database) {}

  async create(category: Category): Promise<Category> {
    const result = await this.db.run(
      `INSERT INTO categories (name, parent_id, icon, color, budget_amount, is_system)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category.name,
        category.parent_id || null,
        category.icon || null,
        category.color || null,
        category.budget_amount || null,
        category.is_system || 0,
      ]
    );

    return { ...category, id: result.lastID };
  }

  async findAll(): Promise<Category[]> {
    return this.db.all('SELECT * FROM categories ORDER BY name');
  }

  async findById(id: number): Promise<Category | undefined> {
    return this.db.get('SELECT * FROM categories WHERE id = ?', [id]);
  }

  async findByName(name: string): Promise<Category | undefined> {
    return this.db.get('SELECT * FROM categories WHERE name = ?', [name]);
  }

  async update(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const fields = Object.keys(updates)
      .filter((key) => updates[key as keyof Category] !== undefined)
      .map((key) => `${key} = ?`);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const values = Object.values(updates).filter((val) => val !== undefined);

    await this.db.run(
      `UPDATE categories SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.run('DELETE FROM categories WHERE id = ? AND is_system = 0', [id]);
    return result.changes > 0;
  }
}
