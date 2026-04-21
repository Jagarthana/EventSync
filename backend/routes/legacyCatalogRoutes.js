const express = require('express');
const router = express.Router();

// Backwards-compatible aliases for older frontends that call:
// - GET/POST /api/venues
// - GET/POST /api/equipment
// This keeps venue officer + student visibility working even if some UI still uses legacy paths.

const {
  listVenues,
  createVenue,
  updateVenue,
  deleteVenue,
  listEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
} = require('../controllers/catalogController');

const { protect, venueAuth } = require('../middlewares/authMiddleware');
const { chatHelp } = require('../controllers/helpAssistantController');

router.post('/help/chat', chatHelp);

router.route('/venues').get(protect, listVenues).post(protect, venueAuth, createVenue);
router.route('/venues/:id').put(protect, venueAuth, updateVenue).delete(protect, venueAuth, deleteVenue);

router.route('/equipment').get(protect, listEquipment).post(protect, venueAuth, createEquipment);
router.route('/equipment/:id').put(protect, venueAuth, updateEquipment).delete(protect, venueAuth, deleteEquipment);

module.exports = router;

