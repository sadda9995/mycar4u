const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const cityController = require('../controllers/cityController');

router.route('/')
    .get(cityController.getCities)
    .post(protect, authorize(['super_admin']), cityController.createCity);

router.route('/:id')
    .put(protect, authorize(['super_admin']), cityController.updateCity)
    .delete(protect, authorize(['super_admin']), cityController.deleteCity);

module.exports = router;
