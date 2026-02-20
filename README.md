
# 💰 Expense Tracker

A full-stack personal finance application designed to help you track spending, set monthly budgets, and visualize your financial health with interactive charts and PDF reports.

---

## ✨ Features

* **Interactive Dashboard:** Real-time visualization of monthly trends and category-wise spending.
* **Expense Management:** Full CRUD operations for daily expenses with future-date validation.
* **Budget Planning:** Set monthly limits for specific categories and track progress via visual progress bars.
* **Monthly Reports:** Generate detailed summaries and export them as **PDF documents**.
* **Dark Mode UI:** Sleek, modern interface built with Tailwind CSS.
* **Responsive Design:** Optimized for both desktop and mobile viewing.

---

## 🛠️ Tech Stack

**Frontend**

* **Framework:** React 18 (Vite)
* **Styling:** Tailwind CSS
* **Charts:** Chart.js & React-Chartjs-2
* **Networking:** Axios
* **Utilities:** Date-fns, jsPDF

**Backend**

* **Runtime:** Node.js
* **Framework:** Express
* **Database:** MongoDB (Mongoose)
* **Tooling:** Concurrently (to run both servers)

---

## 🚀 Getting Started

### 1. Prerequisites

* [Node.js](https://nodejs.org/) installed.
* [pnpm](https://pnpm.io/installation) (recommended) or npm/yarn.
* A running **MongoDB** instance (local or Atlas).

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/expense-tracker
PORT=3001

```

### 3. Installation & Launch

The easiest way to start the project is using the included shell script:

```bash
# Make the script executable
chmod +x start.sh

# Run the app
./start.sh

```

**Manual Installation:**
If you prefer running commands manually:

```bash
# Install all dependencies
pnpm run install-all

# Start both frontend and backend
pnpm run dev

```

---

## 📁 Project Structure

```text
├── backend/           # Express server & Mongoose models
│   ├── config/        # Database connection
│   ├── models/        # MongoDB schemas (Expense, Budget)
│   └── server.js      # API routes & middleware
├── frontend/          # React application
│   ├── src/
│   │   ├── components/# UI Pages (Dashboard, Expenses, etc.)
│   │   ├── services/  # Axios API configurations
│   │   └── App.jsx    # Routing logic
│   └── vite.config.js # Proxy settings for API
└── start.sh           # Automation script

```

---

## 🚦 API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| **GET** | `/api/expenses` | Get all expenses (supports month/year query) |
| **POST** | `/api/expenses` | Create a new expense |
| **GET** | `/api/budgets/comparison` | Get budget vs. actual spending |
| **POST** | `/api/budgets` | Set or update a category budget |
| **GET** | `/api/reports/monthly` | Get full monthly summary |

---
