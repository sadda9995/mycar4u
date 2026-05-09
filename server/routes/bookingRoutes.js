const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, bookingController.createBooking)
    .get(protect, authorize(['super_admin', 'city_admin', 'office_staff']), bookingController.getAllBookings);

router.route('/my')
    .get(protect, bookingController.getMyBookings);

router.route('/:id')
    .put(protect, authorize(['super_admin', 'city_admin', 'office_staff']), bookingController.updateBooking)
    .get(protect, authorize(['super_admin', 'city_admin', 'office_staff']), bookingController.getBookingById);

module.exports = router;
