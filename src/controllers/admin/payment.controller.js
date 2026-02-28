const paymentService = require("../../services/admin/payment.service");

/**
 * Uber-Style Payment Controller
 */

exports.listPayouts = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id, status } = req.query;

        const payouts = await paymentService.getPayouts(organizationId, { storeId: store_id, status });

        return res.json({
            success: true,
            data: payouts
        });
    } catch (error) {
        console.error("List Payouts Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch payouts"
        });
    }
};

exports.getFinancialSummary = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id } = req.query;

        const summary = await paymentService.getFinancialSummary(organizationId, { storeId: store_id });

        return res.json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error("Financial Summary Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch financial summary"
        });
    }
};

exports.listInvoices = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id, limit } = req.query;

        const invoices = await paymentService.getInvoices(organizationId, { storeId: store_id, limit });

        return res.json({
            success: true,
            data: invoices
        });
    } catch (error) {
        console.error("List Invoices Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch invoices"
        });
    }
};
