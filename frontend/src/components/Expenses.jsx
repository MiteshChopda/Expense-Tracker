import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { expensesAPI } from '../services/api';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const response = await expensesAPI.getAll();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      alert('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, formData);
      } else {
        await expensesAPI.create(formData);
      }
      setShowForm(false);
      setEditingExpense(null);
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
      });
      loadExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Failed to save expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    let dateValue = expense.date;
    if (dateValue instanceof Date) {
      dateValue = format(dateValue, 'yyyy-MM-dd');
    } else if (typeof dateValue === 'string') {
      dateValue = dateValue.split('T')[0];
    } else {
      dateValue = format(new Date(dateValue), 'yyyy-MM-dd');
    }

    setFormData({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: dateValue,
    });
    setShowForm(true);
  };

  const handleDelete = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const expenseId = id || (e?.currentTarget?.dataset?.id);
    if (!expenseId) {
      alert('Error: Expense ID not found');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this expense? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      await expensesAPI.delete(expenseId);
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      const errorMessage = error?.error || error?.message || 'Failed to delete expense';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-white font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 bg-[#121212] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Expenses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg transition-colors"
        >
          + Add Expense
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1F2933] rounded-lg shadow-xl p-6 mb-6 border border-[#2D3748]">
          <h3 className="text-xl font-bold mb-6 text-purple-500">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              >
                <option value="" className="bg-[#1F2933]">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1F2933]">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="What was this for?"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-[#2D3748] text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1F2933] rounded-lg shadow-lg overflow-hidden border border-[#2D3748]">
        {expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2D3748]">
              <thead className="bg-[#121212]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3748]">
                {expenses.map((expense) => (
                  <tr key={expense.id || expense._id} className="hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-900 text-purple-200">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#f5f5f5b5] max-w-xs truncate">
                      {expense.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-indigo-400 hover:text-indigo-300 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(expense.id || expense._id, e)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#f5f5f5b5] text-lg">No expenses recorded yet.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Add Your First Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Expenses;
