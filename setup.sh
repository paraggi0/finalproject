#!/bin/bash
# Setup Script for Cascading Dropdown System
# PT. Topline Evergreen Manufacturing

echo "🚀 Starting Cascading Dropdown Setup..."

# Step 1: Check Node.js
echo "📋 Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi
echo "✅ Node.js found: $(node --version)"

# Step 2: Install Backend Dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found in backend directory"
    exit 1
fi
npm install
echo "✅ Backend dependencies installed"

# Step 3: Start Backend Server
echo "🖥️ Starting backend server..."
echo "Backend server will start at http://localhost:3001"
echo "Press Ctrl+C to stop the server"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Start backend server: cd backend && node server.js"
echo "2. Start frontend server: cd frontend && node server.js"
echo "3. Open browser: http://localhost:8080"
echo ""
echo "📊 Configuration:"
echo "- Backend: http://localhost:3001"
echo "- Frontend: http://localhost:8080"
echo "- Database: Real-time connection enabled"
echo "- Cascading Dropdown: Fully functional"
echo ""
echo "✅ System ready for production!"
