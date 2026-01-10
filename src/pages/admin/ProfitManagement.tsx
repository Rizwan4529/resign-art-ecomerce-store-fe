import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, Calendar, PieChart as PieChartIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetProfitSummaryQuery,
  useGetDetailedProfitReportQuery,
  useGetExpensesQuery,
  useAddExpenseMutation,
  useGetExpensesByCategoryQuery,
  useGetBudgetsQuery,
  useSetBudgetMutation,
} from '../../services/api/profitApi';
import { extractErrorMessage } from '../../utils/authHelpers';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EXPENSE_CATEGORIES = [
  'RAW_MATERIALS',
  'PACKAGING',
  'SHIPPING',
  'MARKETING',
  'UTILITIES',
  'EQUIPMENT',
  'SALARIES',
  'RENT',
  'MISCELLANEOUS',
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

export const ProfitManagement = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSetBudgetOpen, setIsSetBudgetOpen] = useState(false);

  // Date range for profit summary
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // Queries
  const { data: profitSummary, isLoading: loadingSummary } = useGetProfitSummaryQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  const { data: detailedReport, isLoading: loadingDetailed } = useGetDetailedProfitReportQuery({
    year: selectedYear,
  });

  const { data: expensesData, isLoading: loadingExpenses } = useGetExpensesQuery({
    page: 1,
    limit: 10,
  });

  const { data: categoryBreakdown } = useGetExpensesByCategoryQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  const { data: budgetsData } = useGetBudgetsQuery({
    month: selectedMonth,
    year: selectedYear,
  });

  // Mutations
  const [addExpense, { isLoading: isAddingExpense }] = useAddExpenseMutation();
  const [setBudget, { isLoading: isSettingBudget }] = useSetBudgetMutation();

  // Form states
  const [expenseForm, setExpenseForm] = useState({
    category: 'RAW_MATERIALS',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    receiptUrl: '',
    isRecurring: false,
  });

  const [budgetForm, setBudgetForm] = useState({
    category: 'RAW_MATERIALS',
    limitAmount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  // Reset forms
  const resetExpenseForm = () => {
    setExpenseForm({
      category: 'RAW_MATERIALS',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      receiptUrl: '',
      isRecurring: false,
    });
  };

  const resetBudgetForm = () => {
    setBudgetForm({
      category: 'RAW_MATERIALS',
      limitAmount: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  // Handle add expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!expenseForm.description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    if (expenseForm.amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    try {
      await addExpense(expenseForm).unwrap();
      toast.success('Expense added successfully!');
      setIsAddExpenseOpen(false);
      resetExpenseForm();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Handle set budget
  const handleSetBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (budgetForm.limitAmount <= 0) {
      toast.error('Budget limit must be greater than 0');
      return;
    }

    try {
      await setBudget(budgetForm).unwrap();
      toast.success('Budget set successfully!');
      setIsSetBudgetOpen(false);
      resetBudgetForm();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get status badge color
  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-green-500 text-white';
      case 'WARNING':
        return 'bg-yellow-500 text-black';
      case 'EXCEEDED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profit Management</h2>
          <p className="text-muted-foreground">Monitor income, expenses, and profit margins</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddExpenseOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
          <Button variant="outline" onClick={() => setIsSetBudgetOpen(true)}>
            <Calendar className="w-4 h-4 mr-2" />
            Set Budget
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-6">
          {/* Date Range Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {profitSummary?.data && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(profitSummary.data.totalIncome)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profitSummary.data.orderCount} orders
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(profitSummary.data.totalExpenses)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${profitSummary.data.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatCurrency(profitSummary.data.netProfit)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {profitSummary.data.profitMargin.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expense Breakdown by Category */}
          {categoryBreakdown?.data && categoryBreakdown.data.byCategory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>
                  {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryBreakdown.data.byCategory}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(entry) => `${entry.category.replace('_', ' ')}: ${entry.percentage.toFixed(1)}%`}
                    >
                      {categoryBreakdown.data.byCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Detailed Report Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Label htmlFor="year">Select Year</Label>
              <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {detailedReport?.data && (
            <>
              {/* Yearly Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Yearly Summary - {detailedReport.data.year}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Income</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(detailedReport.data.yearly.income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(detailedReport.data.yearly.expenses)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Profit</p>
                      <p className={`text-2xl font-bold ${detailedReport.data.yearly.profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(detailedReport.data.yearly.profit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {detailedReport.data.yearly.profitMargin.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Profit Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={detailedReport.data.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke="#10b981" name="Income" strokeWidth={2} />
                      <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
                      <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Breakdown Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Income</TableHead>
                        <TableHead>Expenses</TableHead>
                        <TableHead>Profit</TableHead>
                        <TableHead>Orders</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailedReport.data.monthly.map((month) => (
                        <TableRow key={month.month}>
                          <TableCell className="font-medium">{month.monthName}</TableCell>
                          <TableCell className="text-green-600">{formatCurrency(month.income)}</TableCell>
                          <TableCell className="text-red-600">{formatCurrency(month.expenses)}</TableCell>
                          <TableCell className={month.profit >= 0 ? 'text-blue-600' : 'text-red-600'}>
                            {formatCurrency(month.profit)}
                          </TableCell>
                          <TableCell>{month.orderCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Track all business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingExpenses ? (
                <div className="text-center py-8">Loading expenses...</div>
              ) : expensesData?.data && expensesData.data.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Recurring</TableHead>
                        <TableHead>Added By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expensesData.data.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{expense.category.replace('_', ' ')}</Badge>
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>{expense.isRecurring ? 'Yes' : 'No'}</TableCell>
                          <TableCell>{expense.admin.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {expensesData.summary && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Expenses</p>
                      <p className="text-2xl font-bold">{formatCurrency(expensesData.summary.totalAmount)}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No expenses found</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="budgetMonth">Month</Label>
                  <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(12)].map((_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="budgetYear">Year</Label>
                  <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026].map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget Status</CardTitle>
              <CardDescription>
                {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {budgetsData?.data && budgetsData.data.length > 0 ? (
                <div className="space-y-4">
                  {budgetsData.data.map((budget) => (
                    <div key={budget.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{budget.category.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            Budget: {formatCurrency(budget.limitAmount)}
                          </p>
                        </div>
                        <Badge className={getBudgetStatusColor(budget.status)}>{budget.status}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Spent: {formatCurrency(budget.spent)}</span>
                          <span>Remaining: {formatCurrency(budget.remaining)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              budget.percentage >= 100
                                ? 'bg-red-600'
                                : budget.percentage >= 80
                                ? 'bg-yellow-500'
                                : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">{budget.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No budgets set for this period</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Expense Dialog */}
      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
            <DialogDescription>Record a new business expense</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddExpense}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Amount (PKR)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Describe the expense..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={expenseForm.isRecurring}
                  onChange={(e) => setExpenseForm({ ...expenseForm, isRecurring: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium">
                  Recurring expense
                </label>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  resetExpenseForm();
                }}
                disabled={isAddingExpense}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingExpense}>
                {isAddingExpense ? 'Adding...' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Set Budget Dialog */}
      <Dialog open={isSetBudgetOpen} onOpenChange={setIsSetBudgetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Budget Limit</DialogTitle>
            <DialogDescription>Set spending limit for a category</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetBudget}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="budgetCategory">Category</Label>
                <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="limitAmount">Budget Limit (PKR)</Label>
                <Input
                  id="limitAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budgetForm.limitAmount}
                  onChange={(e) => setBudgetForm({ ...budgetForm, limitAmount: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="month">Month</Label>
                <Select value={String(budgetForm.month)} onValueChange={(value) => setBudgetForm({ ...budgetForm, month: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Select value={String(budgetForm.year)} onValueChange={(value) => setBudgetForm({ ...budgetForm, year: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2024, 2025, 2026].map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSetBudgetOpen(false);
                  resetBudgetForm();
                }}
                disabled={isSettingBudget}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSettingBudget}>
                {isSettingBudget ? 'Setting...' : 'Set Budget'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
