import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

// Import pages
import CameraMode from './pages/CameraMode';
import DemoMode from './pages/DemoMode';
import StreamMode from './pages/StreamMode';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Vehicle Number Plate Recognition System</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 flex-grow">
        <Routes>
          <Route path="/" element={<CameraMode />} />
          <Route path="/demo" element={<DemoMode />} />
          <Route path="/stream" element={<StreamMode />} />
        </Routes>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/" className="bg-blue-500 text-white p-3 rounded text-center hover:bg-blue-600">
            Camera Mode
          </Link>
          <Link to="/demo" className="bg-green-500 text-white p-3 rounded text-center hover:bg-green-600">
            Demo Mode
          </Link>
          <Link to="/stream" className="bg-purple-500 text-white p-3 rounded text-center hover:bg-purple-600">
            Video Stream Mode
          </Link>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>Vehicle Number Plate Recognition System - © 2025</p>
        </div>
      </footer>
    </div>
  );
}

export default App;