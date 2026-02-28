const analyticsService = require("../../services/admin/analytics.service");

/**
 * Uber-Style Performance Controller
 * Powering deep insights into store operations.
 */

exports.getPerformanceSummary = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id } = req.query;

        // Use core analytics service but return aggregated summary
        const overview = await analyticsService.getAdminOverview(organizationId, store_id);

        return res.json({
            success: true,
            data: {
                total_revenue: overview.revenue_today,
                total_orders: overview.orders_today,
                avg_prep_time: overview.avg_prep_time,
                reliability_score: 98 // Mocked enterprise metric
            }
        });
    } catch (error) {
        console.error("Performance Summary Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch performance summary"
        });
    }
};

exports.getPrepTimeTrends = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id, days } = req.query;

        // Future: specific prep-time extraction by time-bucket
        const trends = await analyticsService.getHistoricalTrends(organizationId, parseInt(days) || 7);

        return res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error("Prep Time Trends Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch prep time trends"
        });
    }
};

exports.getStoreComparisons = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const comparisons = await analyticsService.getStoreComparisons(organizationId);

        return res.json({
            success: true,
            data: comparisons
        });
    } catch (error) {
        console.error("Store Comparison Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch store comparisons"
        });
    }
};
