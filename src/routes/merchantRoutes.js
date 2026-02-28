const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const { authenticateMerchant, authorizeRole } = require('../middleware/authMiddleware');

router.get('/dashboard/overview', authenticateMerchant, merchantController.getDashboardOverview);
router.get('/stores', authenticateMerchant, merchantController.getStores);
router.get('/menu', authenticateMerchant, merchantController.getMenu);
router.get('/performance', authenticateMerchant, merchantController.getPerformance);
router.get('/users', authenticateMerchant, authorizeRole(['Owner', 'Admin']), merchantController.getUsers);
router.get('/reports', authenticateMerchant, merchantController.getReports);
router.get('/issues', authenticateMerchant, merchantController.getIssues);
router.get('/settings', authenticateMerchant, authorizeRole(['Owner', 'Admin']), merchantController.getSettings);

module.exports = router;
