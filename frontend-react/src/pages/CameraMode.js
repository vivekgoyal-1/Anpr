import React, { useState } from 'react';
import CameraFeed from '../components/CameraFeed';
import DetectionResults from '../components/DetectionResults';
import ActionPanel from '../components/ActionPanel';
import { processFrame } from '../services/api';

const CameraMode = () => {
  const [detectionResult, setDetectionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCapture = async (imageData) => {
    try {
      setIsLoading(true);
      const result = await processFrame(imageData);
      setDetectionResult(result);
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Error processing image: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVehicleAdded = async () => {
    if (detectionResult && detectionResult.plateNumber) {
      // Re-check the plate to update the UI
      try {
        setIsLoading(true);
        // Use the same image data but force a refresh from the server
        const result = await processFrame(detectionResult.imageData);
        setDetectionResult(result);
      } catch (error) {
        console.error('Failed to refresh data:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Camera Feed Section - Takes up 2/3 of the grid on large screens */}
      <div className="lg:col-span-2">
        <CameraFeed onCapture={handleCapture} />
      </div>
      
      {/* Results and Actions Section - Takes up 1/3 of the grid */}
      <div className="space-y-6">
        <DetectionResults 
          result={detectionResult} 
          isLoading={isLoading} 
        />
        
        <ActionPanel 
          result={detectionResult} 
          onVehicleAdded={handleVehicleAdded} 
        />
      </div>
    </div>
  );
};

export default CameraMode;