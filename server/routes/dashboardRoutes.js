const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize(['super_admin', 'city_admin', 'office_staff']), dashboardController.getDashboardStats);

module.exports = router;
