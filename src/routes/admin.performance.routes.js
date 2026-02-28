const express = require("express");
const router = express.Router();
const performanceController = require("../controllers/admin/performance.controller");

router.get("/summary", performanceController.getPerformanceSummary);
router.get("/prep-time-trends", performanceController.getPrepTimeTrends);
router.get("/store-comparison", performanceController.getStoreComparisons);

module.exports = router;
