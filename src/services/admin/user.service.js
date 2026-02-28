const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style User & Team Management Service
 * Handles RBAC, team members, and permissions.
 */

exports.getTeamMembers = async (organizationId, storeId) => {
    let query = supabase
        .from("users")
        .select("*, roles(name)")
        .eq("tenant_id", organizationId);

    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    const { data, error } = await query.order("full_name", { ascending: true });

    if (error) throw error;
    return data;
};

exports.inviteUser = async (userData) => {
    // In a real system, this would trigger an email invite flow
    const { data, error } = await supabase
        .from("users")
        .insert([userData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.updateUserRole = async (userId, roleId) => {
    const { data, error } = await supabase
        .from("users")
        .update({
            role_id: roleId,
            updated_at: new Date().toISOString()
        })
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.removeUser = async (userId) => {
    const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

    if (error) throw error;
    return { success: true };
};

exports.getRoles = async () => {
    const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw error;
    return data;
};

// --- Audit Logging (Stub) ---
exports.logAdminAction = async ({ userId, action, targetId, metadata }) => {
    // Stub for audit logging system
    console.log(`[AUDIT] User ${userId} performed ${action} on ${targetId}`, metadata);
    return { success: true };
};
