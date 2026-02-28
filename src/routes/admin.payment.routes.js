const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/admin/payment.controller");

router.get("/payouts", paymentController.listPayouts);
router.get("/summary", paymentController.getFinancialSummary);
router.get("/invoices", paymentController.listInvoices);

module.exports = router;
