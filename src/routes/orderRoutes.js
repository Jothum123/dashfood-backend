const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
