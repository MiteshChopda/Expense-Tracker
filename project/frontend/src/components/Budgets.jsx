import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { budgetsAPI } from '../services/api';

function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: format(new Date(), 'MM'),
    year: format(new Date(), 'yyyy'),
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

  const month = format(currentDate, 'MM');
  const year = format(currentDate, 'yyyy');

  useEffect(() => {
    loadBudgets();
  }, [currentDate]);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const [budgetsRes, comparisonRes] = await Promise.all([
        budgetsAPI.getAll(month, year),
        budgetsAPI.getComparison(month, year),
      ]);
      setBudgets(budgetsRes.data);
      setComparison(comparisonRes.data);
    } catch (error) {
      console.error('Error loading budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await budgetsAPI.create({
        ...formData,
        amount: parseFloat(formData.amount),
        year: parseInt(formData.year),
      });
      setShowForm(false);
      setFormData({
        category: '',
        amount: '',
        month: format(new Date(), 'MM'),
        year: format(new Date(), 'yyyy'),
      });
      loadBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Use the ID from the item object (handles both _id and id)
    const budgetId = id || (e?.currentTarget?.dataset?.id);
    if (!budgetId) {
      alert('Error: Budget ID not found');
      return;
    }
    
    const confirmed = window.confirm('Are you sure you want to delete this budget? This action cannot be undone.');
    if (!confirmed) {
      return;
    }
    
    try {
      await budgetsAPI.delete(budgetId);
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      const errorMessage = error?.error || error?.message || 'Failed to delete budget';
      alert(`Error: ${errorMessage}`);
    }
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
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
        <div>
          <h2 className="text-3xl font-bold text-white">Budget Planning</h2>
          <p className="text-white mt-2">{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            Current
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            Next →
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium shadow-lg ml-2"
          >
            + Add Budget
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold mb-4">Add Budget</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Month/Year</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="MM"
                  />
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="YYYY"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
              >
                Add Budget
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    category: '',
                    amount: '',
                    month: format(new Date(), 'MM'),
                    year: format(new Date(), 'yyyy'),
                  });
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {comparison.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {comparison.map((item) => {
                  const percentage = Math.min(item.percentage, 100);
                  const isOverBudget = item.spent > item.amount;
                  return (
                    <tr key={item.id || item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
                        ${item.spent.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ${item.remaining.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => handleDelete(item.id || item._id, e)}
                          className="text-red-600 hover:text-red-900 font-medium"
                          type="button"
                          data-id={item.id || item._id}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No budgets set for this month</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
            >
              Create Your First Budget
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Budgets;
