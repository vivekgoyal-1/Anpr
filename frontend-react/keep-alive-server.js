const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Create Express app
const app = express();
const PORT = 5000;

// Enable CORS for all routes
app.use(cors());

// Logging middleware
app.use(morgan('dev'));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple HTML response with links
app.get('/', (req, res) => {
  res.send(`
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
          .button:hover {
            background-color: #2563eb;
          }
          .button.green {
            background-color: #10b981;
          }
          .button.green:hover {
            background-color: #059669;
          }
          .button.purple {
            background-color: #8b5cf6;
          }
          .button.purple:hover {
            background-color: #7c3aed;
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
              <a href="/camera" class="button">Camera Mode</a>
              <a href="/demo" class="button green">Demo Mode</a>
              <a href="/stream" class="button purple">Video Stream Mode</a>
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

// Route handlers for different modes
app.get('/camera', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Camera Mode - License Plate Recognition</title>
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
          .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 10px 15px;
            text-align: center;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .camera-feed {
            background-color: #000;
            height: 480px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 20px;
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
            <h1>Camera Mode - License Plate Recognition</h1>
          </div>
        </header>
        
        <div class="container">
          <div class="card">
            <h2>Live Camera Feed</h2>
            <div class="camera-feed">
              <p>Camera feed would appear here</p>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <button class="button">Start Camera</button>
              <button class="button" disabled>Detect Plate</button>
            </div>
          </div>
          
          <div class="card">
            <h2>Detection Results</h2>
            <p>No detection results yet</p>
          </div>
          
          <a href="/" class="button">Back to Home</a>
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

app.get('/demo', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Demo Mode - License Plate Recognition</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          header {
            background-color: #10b981;
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
          .button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 10px 15px;
            text-align: center;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #059669;
          }
          .demo-plate {
            background-color: #000;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 20px;
          }
          .plate-display {
            background-color: #eab308;
            color: #000;
            font-weight: bold;
            font-size: 24px;
            padding: 10px 20px;
            border-radius: 5px;
          }
          footer {
            margin-top: 50px;
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
          }
          select, button {
            padding: 8px;
            margin-right: 10px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Demo Mode - License Plate Recognition</h1>
          </div>
        </header>
        
        <div class="container">
          <div class="card">
            <h2>Demo Controls</h2>
            <div>
              <label>License Plate Number:</label>
              <div style="display: flex; margin-top: 10px;">
                <select style="flex-grow: 1; padding: 10px;">
                  <option>ABC123 (Registered)</option>
                  <option>XYZ789 (Registered)</option>
                  <option>DEF456 (Not Registered)</option>
                </select>
                <button style="margin-left: 10px; padding: 10px;">Random</button>
              </div>
            </div>
            
            <div class="demo-plate">
              <div class="plate-display">ABC123</div>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
              <button class="button" style="background-color: #6b7280;">Change Plate</button>
              <button class="button">Detect Plate</button>
            </div>
          </div>
          
          <div class="card">
            <h2>Detection Results</h2>
            <p>No detection results yet</p>
          </div>
          
          <a href="/" class="button">Back to Home</a>
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

app.get('/stream', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stream Mode - License Plate Recognition</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          header {
            background-color: #8b5cf6;
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
          .button {
            display: inline-block;
            background-color: #8b5cf6;
            color: white;
            padding: 10px 15px;
            text-align: center;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #7c3aed;
          }
          .stream-view {
            background-color: #000;
            height: 480px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 20px;
          }
          footer {
            margin-top: 50px;
            text-align: center;
            padding: 20px;
            background-color: #1f2937;
            color: white;
          }
          input {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            margin-bottom: 15px;
          }
        </style>
      </head>
      <body>
        <header>
          <div class="container">
            <h1>Stream Mode - License Plate Recognition</h1>
          </div>
        </header>
        
        <div class="container">
          <div class="card">
            <h2>Video Stream</h2>
            <div>
              <label>Stream URL:</label>
              <input type="text" placeholder="Enter HLS stream URL (m3u8)" value="https://example.com/stream.m3u8">
            </div>
            
            <div class="stream-view">
              <p>Stream will appear here after you click "Start Stream"</p>
            </div>
            
            <div style="display: flex; justify-content: space-between;">
              <button class="button" style="background-color: #10b981;">Start Stream</button>
            </div>
          </div>
          
          <div class="card">
            <h2>Detection Results</h2>
            <p>No detection results yet</p>
          </div>
          
          <a href="/" class="button">Back to Home</a>
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling for unhandled exceptions to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Prevent the server from closing
process.stdin.resume();

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});