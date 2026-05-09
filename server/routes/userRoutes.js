const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize(['super_admin', 'city_admin', 'office_staff']), userController.getAllUsers);
router.post('/', protect, authorize(['super_admin', 'city_admin']), userController.createUser);
router.put('/me/profile', protect, userController.updateMe);
router.put('/:id', protect, authorize(['super_admin', 'city_admin']), userController.updateUser);

module.exports = router;
