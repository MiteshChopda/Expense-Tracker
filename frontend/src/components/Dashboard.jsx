import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { expensesAPI } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const month = format(currentDate, 'MM');
  const year = format(currentDate, 'yyyy');

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [expensesRes, categoryRes, monthlyRes] = await Promise.all([
        expensesAPI.getAll(month, year),
        expensesAPI.getCategorySummary(month, year),
        expensesAPI.getMonthlySummary(),
      ]);
      setExpenses(expensesRes.data);
      setCategorySummary(categoryRes.data);
      setMonthlySummary(monthlyRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const todayExpenses = expenses
    .filter(exp => format(new Date(exp.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const monthlyData = {
    labels: monthlySummary.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Expenses',
        data: monthlySummary.map(item => item.total),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const categoryData = {
    labels: categorySummary.map(item => item.category),
    datasets: [
      {
        data: categorySummary.map(item => item.total),
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="px-4 py-2 bg-[#1F2933] text-purple-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            ← Prev
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-[#1F2933] text-purple-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="px-4 py-2 bg-[#1F2933] text-purple-600 rounded-lg hover:bg-gray-100 font-medium"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1F2933] rounded-lg shadow-lg p-6 border-2 border-[#2D3748]">
          <h3 className="text-[#f5f5f5b5] text-sm font-medium mb-2">Total This Month</h3>
          <p className="text-3xl font-bold text-purple-600">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-[#1F2933] rounded-lg shadow-lg p-6 border-2 border-[#2D3748]">
          <h3 className="text-[#f5f5f5b5] text-sm font-medium mb-2">Today's Expenses</h3>
          <p className="text-3xl font-bold text-blue-600">${todayExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-[#1F2933] rounded-lg shadow-lg p-6 border-2 border-[#2D3748]">
          <h3 className="text-[#f5f5f5b5] text-sm font-medium mb-2">Total Transactions</h3>
          <p className="text-3xl font-bold text-green-600">{expenses.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1F2933] rounded-lg shadow-lg p-6 border-2 border-[#2D3748]">
          <h3 className="text-xl text-[#f5f5f5b5] font-bold mb-4">Monthly Trend</h3>
          {monthlySummary.length > 0 ? (
            <Line data={monthlyData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p className="text-[#f5f5f5b5] text-center py-8">No data available</p>
          )}
        </div>
        <div className="bg-[#1F2933] rounded-lg shadow-lg p-6 border-2 border-[#2D3748]">
          <h3 className="text-xl text-[#f5f5f5b5] font-bold mb-4">Expenses by Category</h3>
          {categorySummary.length > 0 ? (
            <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: true }} />
          ) : (
            <p className="text-[#f5f5f5b5] text-center py-8">No data available</p>
          )}
        </div>
      </div>

      <div className="mt-6 bg-[#1F2933] shadow-lg p-6 border-[#2D3748]">
        <h3 className="text-xl text-[#f5f5f5b5] font-bold mb-4">Recent Expenses</h3>
        {expenses.length > 0 ? (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg">
              <thead className="bg-gray-500 rounded-lg text-white rounded-lg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-[#1F2933] text-white divide-y divide-gray-200">
                {expenses.slice(0, 5).map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm ">{expense.category}</td>
                    <td className="px-6 py-4 text-sm text-[#f5f5f5b5]">{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ">
                      ${expense.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[#f5f5f5b5] text-center py-8">No expenses recorded yet</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
