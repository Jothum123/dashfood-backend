const userService = require("../../services/admin/user.service");

/**
 * Uber-Style Users & Governance Controller
 */

exports.listTeam = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const { store_id } = req.query;

        const team = await userService.getTeamMembers(organizationId, store_id);

        return res.json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error("List Team Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch team members"
        });
    }
};

exports.inviteMember = async (req, res) => {
    try {
        const organizationId = req.headers["x-organization-id"];
        const userData = { ...req.body, tenant_id: organizationId };

        const user = await userService.inviteUser(userData);

        return res.json({
            success: true,
            data: user,
            message: "User invited successfully"
        });
    } catch (error) {
        console.error("Invite Member Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to invite member"
        });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id } = req.body;

        const updated = await userService.updateUserRole(id, role_id);

        return res.json({
            success: true,
            data: updated,
            message: "User role updated"
        });
    } catch (error) {
        console.error("Update Role Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user role"
        });
    }
};

exports.removeMember = async (req, res) => {
    try {
        const { id } = req.params;
        await userService.removeUser(id);

        return res.json({
            success: true,
            message: "User removed from team"
        });
    } catch (error) {
        console.error("Remove Member Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove member"
        });
    }
};

exports.listRoles = async (req, res) => {
    try {
        const roles = await userService.getRoles();

        return res.json({
            success: true,
            data: roles
        });
    } catch (error) {
        console.error("List Roles Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch roles"
        });
    }
};
