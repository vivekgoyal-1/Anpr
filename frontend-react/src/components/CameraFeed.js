import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const CameraFeed = ({ onCapture }) => {
  const webcamRef = useRef(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Start or stop camera
  const toggleCamera = useCallback(() => {
    setIsEnabled(prevState => !prevState);
  }, []);

  // Capture frame from webcam
  const captureFrame = useCallback(() => {
    if (webcamRef.current && isEnabled) {
      setIsCapturing(true);
      
      try {
        // Capture screenshot
        const screenshot = webcamRef.current.getScreenshot();
        
        if (screenshot) {
          // Extract base64 data without prefix
          const base64Image = screenshot.split(',')[1];
          
          // Pass to parent component
          onCapture(base64Image);
        } else {
          console.error('Failed to capture webcam screenshot');
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  }, [isEnabled, onCapture]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Live Camera Feed</h2>
      
      <div className="relative rounded-md overflow-hidden bg-black">
        {isEnabled ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-[480px]"
          />
        ) : (
          <div className="w-full h-[480px] bg-gray-900 flex items-center justify-center text-white">
            Click "Start Camera" button below to enable camera
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <button 
          onClick={toggleCamera}
          className={`px-4 py-2 ${isEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded focus:outline-none`}
        >
          {isEnabled ? 'Stop Camera' : 'Start Camera'}
        </button>
        
        <button 
          onClick={captureFrame}
          disabled={!isEnabled || isCapturing}
          className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none ${(!isEnabled || isCapturing) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isCapturing ? 'Processing...' : 'Detect Plate'}
        </button>
      </div>
    </div>
  );
};

export default CameraFeed;