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

    const budgetId = id || (e?.currentTarget?.dataset?.id);
    if (!budgetId) {
      alert('Error: Budget ID not found');
      return;
    }

    const confirmed = window.confirm('Are you sure you want to delete this budget limit?');
    if (!confirmed) return;

    try {
      await budgetsAPI.delete(budgetId);
      loadBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    }
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
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
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Budget Planning</h2>
          <p className="text-[#f5f5f5b5] mt-2">{format(currentDate, 'MMMM yyyy')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 bg-[#1F2933] text-purple-500 border border-[#2D3748] rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-[#1F2933] text-purple-500 border border-[#2D3748] rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            Current
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 bg-[#1F2933] text-purple-500 border border-[#2D3748] rounded-lg hover:bg-gray-700 font-medium transition-colors"
          >
            Next →
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-lg ml-2 transition-colors"
          >
            + Add Budget
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[#1F2933] rounded-lg shadow-xl p-6 mb-6 border border-[#2D3748]">
          <h3 className="text-xl font-bold mb-6 text-purple-500">Set Category Budget</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                >
                  <option value="" className="bg-[#1F2933]">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#1F2933]">{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Budget Amount</label>
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
                <label className="block text-sm font-medium text-[#f5f5f5b5] mb-2">Month & Year</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-1/2 px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="MM"
                  />
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-1/2 px-4 py-2 bg-[#121212] border border-[#2D3748] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="YYYY"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Set Budget
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-[#2D3748] text-white rounded-lg hover:bg-gray-600 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1F2933] rounded-lg shadow-lg overflow-hidden border border-[#2D3748]">
        {comparison.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2D3748]">
              <thead className="bg-[#121212]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Spent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Remaining</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-[#f5f5f5b5] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D3748]">
                {comparison.map((item) => {
                  const percentage = Math.min(item.percentage, 100);
                  const isOverBudget = item.spent > item.amount;
                  return (
                    <tr key={item.id || item._id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-semibold">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${isOverBudget ? 'text-red-500' : 'text-white'}`}>
                        ${item.spent.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${item.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ${item.remaining.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap min-w-[150px]">
                        <div className="w-full bg-[#121212] rounded-full h-2.5 mb-1">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' :
                              percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-[#f5f5f5b5]">{item.percentage.toFixed(1)}% used</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => handleDelete(item.id || item._id, e)}
                          className="text-red-400 hover:text-red-300 font-medium transition-colors"
                          type="button"
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
          <div className="text-center py-16">
            <p className="text-[#f5f5f5b5] text-lg">No budget goals set for this month.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
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
