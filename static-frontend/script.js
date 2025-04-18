// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture-button');
const startCameraButton = document.getElementById('start-camera');
const stopCameraButton = document.getElementById('stop-camera');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMessage = document.getElementById('error-message');
const resultsPanel = document.getElementById('results-panel');
const plateNumberInput = document.getElementById('plate-number');
const addVehicleForm = document.getElementById('add-vehicle-form');
const vehicleInfo = document.getElementById('vehicle-info');
const vehicleDetails = document.getElementById('vehicle-details');
const addVehicleButton = document.getElementById('add-vehicle-button');

// API URLs
const PYTHON_API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5002' : 'https://' + window.location.hostname + ':5002';
const NODE_API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://' + window.location.hostname + ':5001';

// Global variables
let stream = null;

// Initialize the application
function init() {
  // Start with camera off
  stopCamera();
  
  // Add event listeners
  startCameraButton.addEventListener('click', startCamera);
  stopCameraButton.addEventListener('click', stopCamera);
  captureButton.addEventListener('click', captureAndProcess);
  addVehicleButton.addEventListener('click', addVehicle);
}

// Start the camera feed
async function startCamera() {
  try {
    const constraints = {
      video: {
        width: 640,
        height: 480
      }
    };
    
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    startCameraButton.disabled = true;
    stopCameraButton.disabled = false;
    captureButton.disabled = false;
    hideError();
  } catch (err) {
    showError('Unable to access camera. Please make sure you have granted camera permissions.');
    console.error('Error accessing camera:', err);
  }
}

// Stop the camera feed
function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  
  video.srcObject = null;
  startCameraButton.disabled = false;
  stopCameraButton.disabled = true;
  captureButton.disabled = true;
}

// Capture frame and process it
async function captureAndProcess() {
  showLoading();
  
  try {
    // Draw current frame to canvas
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to base64 image data
    const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
    
    // Send image for processing
    const results = await processImage(imageData);
    displayResults(results);
    
    // Check if the plate exists in the database
    if (results.plateNumber) {
      plateNumberInput.value = results.plateNumber;
      
      if (results.isRegistered) {
        showVehicleInfo(results);
      } else {
        showAddVehicleForm();
      }
    }
  } catch (err) {
    showError('Failed to process image. Please try again.');
    console.error('Error processing image:', err);
  } finally {
    hideLoading();
  }
}

// Add a new vehicle to the database
async function addVehicle() {
  const plateNumber = plateNumberInput.value;
  const ownerName = document.getElementById('owner-name').value;
  const contactInfo = document.getElementById('contact-info').value;
  const additionalInfo = document.getElementById('additional-info').value;
  
  if (!plateNumber || !ownerName || !contactInfo) {
    showError('Please fill in all required fields.');
    return;
  }
  
  showLoading();
  
  try {
    const response = await fetch(`${NODE_API_URL}/api/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        plateNumber,
        ownerInfo: {
          ownerName,
          contactInfo,
          additionalInfo
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to add vehicle');
    }
    
    const data = await response.json();
    
    // Clear form and display success message
    document.getElementById('owner-name').value = '';
    document.getElementById('contact-info').value = '';
    document.getElementById('additional-info').value = '';
    
    showSuccess(`Vehicle with plate ${plateNumber} added successfully!`);
    
    // Fetch the vehicle info to display
    await checkVehicle(plateNumber);
  } catch (err) {
    showError('Failed to add vehicle. Please try again.');
    console.error('Error adding vehicle:', err);
  } finally {
    hideLoading();
  }
}

// Process image with the Python backend
async function processImage(imageData) {
  try {
    const response = await fetch(`${PYTHON_API_URL}/api/process-frame`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: imageData })
    });
    
    if (!response.ok) {
      throw new Error('Failed to process image');
    }
    
    return await response.json();
  } catch (err) {
    console.error('Error processing image:', err);
    throw err;
  }
}

// Check if a vehicle exists in the database
async function checkVehicle(plateNumber) {
  try {
    const response = await fetch(`${NODE_API_URL}/api/vehicles/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plateNumber })
    });
    
    if (!response.ok) {
      throw new Error('Failed to check vehicle');
    }
    
    const data = await response.json();
    
    if (data.exists) {
      showVehicleInfo({
        plateNumber,
        isRegistered: true,
        vehicleInfo: data.vehicleInfo
      });
    } else {
      showAddVehicleForm();
    }
    
    return data;
  } catch (err) {
    console.error('Error checking vehicle:', err);
    throw err;
  }
}

// Display results in the results panel
function displayResults(results) {
  if (!results || !results.plateNumber) {
    resultsPanel.innerHTML = `
      <div class="text-yellow-600">No license plate detected</div>
    `;
    return;
  }
  
  let plateStatus = '';
  if (results.isRegistered) {
    plateStatus = `<span class="text-green-600">✓ Registered</span>`;
  } else {
    plateStatus = `<span class="text-red-600">✗ Not Registered</span>`;
  }
  
  resultsPanel.innerHTML = `
    <div>
      <div class="mb-2">
        <span class="font-semibold">Plate Number:</span> 
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">${results.plateNumber}</span>
      </div>
      <div class="mb-2">
        <span class="font-semibold">Confidence:</span> 
        ${(results.confidence * 100).toFixed(2)}%
      </div>
      <div class="mb-2">
        <span class="font-semibold">Status:</span> 
        ${plateStatus}
      </div>
      <div class="mb-2">
        <span class="font-semibold">Timestamp:</span> 
        ${new Date(results.timestamp).toLocaleString()}
      </div>
    </div>
  `;
}

// Show vehicle information section
function showVehicleInfo(results) {
  addVehicleForm.classList.add('hidden');
  vehicleInfo.classList.remove('hidden');
  
  const vehicleInfo = results.vehicleInfo;
  const registrationDate = new Date(vehicleInfo.registrationDate).toLocaleDateString();
  const lastDetected = vehicleInfo.lastDetected ? new Date(vehicleInfo.lastDetected).toLocaleString() : 'Never';
  
  vehicleDetails.innerHTML = `
    <div class="mb-2">
      <span class="font-semibold">Owner:</span> ${vehicleInfo.ownerName}
    </div>
    <div class="mb-2">
      <span class="font-semibold">Contact:</span> ${vehicleInfo.contactInfo}
    </div>
    ${vehicleInfo.additionalInfo ? `
      <div class="mb-2">
        <span class="font-semibold">Additional Info:</span> ${vehicleInfo.additionalInfo}
      </div>
    ` : ''}
    <div class="mb-2">
      <span class="font-semibold">Registration Date:</span> ${registrationDate}
    </div>
    <div class="mb-2">
      <span class="font-semibold">Last Detected:</span> ${lastDetected}
    </div>
  `;
}

// Show add vehicle form
function showAddVehicleForm() {
  vehicleInfo.classList.add('hidden');
  addVehicleForm.classList.remove('hidden');
}

// Show loading overlay
function showLoading() {
  loadingOverlay.classList.remove('hidden');
  captureButton.disabled = true;
}

// Hide loading overlay
function hideLoading() {
  loadingOverlay.classList.add('hidden');
  captureButton.disabled = false;
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  setTimeout(() => {
    errorMessage.classList.add('hidden');
  }, 5000);
}

// Hide error message
function hideError() {
  errorMessage.classList.add('hidden');
}

// Show success message
function showSuccess(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove('hidden');
  errorMessage.classList.remove('bg-red-100', 'text-red-700');
  errorMessage.classList.add('bg-green-100', 'text-green-700');
  
  setTimeout(() => {
    errorMessage.classList.add('hidden');
    errorMessage.classList.remove('bg-green-100', 'text-green-700');
    errorMessage.classList.add('bg-red-100', 'text-red-700');
  }, 5000);
}

// Initialize on page load
window.addEventListener('load', init);