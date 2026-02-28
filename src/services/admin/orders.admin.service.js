const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Orders Admin Service
 * Handles complex filtering, searching, and lifecycle management.
 */
exports.getOrders = async ({
    organizationId,
    storeId,
    status,
    search,
    startDate,
    endDate,
    page = 1,
    limit = 20
}) => {
    let query = supabase
        .from("orders")
        .select("*, stores(name)", { count: "exact" });

    // 1. Multi-tenant Scope
    if (organizationId) {
        query = query.eq("tenant_id", organizationId);
    }
    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    // 2. Status Filtering
    if (status && status !== 'all') {
        query = query.eq("status", status);
    }

    // 3. Date Range
    if (startDate) {
        query = query.gte("created_at", startDate);
    }
    if (endDate) {
        query = query.lte("created_at", endDate);
    }

    // 4. Search (Customer or ID)
    if (search) {
        // Supabase or logic for search
        query = query.or(`customer_name.ilike.%${search}%,id.eq.${search}`);
    }

    // 5. Pagination & Sorting
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

    if (error) throw error;

    return {
        orders: data,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
    };
};

exports.getOrderDetails = async (orderId) => {
    const { data, error } = await supabase
        .from("orders")
        .select("*, stores(*), order_issues(*)")
        .eq("id", orderId)
        .single();

    if (error) throw error;
    return data;
};

exports.resolveIssue = async (issueId, resolutionNotes) => {
    const { data, error } = await supabase
        .from("order_issues")
        .update({
            status: 'resolved',
            resolution_notes: resolutionNotes,
            updated_at: new Date().toISOString()
        })
        .eq("id", issueId)
        .select()
        .single();

    if (error) throw error;
    return data;
};
