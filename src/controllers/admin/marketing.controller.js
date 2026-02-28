const marketingService = require("../../services/admin/marketing.service");

/**
 * Uber-Style Marketing & Offers Controller
 */

exports.listOffers = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id, is_active } = req.query;

        const offers = await marketingService.getOffers(organizationId, {
            storeId: store_id,
            isActive: is_active === 'true' ? true : (is_active === 'false' ? false : undefined)
        });

        return res.json({
            success: true,
            data: offers
        });
    } catch (error) {
        console.error("List Offers Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch offers"
        });
    }
};

exports.createOffer = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const offerData = { ...req.body, organization_id: organizationId };

        const offer = await marketingService.createOffer(offerData);

        return res.json({
            success: true,
            data: offer,
            message: "Offer created successfully"
        });
    } catch (error) {
        console.error("Create Offer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create offer"
        });
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await marketingService.updateOffer(id, req.body);

        return res.json({
            success: true,
            data: updated,
            message: "Offer updated successfully"
        });
    } catch (error) {
        console.error("Update Offer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update offer"
        });
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const { id } = req.params;
        await marketingService.deleteOffer(id);

        return res.json({
            success: true,
            message: "Offer deleted successfully"
        });
    } catch (error) {
        console.error("Delete Offer Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete offer"
        });
    }
};
