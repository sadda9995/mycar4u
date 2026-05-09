const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.loginAdmin);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/invite', protect, authorize(['super_admin', 'city_admin']), authController.inviteStaff);
router.post('/activate', authController.activateStaff);
router.post('/login-staff', authController.loginStaff);
router.post('/staff/forgot', authController.staffForgotPassword);
router.post('/staff/reset', authController.staffResetPassword);

module.exports = router;
