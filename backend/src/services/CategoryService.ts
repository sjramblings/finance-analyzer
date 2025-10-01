import { CategoryRepository, Category } from '../db/repositories/CategoryRepository.js';
import { db } from '../db/database.js';

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository(db);
  }

  async getAllCategories() {
    return this.categoryRepo.findAll();
  }

  async getCategoryById(id: number) {
    const category = await this.categoryRepo.findById(id);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async createCategory(category: Category) {
    // Check if category already exists
    const existing = await this.categoryRepo.findByName(category.name);
    if (existing) {
      throw new Error('Category with this name already exists');
    }

    return this.categoryRepo.create(category);
  }

  async updateCategory(id: number, updates: Partial<Category>) {
    const category = await this.categoryRepo.update(id, updates);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  async deleteCategory(id: number) {
    const success = await this.categoryRepo.delete(id);
    if (!success) {
      throw new Error('Category not found or is a system category');
    }
    return { success: true };
  }
}
