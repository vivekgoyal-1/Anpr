const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// Get vehicle by plate number
router.get('/:plateNumber', async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const vehicle = await Vehicle.findByPlateNumber(plateNumber);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.status(200).json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
});

// Check if a plate number exists in the database (POST method)
router.post('/check', async (req, res) => {
  try {
    const { plateNumber } = req.body;
    
    if (!plateNumber) {
      return res.status(400).json({ error: 'Plate number is required' });
    }
    
    const result = await Vehicle.checkVehicle(plateNumber);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error checking vehicle:', error);
    res.status(500).json({ error: 'Failed to check vehicle' });
  }
});

// Check if a plate number exists in the database (GET method with query parameter)
router.get('/check', async (req, res) => {
  try {
    const { plateNumber } = req.query;
    
    if (!plateNumber) {
      return res.status(400).json({ error: 'Plate number is required' });
    }
    
    const result = await Vehicle.checkVehicle(plateNumber);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error checking vehicle:', error);
    res.status(500).json({ error: 'Failed to check vehicle' });
  }
});

// Add a new vehicle
router.post('/', async (req, res) => {
  try {
    const { plateNumber, ownerInfo } = req.body;
    
    if (!plateNumber || !ownerInfo || !ownerInfo.ownerName || !ownerInfo.contactInfo) {
      return res.status(400).json({ 
        error: 'Plate number, owner name, and contact info are required' 
      });
    }
    
    // Check if vehicle already exists
    const existingVehicle = await Vehicle.findByPlateNumber(plateNumber);
    
    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle with this plate number already exists' });
    }
    
    // Create new vehicle
    const vehicle = await Vehicle.create({ plateNumber, ownerInfo });
    
    res.status(201).json(vehicle);
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
});

// Update a vehicle
router.put('/:plateNumber', async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const { ownerInfo } = req.body;
    
    if (!ownerInfo) {
      return res.status(400).json({ error: 'Owner information is required' });
    }
    
    const existingVehicle = await Vehicle.findByPlateNumber(plateNumber);
    
    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Update vehicle info
    const updatedVehicle = await Vehicle.update(plateNumber, ownerInfo);
    
    res.status(200).json(updatedVehicle);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
});

// Delete a vehicle
router.delete('/:plateNumber', async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const deletedVehicle = await Vehicle.delete(plateNumber);
    
    if (!deletedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// Log a detection
router.post('/:plateNumber/detect', async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    const { location } = req.body;
    
    const vehicle = await Vehicle.findByPlateNumber(plateNumber);
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const updatedVehicle = await Vehicle.logDetection(plateNumber, location || 'Main Gate');
    
    res.status(200).json({ 
      message: 'Detection logged successfully',
      lastDetected: updatedVehicle.last_detected
    });
  } catch (error) {
    console.error('Error logging detection:', error);
    res.status(500).json({ error: 'Failed to log detection' });
  }
});

module.exports = router;