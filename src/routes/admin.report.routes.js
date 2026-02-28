const express = require("express");
const router = express.Router();
const reportController = require("../controllers/admin/report.controller");

router.get("/trends", reportController.getHistoricalTrends);
router.get("/comparisons", reportController.getStoreComparisons);
router.get("/export/sales", reportController.exportSalesReport);
router.get("/export/operations", reportController.exportOperationsReport);

module.exports = router;
