import React, { useState, useEffect, useCallback } from 'react';
import DetectionResults from '../components/DetectionResults';
import ActionPanel from '../components/ActionPanel';
import { processFrame } from '../services/api';

const DemoMode = () => {
  const [plateOptions] = useState([
    { value: 'ABC123', label: 'ABC123 (Registered)' },
    { value: 'XYZ789', label: 'XYZ789 (Registered)' },
    { value: 'DEF456', label: 'DEF456 (Not Registered)' },
    { value: 'GHI789', label: 'GHI789 (Not Registered)' },
    { value: 'JKL012', label: 'JKL012 (Not Registered)' }
  ]);
  
  const [randomPlates] = useState([
    'ABC123', 'XYZ789', 'DEF456', 'GHI789', 'JKL012',
    'MNO345', 'PQR678', 'STU901', 'VWX234', 'YZA567'
  ]);
  
  const [selectedPlate, setSelectedPlate] = useState(plateOptions[0].value);
  const [detectionResult, setDetectionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoDetect, setAutoDetect] = useState(false);
  const [interval, setInterval] = useState(3000);
  const [detectionCount, setDetectionCount] = useState(0);
  const [lastDetectionTime, setLastDetectionTime] = useState('N/A');

  // Define detectPlate function with useCallback
  const detectPlate = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Create dummy image data (empty 1x1 pixel image)
      const dummyImageData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      
      const result = await processFrame(dummyImageData, selectedPlate);
      setDetectionResult(result);
      
      // Update stats
      setDetectionCount(prev => prev + 1);
      setLastDetectionTime(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to process plate:', error);
      alert('Error detecting plate: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedPlate, setIsLoading, setDetectionResult, setDetectionCount, setLastDetectionTime]);

  // Auto-detection effect
  useEffect(() => {
    let timer = null;
    
    if (autoDetect) {
      timer = setInterval(() => {
        detectPlate();
      }, interval);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoDetect, interval, detectPlate]);

  const chooseRandomPlate = () => {
    const randomIndex = Math.floor(Math.random() * randomPlates.length);
    setSelectedPlate(randomPlates[randomIndex]);
  };

  const handleVehicleAdded = () => {
    detectPlate();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Demo Controls Section */}
      <div className="lg:col-span-2">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">License Plate Number</label>
            <div className="flex space-x-2">
              <select 
                value={selectedPlate}
                onChange={(e) => setSelectedPlate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {plateOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button 
                onClick={chooseRandomPlate}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
              >
                Random
              </button>
            </div>
          </div>
          
          <div className="relative rounded-md overflow-hidden bg-black">
            <div className="w-full h-[480px] bg-gray-800 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 p-6 rounded-lg text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-yellow-500 px-4 py-2 text-black font-bold text-xl rounded-md">
                    {selectedPlate}
                  </div>
                </div>
                <p className="text-white text-sm">Demo mode - Simulated vehicle plate</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setSelectedPlate(plateOptions[Math.floor(Math.random() * plateOptions.length)].value)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none"
            >
              Change Plate
            </button>
            
            <button 
              onClick={detectPlate}
              disabled={isLoading}
              className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Detect Plate'}
            </button>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            <p>This demo mode allows you to test the plate recognition system without a camera.</p>
            <p>Select a plate number and click "Detect Plate" to simulate detection.</p>
          </div>
        </div>
      </div>
      
      {/* Results and Actions Section */}
      <div className="space-y-6">
        <DetectionResults 
          result={detectionResult} 
          isLoading={isLoading} 
        />
        
        <ActionPanel 
          result={detectionResult} 
          onVehicleAdded={handleVehicleAdded} 
        />
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Auto Processing</h2>
          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <input 
                  type="checkbox" 
                  id="auto-detect" 
                  className="mr-2"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                />
                <label htmlFor="auto-detect">Process automatically</label>
              </div>
              <select 
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
                className="p-2 border border-gray-300 rounded"
              >
                <option value="1000">Every 1 second</option>
                <option value="3000">Every 3 seconds</option>
                <option value="5000">Every 5 seconds</option>
                <option value="10000">Every 10 seconds</option>
              </select>
            </div>
            
            <div className="mt-4 flex justify-between">
              <div>
                <span className="font-medium">Detections:</span>
                <span className="ml-2">{detectionCount}</span>
              </div>
              <div>
                <span className="font-medium">Last detection:</span>
                <span className="ml-2">{lastDetectionTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;