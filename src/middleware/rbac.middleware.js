// middleware/rbac.middleware.js
function requireAdmin(req, res, next) {
    try {
        const role = req.headers["x-user-role"];

        // Temporary role check (later can use Supabase JWT claims)
        if (!role || !["admin", "super_admin", "manager"].includes(role)) {
            return res.status(403).json({
                success: false,
                message: "Admin access required",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "RBAC middleware error",
        });
    }
}

module.exports = { requireAdmin };
