const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Issue Management Service
 * Handles live issue monitoring, categorization, and resolution.
 */

exports.getIssues = async (organizationId, { storeId, status, severity, type }) => {
    let query = supabase
        .from("order_issues")
        .select("*, orders(*, stores(name))");

    // Filter by organization (through orders)
    query = query.eq("orders.tenant_id", organizationId);

    if (storeId) {
        query = query.eq("orders.store_id", storeId);
    }

    if (status) {
        query = query.eq("status", status);
    }

    if (severity) {
        query = query.eq("severity", severity);
    }

    if (type) {
        query = query.eq("type", type);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    // Manual filter for join issues if Supabase query doesn't handle nested organizational filtering cleanly
    return data.filter(issue => issue.orders !== null);
};

exports.getIssueDetails = async (issueId) => {
    const { data, error } = await supabase
        .from("order_issues")
        .select("*, orders(*, stores(*))")
        .eq("id", issueId)
        .single();

    if (error) throw error;
    return data;
};

exports.updateIssueStatus = async (issueId, status, notes) => {
    const { data, error } = await supabase
        .from("order_issues")
        .update({
            status,
            resolution_notes: notes,
            updated_at: new Date().toISOString()
        })
        .eq("id", issueId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.getLiveConsoleEvents = async (organizationId) => {
    // Fetches most recent system events and issues for the live console
    const { data, error } = await supabase
        .from("order_issues")
        .select("*, orders(customer_name, store_id)")
        .eq("orders.tenant_id", organizationId)
        .order("created_at", { ascending: false })
        .limit(10);

    if (error) throw error;
    return data;
};

exports.getCriticalIssues = async (organizationId, storeId = null) => {
    let query = supabase
        .from("order_issues")
        .select("*, orders(*, stores(name))")
        .eq("severity", "critical")
        .eq("status", "open");

    query = query.eq("orders.tenant_id", organizationId);
    if (storeId) query = query.eq("orders.store_id", storeId);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return data.filter(i => i.orders !== null);
};

exports.getEscalatedOrders = async (organizationId, storeId = null) => {
    // Logic: Orders that have been 'pending' for too long
    const tenMinsAgo = new Date(Date.now() - 10 * 60000).toISOString();
    let query = supabase
        .from("orders")
        .select("*, stores(name)")
        .eq("status", "pending")
        .lt("created_at", tenMinsAgo);

    query = query.eq("tenant_id", organizationId);
    if (storeId) query = query.eq("store_id", storeId);

    const { data, error } = await query.order("created_at", { ascending: true });
    if (error) throw error;
    return data;
};
