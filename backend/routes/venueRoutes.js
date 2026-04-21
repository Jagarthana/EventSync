const express = require('express');
const router = express.Router();
const {
  getPendingRequests,
  getVenueSnapshot,
  allocateVenue,
  updateVenueDecision
} = require('../controllers/venueController');
const { protect, venueAuth, venueSnapshotReaderAuth } = require('../middlewares/authMiddleware');

router.route('/requests').get(protect, venueAuth, getPendingRequests);
router.route('/snapshot').get(protect, venueSnapshotReaderAuth, getVenueSnapshot);
router.route('/allocate/:id').put(protect, venueAuth, allocateVenue);
router.route('/decision/:id').put(protect, venueAuth, updateVenueDecision);

module.exports = router;
