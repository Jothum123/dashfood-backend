const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Marketing & Offers Service
 */

exports.getOffers = async (organizationId, { storeId, isActive }) => {
    let query = supabase
        .from("marketing_offers")
        .select("*, stores(name)")
        .eq("organization_id", organizationId);

    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    if (isActive !== undefined) {
        query = query.eq("is_active", isActive);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

exports.createOffer = async (offerData) => {
    const { data, error } = await supabase
        .from("marketing_offers")
        .insert([offerData])
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.updateOffer = async (offerId, updateData) => {
    const { data, error } = await supabase
        .from("marketing_offers")
        .update({
            ...updateData,
            updated_at: new Date().toISOString()
        })
        .eq("id", offerId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.deleteOffer = async (offerId) => {
    const { error } = await supabase
        .from("marketing_offers")
        .delete()
        .eq("id", offerId);

    if (error) throw error;
    return { success: true };
};
