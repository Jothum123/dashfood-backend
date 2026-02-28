const customerService = require("../../services/admin/customer.service");

/**
 * Uber-Style Customer & Feedback Controller
 */

exports.listCustomers = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id, min_orders, min_spent } = req.query;

        const customers = await customerService.getCustomers(organizationId, {
            storeId: store_id,
            minOrders: min_orders,
            minSpent: min_spent
        });

        return res.json({
            success: true,
            data: customers
        });
    } catch (error) {
        console.error("List Customers Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customers"
        });
    }
};

exports.listFeedback = async (req, res) => {
    try {
        const { store_id, rating, status } = req.query;
        const feedback = await customerService.getFeedback(store_id, { rating, status });

        return res.json({
            success: true,
            data: feedback
        });
    } catch (error) {
        console.error("List Feedback Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch feedback"
        });
    }
};

exports.getInsights = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const insights = await customerService.getInsights(organizationId);

        return res.json({
            success: true,
            data: insights
        });
    } catch (error) {
        console.error("Customer Insights Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer insights"
        });
    }
};
