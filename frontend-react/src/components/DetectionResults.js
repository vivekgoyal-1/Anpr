import React from 'react';

const DetectionResults = ({ result, isLoading }) => {
  const { plateNumber, confidence, isRegistered, vehicleInfo, timestamp } = result || {};
  
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (!result || !plateNumber) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-gray-500">No detection results yet</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Detection Results</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-bold text-lg mb-2">Detected Plate</h3>
          <div className="flex items-center justify-center p-4 bg-white rounded-md border border-gray-300">
            <span className="font-mono text-xl font-bold">{plateNumber}</span>
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            <span>Confidence: {Math.round(confidence * 100)}%</span>
            <span> • </span>
            <span>Detected at: {new Date(timestamp).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className={`${isRegistered ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'} p-4 rounded-md`}>
          <h3 className="font-bold text-lg mb-2">Database Match</h3>
          {isRegistered ? (
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <p className="font-semibold text-green-700">✓ Vehicle is registered</p>
              {vehicleInfo && (
                <div className="mt-2 space-y-1">
                  <p><span className="font-medium">Owner:</span> {vehicleInfo.ownerName}</p>
                  <p><span className="font-medium">Contact:</span> {vehicleInfo.contactInfo}</p>
                  {vehicleInfo.additionalInfo && (
                    <p><span className="font-medium">Additional Info:</span> {vehicleInfo.additionalInfo}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white p-3 rounded-md border border-gray-200">
              <p className="font-semibold text-red-700">✗ Vehicle not found in database</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectionResults;