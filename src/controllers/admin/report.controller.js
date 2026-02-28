const analyticsService = require("../../services/admin/analytics.service");
const reportService = require("../../services/admin/report.service");

/**
 * Uber-Style Reports & Analytics Controller
 */

exports.getHistoricalTrends = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { days } = req.query;

        const trends = await analyticsService.getHistoricalTrends(organizationId, parseInt(days) || 7);

        return res.json({
            success: true,
            data: trends
        });
    } catch (error) {
        console.error("Historical Trends Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch historical trends"
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
        console.error("Store Comparisons Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch store comparisons"
        });
    }
};

exports.exportSalesReport = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { start_date, end_date } = req.query;

        const report = await reportService.generateSalesReport(organizationId, start_date, end_date);

        res.setHeader("Content-Type", report.contentType);
        res.setHeader("Content-Disposition", `attachment; filename=${report.filename}`);
        return res.send(report.content);
    } catch (error) {
        console.error("Export Sales Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to export sales report"
        });
    }
};

exports.exportOperationsReport = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { start_date, end_date } = req.query;

        const report = await reportService.generateOperationsReport(organizationId, start_date, end_date);

        res.setHeader("Content-Type", report.contentType);
        res.setHeader("Content-Disposition", `attachment; filename=${report.filename}`);
        return res.send(report.content);
    } catch (error) {
        console.error("Export Operations Report Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to export operations report"
        });
    }
};
