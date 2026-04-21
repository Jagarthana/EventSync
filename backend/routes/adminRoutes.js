const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, getLogs } = require('../controllers/adminController');
const { protect, superAdminAuth } = require('../middlewares/authMiddleware');

// All admin routes are protected and require superAdminAuth
router.use(protect);
router.use(superAdminAuth);

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.get('/logs', getLogs);

module.exports = router;
