import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
      return Promise.reject({ error: 'Network error. Please check if the server is running.' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

export const expensesAPI = {
  getAll: (month, year) => api.get('/expenses', { params: { month, year } }),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getCategorySummary: (month, year) => api.get('/expenses/summary/category', { params: { month, year } }),
  getMonthlySummary: () => api.get('/expenses/summary/monthly'),
};

export const budgetsAPI = {
  getAll: (month, year) => api.get('/budgets', { params: { month, year } }),
  create: (data) => api.post('/budgets', data),
  delete: (id) => api.delete(`/budgets/${id}`),
  getComparison: (month, year) => api.get('/budgets/comparison', { params: { month, year } }),
};

export const reportsAPI = {
  getMonthly: (month, year) => api.get('/reports/monthly', { params: { month, year } }),
};

export default api;
