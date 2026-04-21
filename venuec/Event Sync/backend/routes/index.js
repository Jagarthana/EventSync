const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/authMiddleware');

const healthCtrl = require('../controllers/health.controller');
const authCtrl = require('../controllers/auth.controller');
const profileCtrl = require('../controllers/profile.controller');
const venueCtrl = require('../controllers/venue.controller');
const equipmentCtrl = require('../controllers/equipment.controller');
const allocationCtrl = require('../controllers/allocation.controller');
const studentBookingCtrl = require('../controllers/studentBooking.controller');
const conflictCtrl = require('../controllers/conflict.controller');
const maintenanceCtrl = require('../controllers/maintenance.controller');
const activityCtrl = require('../controllers/activity.controller');
const preEventCtrl = require('../controllers/preEvent.controller');
const dashboardCtrl = require('../controllers/dashboard.controller');
const calendarCtrl = require('../controllers/calendar.controller');
const adminCtrl = require('../controllers/admin.controller');

const router = express.Router();

router.get('/health', healthCtrl.health);

router.post('/auth/login', asyncHandler(authCtrl.login));
router.get('/auth/me', requireAuth, asyncHandler(authCtrl.me));

router.get('/profile', requireAuth, asyncHandler(profileCtrl.get));
router.put('/profile', requireAuth, asyncHandler(profileCtrl.update));

router.get('/venues', requireAuth, asyncHandler(venueCtrl.list));
router.post('/venues', requireAuth, asyncHandler(venueCtrl.create));
router.put('/venues/:venueId', requireAuth, asyncHandler(venueCtrl.update));
router.delete('/venues/:venueId', requireAuth, asyncHandler(venueCtrl.remove));

router.get('/equipment', requireAuth, asyncHandler(equipmentCtrl.list));
router.post('/equipment', requireAuth, asyncHandler(equipmentCtrl.create));
router.put('/equipment/:equipmentId', requireAuth, asyncHandler(equipmentCtrl.update));
router.delete('/equipment/:equipmentId', requireAuth, asyncHandler(equipmentCtrl.remove));

router.get('/allocations', requireAuth, asyncHandler(allocationCtrl.list));
router.patch('/allocations/:bookingId/status', requireAuth, asyncHandler(allocationCtrl.patchStatus));
router.put('/allocations/:bookingId', requireAuth, asyncHandler(allocationCtrl.put));

router.get('/student-bookings', requireAuth, asyncHandler(studentBookingCtrl.list));

router.get('/conflicts', requireAuth, asyncHandler(conflictCtrl.list));
router.patch('/conflicts/:id', requireAuth, asyncHandler(conflictCtrl.update));

router.get('/maintenance', requireAuth, asyncHandler(maintenanceCtrl.list));
router.post('/maintenance', requireAuth, asyncHandler(maintenanceCtrl.create));
router.patch('/maintenance/:id', requireAuth, asyncHandler(maintenanceCtrl.update));

router.get('/activity', requireAuth, asyncHandler(activityCtrl.list));
router.post('/activity', requireAuth, asyncHandler(activityCtrl.create));

router.get('/pre-event-checklists', requireAuth, asyncHandler(preEventCtrl.getAll));
router.put('/pre-event-checklists/:bookingId', requireAuth, asyncHandler(preEventCtrl.put));

router.get('/dashboard/summary', requireAuth, asyncHandler(dashboardCtrl.summary));

router.get('/calendar/overlaps', requireAuth, asyncHandler(calendarCtrl.overlaps));

router.post('/admin/reset-demo', requireAuth, asyncHandler(adminCtrl.resetDemo));

module.exports = router;
