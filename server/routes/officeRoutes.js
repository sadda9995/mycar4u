const express = require('express');
const router = express.Router();
const officeController = require('../controllers/officeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, authorize(['super_admin', 'city_admin', 'office_staff']), officeController.getOffices)
    .post(protect, authorize(['super_admin']), officeController.createOffice);

router.route('/:id')
    .put(protect, authorize(['super_admin']), officeController.updateOffice)
    .delete(protect, authorize(['super_admin']), officeController.deleteOffice);

module.exports = router;
