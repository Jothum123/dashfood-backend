const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Menu Management Service
 * Handles multi-store menu categories, items, and global availability.
 */

// --- Categories ---

exports.getCategories = async (organizationId, storeId) => {
    let query = supabase
        .from("menu_categories")
        .select("*")
        .eq("organization_id", organizationId);

    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    const { data, error } = await query.order("rank", { ascending: true });
    if (error) throw error;
    return data;
};

exports.createCategory = async (categoryData) => {
    const { data, error } = await supabase
        .from("menu_categories")
        .insert([categoryData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.updateCategory = async (categoryId, updateData) => {
    const { data, error } = await supabase
        .from("menu_categories")
        .update(updateData)
        .eq("id", categoryId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- Items ---

exports.getItems = async (categoryId) => {
    const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("category_id", categoryId)
        .order("name", { ascending: true });

    if (error) throw error;
    return data;
};

exports.createItem = async (itemData) => {
    const { data, error } = await supabase
        .from("menu_items")
        .insert([itemData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.updateItem = async (itemId, updateData) => {
    const { data, error } = await supabase
        .from("menu_items")
        .update(updateData)
        .eq("id", itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.toggleItemAvailability = async (itemId, isAvailable) => {
    const { data, error } = await supabase
        .from("menu_items")
        .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
        .eq("id", itemId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

// --- Global Sync Logic (Stub) ---

exports.syncMenuToAllStores = async (organizationId, sourceStoreId) => {
    // Enterprise logic for cloning a menu from one store to all others
    // This would involve complex recursive inserts/updates
    return {
        success: true,
        message: `Menu sync from store ${sourceStoreId} initiated for all locations in organization ${organizationId}`
    };
};
