import axios from 'axios';

// Use the current window hostname to determine the API URLs
const hostname = window.location.hostname;
const FLASK_API_URL = process.env.REACT_APP_FLASK_API_URL || `http://${hostname}:5000`;
const NODE_API_URL = process.env.REACT_APP_NODE_API_URL || `http://${hostname}:5002`;

// Default to Flask API for most operations
const API_URL = FLASK_API_URL;

// Process a video frame for license plate detection
export const processFrame = async (imageData, demoPlate = null) => {
  try {
    const requestData = { image: imageData };
    
    // If demo plate is provided, include it in the request
    if (demoPlate) {
      requestData.demoPlate = demoPlate;
    }
    
    const response = await axios.post(`${API_URL}/api/process-frame`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error processing frame:', error);
    throw error;
  }
};

// Check if a license plate is in the database
export const getVehicleStatus = async (plateNumber) => {
  try {
    // Use Node.js API for vehicle database operations
    const response = await axios.get(`${NODE_API_URL}/api/vehicles/check`, { 
      params: { plateNumber }
    });
    return response.data;
  } catch (error) {
    console.error('Error checking vehicle status:', error);
    throw error;
  }
};

// Add a new vehicle to the database
export const addVehicle = async (vehicleData) => {
  try {
    // Use Node.js API for vehicle database operations
    const response = await axios.post(`${NODE_API_URL}/api/vehicles`, vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error adding vehicle:', error);
    throw error;
  }
};

// Start an HLS stream
export const startStream = async (streamUrl) => {
  try {
    const response = await axios.post(`${API_URL}/api/start-stream`, { url: streamUrl });
    return response.data;
  } catch (error) {
    console.error('Error starting stream:', error);
    throw error;
  }
};

// Check stream status
export const getStreamStatus = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/stream-status`);
    return response.data;
  } catch (error) {
    console.error('Error checking stream status:', error);
    throw error;
  }
};

// Health check for the API
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    return response.data;
  } catch (error) {
    console.error('API health check failed:', error);
    throw error;
  }
};