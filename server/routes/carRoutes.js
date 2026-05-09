const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize(['super_admin', 'city_admin']), carController.createCar)
    .get(carController.getCars);

router.route('/:id')
    .get(carController.getCarById)
    .put(protect, authorize(['super_admin', 'city_admin']), carController.updateCar)
    .delete(protect, authorize(['super_admin', 'city_admin']), carController.deleteCar);

module.exports = router;
