#!/bin/bash
cd "$(dirname "$0")"

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt -q

echo "Starting AI Repository Analyzer Backend on port 8000..."
uvicorn main:app --reload --host 0.0.0.0 --port 8080
