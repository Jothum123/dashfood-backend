const menuService = require("../../services/admin/menu.service");

/**
 * Uber-Style Menu Controller
 */

// --- Categories ---

exports.getCategories = async (req, res) => {
    try {
        const { store_id } = req.query;
        const organizationId = req.headers["x-organization-id"];

        const categories = await menuService.getCategories(organizationId, store_id);

        return res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Get Categories Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch menu categories"
        });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const categoryData = { ...req.body, organization_id: organizationId };

        const category = await menuService.createCategory(categoryData);

        return res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error("Create Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create category"
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await menuService.updateCategory(id, req.body);

        return res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error("Update Category Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update category"
        });
    }
};

// --- Items ---

exports.getItems = async (req, res) => {
    try {
        const { category_id } = req.query;
        const items = await menuService.getItems(category_id);

        return res.json({
            success: true,
            data: items
        });
    } catch (error) {
        console.error("Get Items Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch menu items"
        });
    }
};

exports.createItem = async (req, res) => {
    try {
        const item = await menuService.createItem(req.body);

        return res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error("Create Item Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create menu item"
        });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await menuService.updateItem(id, req.body);

        return res.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error("Update Item Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update menu item"
        });
    }
};

exports.toggleAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_available } = req.body;

        const item = await menuService.toggleItemAvailability(id, is_available);

        return res.json({
            success: true,
            data: item,
            message: `Item availability set to ${is_available ? 'Available' : 'Unavailable'}`
        });
    } catch (error) {
        console.error("Toggle Availability Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update item availability"
        });
    }
};

// --- Sync ---

exports.syncMenu = async (req, res) => {
    try {
        const { source_store_id } = req.body;
        const organizationId = req.headers["x-organization-id"];

        const result = await menuService.syncMenuToAllStores(organizationId, source_store_id);

        return res.json(result);
    } catch (error) {
        console.error("Sync Menu Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to sync menu"
        });
    }
};
