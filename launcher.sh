#!/bin/bash
# PAIGE Launcher - Services CRANE
# Runs LLYACrew server on port 8002 to support CRANE IDE

PROJECT_DIR="$HOME/Downloads/PAIGE"
[ ! -d "$PROJECT_DIR" ] && PROJECT_DIR="/home/hunt/Downloads/PAIGE"
[ ! -d "$PROJECT_DIR" ] && echo "PAIGE not found" && exit 1

cd "$PROJECT_DIR" || exit 1

# Create venv if needed
[ ! -d "venv" ] && python3 -m venv venv

# Activate venv
source venv/bin/activate

# Install LLYACrew and dependencies
echo "Setting up PAIGE environment..."
pip install -e . --quiet 2>/dev/null || true

# Run the LLYACrew server on port 8002
echo "Starting PAIGE Service..."
echo "Port: 8002"
echo "URL:  http://localhost:8002"

# Configure to use port 8002
export KIROCREW_PORT=8002
export KIROCREW_HOST=127.0.0.1

# Run the gateway/server
python3 -m kiro_crew gateway --port 8002
