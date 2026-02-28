const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/admin/dashboard.controller");

router.get("/overview", dashboardController.getOverview);
router.get("/kpis", dashboardController.getKPIs);
router.get("/alerts", dashboardController.getAlerts);

module.exports = router;
