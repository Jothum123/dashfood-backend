const settingsService = require("../../services/admin/settings.service");

/**
 * Uber-Style System Settings Controller
 */

exports.getSettings = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const settings = await settingsService.getGlobalSettings(organizationId);

        return res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error("Get Settings Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch system settings"
        });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const settings = await settingsService.updateGlobalSettings(organizationId, req.body);

        return res.json({
            success: true,
            data: settings,
            message: "System settings updated successfully"
        });
    } catch (error) {
        console.error("Update Settings Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update system settings"
        });
    }
};

exports.getWhiteLabel = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const config = await settingsService.getWhiteLabelConfig(organizationId);

        return res.json({
            success: true,
            data: config
        });
    } catch (error) {
        console.error("Get White Label Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch white-label configuration"
        });
    }
};

exports.postAnnouncement = async (req, res) => {
    try {
        const announcement = await settingsService.createAnnouncement(req.body);

        return res.json({
            success: true,
            data: announcement.data,
            message: "Announcement posted successfully"
        });
    } catch (error) {
        console.error("Post Announcement Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to post announcement"
        });
    }
};
