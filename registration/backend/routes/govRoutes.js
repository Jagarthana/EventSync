const express = require('express');
const router = express.Router();
const { getEvents, updateEventStatus } = require('../controllers/govController');
const { protect, govAuth } = require('../middlewares/authMiddleware');

router.route('/events').get(protect, govAuth, getEvents);
router.route('/events/:id/status').put(protect, govAuth, updateEventStatus);

module.exports = router;
