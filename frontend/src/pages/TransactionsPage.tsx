import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { transactionsApi, categoriesApi } from '../lib/api';
import { Transaction, TransactionFilter } from '../types/transaction';
import { Category } from '../types/category';
import { formatCurrency, formatDate } from '../lib/utils';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [txData, catData] = await Promise.all([
        transactionsApi.getAll(filter),
        categoriesApi.getAll()
      ]);
      setTransactions(txData.transactions || []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      setTransactions([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setFilter(prev => ({
      ...prev,
      category: value ? parseInt(value) : undefined
    }));
  };

  const handleSearch = () => {
    setFilter(prev => ({
      ...prev,
      search: searchTerm || undefined
    }));
  };

  const getCategoryName = (categoryId?: number) => {
    if (!categoryId) return 'Uncategorized';
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getCategoryIcon = (categoryId?: number) => {
    if (!categoryId) return '❓';
    return categories.find(c => c.id === categoryId)?.icon || '❓';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground mt-2">View and manage your transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>Search and filter your transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search merchant or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </Select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No transactions yet. Upload a CSV file to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {formatDate(transaction.date)}
                    </TableCell>
                    <TableCell>{transaction.merchant}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1">
                        <span>{getCategoryIcon(transaction.categoryId)}</span>
                        <span>{getCategoryName(transaction.categoryId)}</span>
                      </span>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
