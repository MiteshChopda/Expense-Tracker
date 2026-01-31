import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { reportsAPI } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Reports() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const month = format(currentDate, 'MM');
  const year = format(currentDate, 'yyyy');

  useEffect(() => {
    loadReport();
  }, [currentDate]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const response = await reportsAPI.getMonthly(month, year);
      setReport(response.data);
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const exportToPDF = () => {
    if (!report) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Monthly Expense Report', 14, 20);
    
    // Month and Year
    doc.setFontSize(12);
    doc.text(`${format(currentDate, 'MMMM yyyy')}`, 14, 30);
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 45);
    doc.setFontSize(10);
    doc.text(`Total Expenses: $${report.totalExpenses.toFixed(2)}`, 14, 55);
    doc.text(`Budget Total: $${report.budgetTotal.toFixed(2)}`, 14, 60);
    doc.text(`Remaining: $${report.remaining.toFixed(2)}`, 14, 65);
    doc.text(`Number of Transactions: ${report.expenseCount}`, 14, 70);
    
    // Category Summary Table
    doc.setFontSize(14);
    doc.text('Expenses by Category', 14, 85);
    
    const categoryData = report.categorySummary.map(cat => [
      cat.category,
      `$${cat.total.toFixed(2)}`,
      cat.count.toString()
    ]);
    
    doc.autoTable({
      startY: 90,
      head: [['Category', 'Total', 'Count']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
    });
    
    // Expenses Table
    let finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('All Expenses', 14, finalY);
    
    const expenseData = report.expenses.map(exp => [
      format(new Date(exp.date), 'MMM dd, yyyy'),
      exp.category,
      exp.description || '-',
      `$${exp.amount.toFixed(2)}`
    ]);
    
    doc.autoTable({
      startY: finalY + 5,
      head: [['Date', 'Category', 'Description', 'Amount']],
      body: expenseData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246] },
    });
    
    // Save PDF
    doc.save(`expense-report-${format(currentDate, 'yyyy-MM')}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-white">No report data available</div>
      </div>
    );
  }

  const categoryData = {
    labels: report.categorySummary.map(item => item.category),
    datasets: [
      {
        label: 'Expenses by Category',
        data: report.categorySummary.map(item => item.total),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  };

  return (
    <div className="px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Monthly Report</h2>
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
            onClick={exportToPDF}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium shadow-lg ml-2"
          >
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Expenses</h3>
          <p className="text-3xl font-bold text-purple-600">${report.totalExpenses.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Budget Total</h3>
          <p className="text-3xl font-bold text-blue-600">${report.budgetTotal.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Remaining</h3>
          <p className={`text-3xl font-bold ${report.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${report.remaining.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Transactions</h3>
          <p className="text-3xl font-bold text-indigo-600">{report.expenseCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Expenses by Category</h3>
        {report.categorySummary.length > 0 ? (
          <Bar data={categoryData} options={{ responsive: true, maintainAspectRatio: true }} />
        ) : (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
        {report.categorySummary.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.categorySummary.map((item) => {
                  const percentage = (item.total / report.totalExpenses) * 100;
                  return (
                    <tr key={item.category}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${item.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {percentage.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expenses recorded for this month</p>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">All Expenses</h3>
        {report.expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {report.expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{expense.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No expenses recorded for this month</p>
        )}
      </div>
    </div>
  );
}

export default Reports;
