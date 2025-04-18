#!/bin/bash
cd "$(dirname "$0")/.."

# Set environment variables for React
export HOST=0.0.0.0
export PORT=5001
export DANGEROUSLY_DISABLE_HOST_CHECK=true

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the React app
echo "Starting React application on $HOST:$PORT..."
npm start