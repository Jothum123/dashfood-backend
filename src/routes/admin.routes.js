const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middleware/rbac.middleware");

// Health Check (first test endpoint)
router.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "DashFood Admin API is live 🚀",
    });
});

// Mount sub-modules (Uber-style architecture)
const dashboardRoutes = require("./admin.dashboard.routes");
const ordersAdminRoutes = require("./admin.orders.routes");
const storesRoutes = require("./admin.stores.routes");
const menuRoutes = require("./admin.menu.routes");
const reportRoutes = require("./admin.report.routes");
const issueRoutes = require("./admin.issue.routes");
const adminUserRoutes = require("./admin.user.routes");
const settingsRoutes = require("./admin.settings.routes");
const marketingRoutes = require("./admin.marketing.routes");
const customerRoutes = require("./admin.customer.routes");
const paymentRoutes = require("./admin.payment.routes");
const performanceRoutes = require("./admin.performance.routes");

router.use("/dashboard", requireAdmin, dashboardRoutes);
router.use("/orders", requireAdmin, ordersAdminRoutes);
router.use("/performance", requireAdmin, performanceRoutes);
router.use("/stores", requireAdmin, storesRoutes);
router.use("/menu", requireAdmin, menuRoutes);
router.use("/reports", requireAdmin, reportRoutes);
router.use("/issues", requireAdmin, issueRoutes);
router.use("/users", requireAdmin, adminUserRoutes);
router.use("/settings", requireAdmin, settingsRoutes);
router.use("/marketing", requireAdmin, marketingRoutes);
router.use("/customers", requireAdmin, customerRoutes);
router.use("/payments", requireAdmin, paymentRoutes);

module.exports = router;
