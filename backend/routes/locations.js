const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/locations
// Returns all locations (Regions, Governorates, Cities)
router.get('/', async (req, res) => {
  try {
    const [locations] = await db.query('SELECT * FROM locations ORDER BY parent_id ASC, id ASC');
    
    // Group into hierarchy
    const regionMap = {};
    const govMap = {};
    const flatLocations = locations.map(loc => {
      let parsedName = loc.name;
      try {
        parsedName = JSON.parse(loc.name);
      } catch(e) {}
      return { ...loc, name: parsedName, children: [] };
    });

    const regions = [];
    flatLocations.forEach(loc => {
      if (loc.type === 'Region') {
        regionMap[loc.id] = loc;
        regions.push(loc);
      } else if (loc.type === 'Governorate') {
        govMap[loc.id] = loc;
        if (loc.parent_id && regionMap[loc.parent_id]) {
          regionMap[loc.parent_id].children.push(loc);
        }
      } else if (loc.type === 'City') {
        if (loc.parent_id && govMap[loc.parent_id]) {
          govMap[loc.parent_id].children.push(loc);
        }
      }
    });

    res.json({ success: true, locations: regions, flat: flatLocations });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
