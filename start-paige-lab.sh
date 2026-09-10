#!/bin/bash
# Start PAIGE Lab (Backend + Frontend)

set -e

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$PROJECT_DIR"

echo "🔬 Starting PAIGE Lab..."
echo ""

# Create directories
mkdir -p .models .cache

# Activate venv
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install gradio huggingface-hub -q 2>/dev/null || true

# Set environment
export HF_TOKEN="${HF_TOKEN:-}"
export REACT_APP_HF_LAB_URL="${REACT_APP_HF_LAB_URL:-http://localhost:7860}"
export REACT_APP_LOCAL_BACKEND="${REACT_APP_LOCAL_BACKEND:-http://localhost:8002}"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    PAIGE Lab Starting                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 Backend (Gradio):  http://localhost:7860"
echo "📍 Frontend (React):  http://localhost:3000"
echo ""
echo "Starting backend in background..."

# Start backend (Gradio)
python3 paige-lab-backend.py > .paige-lab-backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

echo ""
echo "🎨 Starting frontend..."
echo "Building React app..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing npm dependencies..."
    npm install --silent 2>/dev/null || echo "⚠️  npm install skipped"
fi

# Start frontend
npm start > .paige-lab-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend PID: $FRONTEND_PID"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                 PAIGE Lab Ready!                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Backend:  http://localhost:7860 (Model Gallery + Tools)"
echo "⚛️  Frontend: http://localhost:3000 (Build & Test)"
echo ""
echo "📋 Backend logs:  tail -f .paige-lab-backend.log"
echo "📋 Frontend logs: tail -f .paige-lab-frontend.log"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Keep running
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM

wait
