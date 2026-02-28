const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const { validateApiKey } = require('../middleware/apiKeyMiddleware');

router.post('/new-order', validateApiKey, webhookController.handleNewOrder);
router.post('/supabase-sync', validateApiKey, webhookController.handleSupabaseSync);

module.exports = router;
