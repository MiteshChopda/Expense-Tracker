# 💰 Personal Finance & Expense Tracker App

A modern, full-stack expense tracking application built with React and Node.js.

## Features

- ✅ **Daily Expense Tracking** - Add, edit, and delete expenses with categories
- 📊 **Graphs & Charts** - Visualize expenses with interactive charts (Line, Doughnut, Bar)
- 📈 **Monthly Reports** - Comprehensive monthly expense reports
- 💵 **Budget Planning** - Set budgets by category and track spending vs budget
- 📄 **PDF Export** - Export monthly reports to PDF

## Tech Stack

### Frontend
- React 18
- Vite
- React Router
- Chart.js / React-Chartjs-2
- jsPDF / jsPDF-AutoTable
- Tailwind CSS
- Axios
- date-fns

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- CORS

## Installation

1. **Install MongoDB:**
   - For local development, install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud) - create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. **Configure MongoDB connection:**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` and set your MongoDB connection string:
   - Local: `MONGODB_URI=mongodb://localhost:27017/expense-tracker`
   - Atlas: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/expense-tracker`

3. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

4. **Start MongoDB (if using local):**
   ```bash
   # On Linux/Mac
   sudo systemctl start mongod
   # Or
   mongod
   
   # On Windows
   # MongoDB should start automatically as a service
   ```

5. **Start the development servers:**
   
   **Option 1: Use the startup script (recommended)**
   ```bash
   ./start.sh
   ```
   
   **Option 2: Manual start**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend dev server on `http://localhost:3000`

## Troubleshooting

### MongoDB Connection Issues

1. **MongoDB not running:**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Connection refused error:**
   - Verify MongoDB is running on port 27017
   - Check your `.env` file has the correct `MONGODB_URI`
   - For MongoDB Atlas, ensure your IP is whitelisted

3. **Check server health:**
   ```bash
   curl http://localhost:3001/api/health
   ```

### Common Issues

- **Port already in use:** Change `PORT` in `backend/.env`
- **CORS errors:** Ensure backend is running on port 3001
- **Module not found:** Run `npm run install-all` again

## Project Structure

```
project/
├── backend/
│   ├── server.js          # Express API server
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   ├── models/
│   │   ├── Expense.js     # Expense Mongoose model
│   │   └── Budget.js      # Budget Mongoose model
│   ├── .env               # Environment variables (MongoDB URI)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── Budgets.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js     # API service layer
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── package.json
```

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses (optional: ?month=MM&year=YYYY)
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/summary/category` - Get expenses by category
- `GET /api/expenses/summary/monthly` - Get monthly totals

### Budgets
- `GET /api/budgets` - Get all budgets (optional: ?month=MM&year=YYYY)
- `POST /api/budgets` - Create or update budget
- `DELETE /api/budgets/:id` - Delete budget
- `GET /api/budgets/comparison` - Get budget vs actual comparison

### Reports
- `GET /api/reports/monthly` - Get monthly report (requires ?month=MM&year=YYYY)

## Usage

1. **Dashboard** - View overview with charts and recent expenses
2. **Expenses** - Add and manage your daily expenses
3. **Budgets** - Set monthly budgets by category and track progress
4. **Reports** - View detailed monthly reports and export to PDF

## Categories

Default expense categories:
- Food & Dining
- Transportation
- Shopping
- Bills & Utilities
- Entertainment
- Healthcare
- Education
- Travel
- Other

## License

MIT
