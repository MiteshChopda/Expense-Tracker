#!/bin/bash

# Expense Tracker Startup Script

echo "💰 Expense Tracker - Starting Application..."
echo ""

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null && ! pgrep -x "mongosh" > /dev/null; then
    echo "⚠️  Warning: MongoDB doesn't appear to be running"
    echo "   Please start MongoDB before running the app:"
    echo "   - Local: sudo systemctl start mongod"
    echo "   - Or use MongoDB Atlas (cloud)"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created .env file. Please edit backend/.env if needed."
    echo ""
fi

# Install dependencies if node_modules don't exist
if [ ! -d "node_modules" ] || [ ! -d "backend/node_modules" ] || [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm run install-all
    echo ""
fi

echo "🚀 Starting servers..."
echo "   Backend: http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

npm run dev
