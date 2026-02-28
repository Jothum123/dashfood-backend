const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/register', notificationController.registerPushToken);

module.exports = router;
