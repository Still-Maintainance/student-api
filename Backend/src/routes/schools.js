const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Validation helper 
const validateSchoolInput = (name, address, latitude, longitude) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!address || typeof address !== 'string' || address.trim() === '') {
    errors.push('Address is required and must be a non-empty string');
  }

  if (latitude === undefined || latitude === null) {
    errors.push('Latitude is required');
  } else if (isNaN(latitude) || parseFloat(latitude) < -90 || parseFloat(latitude) > 90) {
    errors.push('Latitude must be a valid number between -90 and 90');
  }

  if (longitude === undefined || longitude === null) {
    errors.push('Longitude is required');
  } else if (isNaN(longitude) || parseFloat(longitude) < -180 || parseFloat(longitude) > 180) {
    errors.push('Longitude must be a valid number between -180 and 180');
  }

  return errors;
};

// API 1: Add School
router.post('/addSchool', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;

    // Validate inputs
    const errors = validateSchoolInput(name, address, latitude, longitude);
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }
    
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name.trim(), address.trim(), parseFloat(latitude), parseFloat(longitude)]
    );
    connection.release();

    res.status(201).json({ 
      success: true,
      message: 'School added successfully',
      data: {
        id: result.insertId,
        name: name.trim(),
        address: address.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error adding school',
      error: error.message 
    });
  }
});

router.get('/listSchools', async (req, res) => {
  try {
    // Accept both 'latitude'/'longitude' and 'lat'/'lon' parameter names
    const lat = req.query.latitude || req.query.lat;
    const lon = req.query.longitude || req.query.lon;

    // Validate that coordinates are provided and valid
    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Missing required query parameters: latitude (or lat) and longitude (or lon)'
      });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    // Validate that parsed values are valid numbers
    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude must be valid numbers'
      });
    }

    // Validate coordinate ranges
    if (userLat < -90 || userLat > 90) {
      return res.status(400).json({
        success: false,
        message: 'Latitude must be between -90 and 90'
      });
    }

    if (userLon < -180 || userLon > 180) {
      return res.status(400).json({
        success: false,
        message: 'Longitude must be between -180 and 180'
      });
    }

    const connection = await pool.getConnection();

    const [schools] = await connection.query(
      "SELECT name, address, latitude, longitude FROM schools"
    );

    connection.release();

    const schoolsWithDistance = schools
      .map((school) => {
        const schoolLat = parseFloat(school.latitude);
        const schoolLon = parseFloat(school.longitude);

        const distance = calculateDistance(
          userLat,
          userLon,
          schoolLat,
          schoolLon
        );

        return {
          name: school.name,
          address: school.address,
          latitude: schoolLat,
          longitude: schoolLon,
          distance
        };
      })
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({
      success: true,
      userLocation: { latitude: userLat, longitude: userLon },
      data: schoolsWithDistance
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching schools",
      error: error.message
    });
  }
});

// Get all schools (without distance calculation)
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM schools');
    connection.release();
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching schools',
      error: error.message 
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM schools WHERE id = ?', [req.params.id]);
    connection.release();
    
    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'School not found' 
      });
    }
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error fetching school',
      error: error.message 
    });
  }
});

// Update a school
router.put('/:id', async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    
    const errors = validateSchoolInput(name, address, latitude, longitude);
    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors 
      });
    }

    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE schools SET name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?',
      [name.trim(), address.trim(), parseFloat(latitude), parseFloat(longitude), req.params.id]
    );
    connection.release();
    res.status(200).json({ 
      success: true,
      message: 'School updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error updating school',
      error: error.message 
    });
  }
});

// Delete a school
router.delete('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const result = await connection.query('DELETE FROM schools WHERE id = ?', [req.params.id]);
    connection.release();
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'School not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'School deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error deleting school',
      error: error.message 
    });
  }
});

module.exports = router;
