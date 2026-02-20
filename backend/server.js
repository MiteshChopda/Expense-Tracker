import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import Expense from './models/Expense.js';
import Budget from './models/Budget.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes

// Get all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get expense by ID
app.get('/api/expenses/:id', async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Missing required fields: amount, category, and date are required' });
    }

    const expense = new Expense({
      amount: parseFloat(amount),
      category: category.trim(),
      description: description ? description.trim() : '',
      date: new Date(date),
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update expense
app.put('/api/expenses/:id', async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        amount: parseFloat(amount),
        category,
        description: description || '',
        date: new Date(date),
      },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid expense ID format' });
    }

    const expense = await Expense.findByIdAndDelete(id);

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully', id: expense._id });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete expense' });
  }
});

// Get expenses summary by category
app.get('/api/expenses/summary/category', async (req, res) => {
  try {
    const { month, year } = req.query;
    let matchQuery = {};

    if (month && year) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
      matchQuery.date = { $gte: startDate, $lte: endDate };
    }

    const summary = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get monthly totals
app.get('/api/expenses/summary/monthly', async (req, res) => {
  try {
    const summary = await Expense.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              { $cond: [{ $lt: ['$_id.month', 10] }, '0', ''] },
              { $toString: '$_id.month' },
            ],
          },
          total: 1,
          count: 1,
        },
      },
      // CHANGE THIS: From -1 (descending) to 1 (ascending)
      { $sort: { month: 1 } },
      { $limit: 12 },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Budget routes

// Get all budgets
app.get('/api/budgets', async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = {};

    if (month && year) {
      query.month = month;
      query.year = parseInt(year);
    }

    const budgets = await Budget.find(query).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update budget
app.post('/api/budgets', async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;

    if (!category || !amount || !month || !year) {
      return res.status(400).json({ error: 'Missing required fields: category, amount, month, and year are required' });
    }

    // Normalize month to 2 digits
    const normalizedMonth = month.padStart(2, '0');

    const budget = await Budget.findOneAndUpdate(
      { category: category.trim(), month: normalizedMonth, year: parseInt(year) },
      {
        category: category.trim(),
        amount: parseFloat(amount),
        month: normalizedMonth,
        year: parseInt(year),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(budget);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Budget already exists for this category, month, and year' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete budget
app.delete('/api/budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid budget ID format' });
    }

    const budget = await Budget.findByIdAndDelete(id);

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ message: 'Budget deleted successfully', id: budget._id });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete budget' });
  }
});

// Get budget vs actual comparison
app.get('/api/budgets/comparison', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const budgets = await Budget.find({
      month,
      year: parseInt(year),
    });

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const expenses = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          spent: { $sum: '$amount' },
        },
      },
    ]);

    const expenseMap = {};
    expenses.forEach(exp => {
      expenseMap[exp._id] = exp.spent;
    });

    const comparison = budgets.map(budget => {
      const spent = expenseMap[budget.category] || 0;
      return {
        ...budget.toObject(),
        spent,
        remaining: budget.amount - spent,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0,
      };
    });

    res.json(comparison);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monthly report
app.get('/api/reports/monthly', async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: -1 });

    const categorySummary = await Expense.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const budgets = await Budget.find({
      month,
      year: parseInt(year),
    });

    const budgetTotal = budgets.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      month,
      year,
      totalExpenses: total,
      budgetTotal,
      remaining: budgetTotal - total,
      expenseCount: expenses.length,
      expenses,
      categorySummary,
      budgets,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
