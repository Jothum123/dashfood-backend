const express = require("express");
const router = express.Router();
const customerController = require("../controllers/admin/customer.controller");

router.get("/list", customerController.listCustomers);
router.get("/feedback", customerController.listFeedback);
router.get("/insights", customerController.getInsights);

module.exports = router;
