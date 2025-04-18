const { pool } = require('../config/db');

class Vehicle {
  // Get all vehicles
  static async findAll() {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY created_at DESC');
    return result.rows;
  }
  
  // Find vehicle by plate number
  static async findByPlateNumber(plateNumber) {
    const result = await pool.query(
      'SELECT * FROM vehicles WHERE plate_number = $1',
      [plateNumber.toUpperCase()]
    );
    return result.rows[0];
  }
  
  // Create a new vehicle
  static async create(vehicleData) {
    const { plateNumber, ownerInfo } = vehicleData;
    
    const result = await pool.query(
      `INSERT INTO vehicles 
       (plate_number, owner_name, contact_info, additional_info) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [
        plateNumber.toUpperCase(), 
        ownerInfo.ownerName, 
        ownerInfo.contactInfo, 
        ownerInfo.additionalInfo || ''
      ]
    );
    
    return result.rows[0];
  }
  
  // Update a vehicle
  static async update(plateNumber, ownerInfo) {
    const result = await pool.query(
      `UPDATE vehicles 
       SET owner_name = $1, 
           contact_info = $2, 
           additional_info = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE plate_number = $4 
       RETURNING *`,
      [
        ownerInfo.ownerName, 
        ownerInfo.contactInfo, 
        ownerInfo.additionalInfo || '',
        plateNumber.toUpperCase()
      ]
    );
    
    return result.rows[0];
  }
  
  // Delete a vehicle
  static async delete(plateNumber) {
    const result = await pool.query(
      'DELETE FROM vehicles WHERE plate_number = $1 RETURNING *',
      [plateNumber.toUpperCase()]
    );
    
    return result.rows[0];
  }
  
  // Log a detection
  static async logDetection(plateNumber, location = 'Main Gate') {
    // Start transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get vehicle ID
      const vehicleResult = await client.query(
        'SELECT id FROM vehicles WHERE plate_number = $1',
        [plateNumber.toUpperCase()]
      );
      
      if (vehicleResult.rows.length === 0) {
        throw new Error('Vehicle not found');
      }
      
      const vehicleId = vehicleResult.rows[0].id;
      
      // Update last_detected timestamp
      await client.query(
        'UPDATE vehicles SET last_detected = CURRENT_TIMESTAMP WHERE id = $1',
        [vehicleId]
      );
      
      // Add entry to detection_history
      await client.query(
        'INSERT INTO detection_history (vehicle_id, location) VALUES ($1, $2)',
        [vehicleId, location]
      );
      
      await client.query('COMMIT');
      
      // Get updated vehicle
      const updatedVehicle = await client.query(
        'SELECT * FROM vehicles WHERE id = $1',
        [vehicleId]
      );
      
      return updatedVehicle.rows[0];
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  
  // Check if a vehicle exists and return info
  static async checkVehicle(plateNumber) {
    try {
      const vehicle = await this.findByPlateNumber(plateNumber);
      
      if (vehicle) {
        // Log detection
        await this.logDetection(plateNumber);
        
        // Return vehicle info in the format the frontend expects
        return {
          exists: true,
          vehicleInfo: {
            ownerName: vehicle.owner_name,
            contactInfo: vehicle.contact_info,
            additionalInfo: vehicle.additional_info,
            registrationDate: vehicle.registration_date,
            lastDetected: vehicle.last_detected
          }
        };
      }
      
      return { exists: false };
    } catch (err) {
      console.error('Error checking vehicle:', err);
      throw err;
    }
  }
}

module.exports = Vehicle;