const storesService = require("../../services/admin/stores.service");

/**
 * Uber-Style Stores Controller
 */
exports.getStores = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const stores = await storesService.getAllStores(organizationId);

        return res.json({
            success: true,
            data: stores
        });
    } catch (error) {
        console.error("Get Stores Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch stores"
        });
    }
};

exports.getStoreDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const store = await storesService.getStoreDetails(id);

        return res.json({
            success: true,
            data: store
        });
    } catch (error) {
        console.error("Store Details Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch store details"
        });
    }
};

exports.toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_active } = req.body;

        const updated = await storesService.updateStoreStatus(id, is_active);

        return res.json({
            success: true,
            data: updated,
            message: `Store ${is_active ? 'Online' : 'Offline'} successfully`
        });
    } catch (error) {
        console.error("Toggle Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update store status"
        });
    }
};

exports.updateConfig = async (req, res) => {
    try {
        const { id } = req.params;
        const config = req.body;

        const updated = await storesService.updateStoreConfig(id, config);

        return res.json({
            success: true,
            data: updated
        });
    } catch (error) {
        console.error("Update Config Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update store configuration"
        });
    }
};

exports.getBusinessHours = async (req, res) => {
    try {
        const { id } = req.params;
        const hours = await storesService.getBusinessHours(id);

        return res.json({
            success: true,
            data: hours
        });
    } catch (error) {
        console.error("Get Hours Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch business hours"
        });
    }
};
