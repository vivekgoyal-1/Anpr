#!/bin/bash
cd "$(dirname "$0")/.."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build the React app
echo "Building React application..."
npm run build

# Start the server
echo "Starting server on port 5000..."
node server.js