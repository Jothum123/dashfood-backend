const analyticsService = require("../../services/admin/analytics.service");

exports.getOverview = async (req, res) => {
    try {
        const { store_id } = req.query;
        const organizationId = req.headers["x-organization-id"];

        const data = await analyticsService.getAdminOverview(organizationId, store_id);

        return res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("Admin Overview Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch admin overview",
        });
    }
};

exports.getKPIs = async (req, res) => {
    try {
        const { store_id } = req.query;
        const organizationId = req.headers["x-organization-id"];

        const kpis = await analyticsService.getKPIs(organizationId, store_id);

        return res.json({
            success: true,
            data: kpis,
        });
    } catch (error) {
        console.error("KPI Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch KPIs",
        });
    }
};

exports.getAlerts = async (req, res) => {
    try {
        const { store_id } = req.query;
        const organizationId = req.headers["x-organization-id"];

        const alerts = await analyticsService.getDashboardAlerts(organizationId, store_id);

        return res.json({
            success: true,
            data: alerts,
        });
    } catch (error) {
        console.error("Dashboard Alerts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard alerts",
        });
    }
};
