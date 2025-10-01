import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { budgetApi, categoriesApi } from '../lib/api';
import { Budget, BudgetStatus } from '../types/budget';
import { Category } from '../types/category';
import { formatCurrency, getPercentage } from '../lib/utils';

export function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetStatus[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'weekly' | 'yearly'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetData, catData] = await Promise.all([
        budgetApi.getActive(),
        categoriesApi.getAll()
      ]);
      setBudgets(budgetData);
      setCategories(catData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await budgetApi.create({
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        period: formData.period
      });
      setFormData({ categoryId: '', amount: '', period: 'monthly' });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.icon || '❓';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Budget</h1>
          <p className="text-muted-foreground mt-2">Set and track spending limits by category</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Budget'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Budget</CardTitle>
            <CardDescription>Set a spending limit for a category</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <Select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </Select>
              </div>
              <Button type="submit" className="w-full">Create Budget</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Active Budgets</CardTitle>
          <CardDescription>Track your spending against budget goals</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No budgets set yet. Click "Add Budget" to create your first budget.
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.map((budget) => {
                const percentage = getPercentage(budget.spent, budget.amount);
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCategoryIcon(budget.categoryId)}</span>
                          <h3 className="font-semibold">{getCategoryName(budget.categoryId)}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">
                          {budget.period} budget
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </p>
                        <p className={`text-sm ${
                          percentage >= 100 ? 'text-red-600' :
                          percentage >= 80 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {percentage.toFixed(0)}% used
                        </p>
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={Math.min(percentage, 100)} />
                      <div
                        className={`absolute top-0 left-0 h-full transition-all ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(budget.remaining)} remaining</span>
                      {percentage >= 100 && (
                        <span className="text-red-600 font-medium">
                          Over by {formatCurrency(budget.spent - budget.amount)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
