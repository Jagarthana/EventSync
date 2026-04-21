const express = require('express');
const router = express.Router();

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

// Reads for students + officers; writes for Venue Officer.
router.route('/venues').get(protect, listVenues).post(protect, venueAuth, createVenue);
router.route('/venues/:id').put(protect, venueAuth, updateVenue).delete(protect, venueAuth, deleteVenue);
router.route('/equipment').get(protect, listEquipment).post(protect, venueAuth, createEquipment);
router.route('/equipment/:id').put(protect, venueAuth, updateEquipment).delete(protect, venueAuth, deleteEquipment);

module.exports = router;

