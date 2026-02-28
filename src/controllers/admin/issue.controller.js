const issueService = require("../../services/admin/issue.service");

/**
 * Uber-Style Issues & Support Controller
 */

exports.listIssues = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id, status, severity, type } = req.query;

        const issues = await issueService.getIssues(organizationId, { store_id, status, severity, type });

        return res.json({
            success: true,
            data: issues
        });
    } catch (error) {
        console.error("List Issues Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch issues"
        });
    }
};

exports.getIssueDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const issue = await issueService.getIssueDetails(id);

        return res.json({
            success: true,
            data: issue
        });
    } catch (error) {
        console.error("Issue Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch issue details"
        });
    }
};

exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        const updated = await issueService.updateIssueStatus(id, status, notes);

        return res.json({
            success: true,
            data: updated,
            message: "Issue status updated"
        });
    } catch (error) {
        console.error("Update Issue Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update issue status"
        });
    }
};

exports.getLiveConsole = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const events = await issueService.getLiveConsoleEvents(organizationId);

        return res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error("Live Console Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch live console events"
        });
    }
};

exports.getCritical = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id } = req.query;

        const issues = await issueService.getCriticalIssues(organizationId, store_id);

        return res.json({
            success: true,
            data: issues
        });
    } catch (error) {
        console.error("Critical Issues Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch critical issues"
        });
    }
};

exports.getEscalations = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id } = req.query;

        const orders = await issueService.getEscalatedOrders(organizationId, store_id);

        return res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        console.error("Escalations Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch escalations"
        });
    }
};
