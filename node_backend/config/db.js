pepconst { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL database');
    client.release();
  } catch (err) {
    console.error('Error connecting to PostgreSQL database:', err);
    throw err;
  }
};

// Initialize database tables
const initDB = async () => {
  const client = await pool.connect();
  
  try {
    // Create vehicles table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        plate_number VARCHAR(20) UNIQUE NOT NULL,
        owner_name VARCHAR(100) NOT NULL,
        contact_info VARCHAR(100) NOT NULL,
        additional_info TEXT,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_detected TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create detection_history table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS detection_history (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        location VARCHAR(100) DEFAULT 'Main Gate',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database tables:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  pool,
  testConnection,
  initDB
};