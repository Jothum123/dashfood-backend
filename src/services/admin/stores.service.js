const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Store Management Service
 * Handles multi-location status, hours, and config.
 */
exports.getAllStores = async (organizationId) => {
    const { data, error } = await supabase
        .from("stores")
        .select("*, regions(name)")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

    if (error) throw error;
    return data;
};

exports.getStoreDetails = async (storeId) => {
    const { data, error } = await supabase
        .from("stores")
        .select("*, regions(*)")
        .eq("id", storeId)
        .single();

    if (error) throw error;
    return data;
};

exports.updateStoreStatus = async (storeId, isActive) => {
    const { data, error } = await supabase
        .from("stores")
        .update({
            is_active: isActive,
            updated_at: new Date().toISOString()
        })
        .eq("id", storeId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.updateStoreConfig = async (storeId, config) => {
    const { data, error } = await supabase
        .from("stores")
        .update({
            ...config,
            updated_at: new Date().toISOString()
        })
        .eq("id", storeId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// Placeholder for complex business hours logic
exports.getBusinessHours = async (storeId) => {
    // In a real Uber replica, this would fetch from a specialized 'store_hours' table
    // For now, returning a successful stub or fetching from store metadata if present
    return {
        monday: { open: "08:00", close: "22:00", closed: false },
        tuesday: { open: "08:00", close: "22:00", closed: false },
        wednesday: { open: "08:00", close: "22:00", closed: false },
        thursday: { open: "08:00", close: "22:00", closed: false },
        friday: { open: "08:00", close: "23:00", closed: false },
        satuday: { open: "09:00", close: "23:00", closed: false },
        sunday: { open: "09:00", close: "21:00", closed: false },
    };
};
