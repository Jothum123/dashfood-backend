const express = require("express");
const router = express.Router();

const ordersAdminController = require("../controllers/admin/orders.admin.controller");

router.get("/list", ordersAdminController.listOrders);
router.get("/details/:id", ordersAdminController.getOrderDetails);
router.post("/resolve-issue/:id", ordersAdminController.resolveIssue);
router.post("/refund/:id", ordersAdminController.processRefund);
router.patch("/update-status/:id", ordersAdminController.updateStatus);

module.exports = router;
