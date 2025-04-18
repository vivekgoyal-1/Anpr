const http = require('http');
const fs = require('fs');
const path = require('path');

// Create a simple HTTP server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Health check endpoint
  if (req.url === '/api/health') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  
  // Default response - simple HTML
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>License Plate Recognition System</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          header {
            background-color: #3b82f6;
            color: white;
            padding: 1rem;
            margin-bottom: 2rem;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            font-size: 2rem;
          }
          .card {
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            background-color: #f9fafb;
          }
          .button-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            grid-gap: 20px;
            margin-top: 30px;
          }
          .button {
            display: block;
            background-color: #3b82f6;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
          }
          .button.green {
            background-color: #10b981;
          }
          .button.purple {
            background-color: #8b5cf6;
          }
          footer {
            margin-top: 50px;
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Vehicle Number Plate Recognition System</h1>
          </div>
        </header>
        
        <div class="container">
          <div class="card">
            <h2>Welcome to the License Plate Recognition System</h2>
            <p>This application allows you to detect and recognize vehicle license plates using different modes:</p>
            
            <div class="button-container">
              <a href="#" class="button">Camera Mode</a>
              <a href="#" class="button green">Demo Mode</a>
              <a href="#" class="button purple">Video Stream Mode</a>
            </div>
          </div>
          
          <div class="card">
            <h2>System Features</h2>
            <ul>
              <li>Real-time license plate detection</li>
              <li>Integration with vehicle database</li>
              <li>Support for webcam input</li>
              <li>Support for video stream processing</li>
              <li>Demo mode for testing without camera</li>
            </ul>
          </div>
        </div>
        
        <footer>
          <div class="container">
            <p>Vehicle Number Plate Recognition System - © 2025</p>
          </div>
        </footer>
      </body>
    </html>
  `);
});

// Start the server on port 5000
server.listen(5000, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});