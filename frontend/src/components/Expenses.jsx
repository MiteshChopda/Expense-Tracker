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
    // Handle date format - MongoDB returns ISO string or Date object
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
    
    // Use the ID from the expense object (handles both _id and id)
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
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Expenses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium shadow-lg"
        >
          + Add Expense
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1F2933]  rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-purple-500">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Category</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Optional description"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                {editingExpense ? 'Update' : 'Add'} Expense
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className=" rounded-lg shadow-lg overflow-hidden">
        {expenses.length > 0 ? (
          <div className=" bg-[#1F2933] overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#1F2933] divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id || expense._id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f5f5f5b5]">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#f5f5f5b5]">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => handleDelete(expense.id || expense._id, e)}
                        className="text-red-600 hover:text-red-900 font-medium"
                        type="button"
                        data-id={expense.id || expense._id}
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
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No expenses recorded yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
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
