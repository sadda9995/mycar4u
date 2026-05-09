const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/webhook', paymentController.verifyWebhook);
router.get('/all', protect, authorize(['super_admin', 'city_admin', 'office_staff']), paymentController.getAllPayments);

module.exports = router;
