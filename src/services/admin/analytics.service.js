const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.getAdminOverview = async (organizationId, storeId = null) => {
    let query = supabase.from("orders").select("id, total_amount, accepted_at, ready_at");

    if (organizationId) {
        query = query.eq("tenant_id", organizationId);
    }
    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    const todayStart = new Date().toISOString().split("T")[0];
    const { data: ordersToday, error } = await query.gte("created_at", todayStart);

    if (error) throw error;

    const revenueToday =
        ordersToday?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    // Avg Prep Time (Two-Clock system)
    const prepData = ordersToday?.filter(o => o.accepted_at && o.ready_at) || [];

    let avgPrep = 0;
    if (prepData.length > 0) {
        const totalMinutes = prepData.reduce((acc, order) => {
            const diff =
                (new Date(order.ready_at) - new Date(order.accepted_at)) / 60000;
            return acc + diff;
        }, 0);

        avgPrep = Math.round(totalMinutes / prepData.length);
    }

    return {
        orders_today: ordersToday?.length || 0,
        revenue_today: revenueToday,
        avg_prep_time: avgPrep,
    };
};

exports.getKPIs = async (organizationId, storeId = null) => {
    let query = supabase.from("orders").select("status", { count: "exact" });

    if (organizationId) {
        query = query.eq("tenant_id", organizationId);
    }
    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    const { data: statuses, error } = await query;

    if (error) throw error;

    const counts = statuses.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {});

    return {
        new_orders: counts["pending"] || 0,
        in_progress_orders: (counts["preparing"] || 0) + (counts["in_progress"] || 0),
        ready_orders: counts["ready"] || 0,
    };
};

exports.getDashboardAlerts = async (organizationId, storeId = null) => {
    // 1. SLA Breaches (Pending orders > 10 mins)
    const tenMinsAgo = new Date(Date.now() - 10 * 60000).toISOString();
    let slaQuery = supabase
        .from("orders")
        .select("id, customer_name, created_at")
        .eq("status", "pending")
        .lt("created_at", tenMinsAgo);

    if (storeId) slaQuery = slaQuery.eq("store_id", storeId);

    const { data: breaches } = await slaQuery;

    const alerts = (breaches || []).map(b => ({
        type: "SLA_BREACH",
        severity: "critical",
        message: `Order #${b.id.slice(0, 8)} for ${b.customer_name} is overdue!`,
        timestamp: b.created_at
    }));

    // 2. High cancellation rate (Stub for logic)
    // 3. Store offline (Stub for logic)

    return alerts;
};

exports.getHistoricalTrends = async (organizationId, days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from("orders")
        .select("created_at, total_amount")
        .eq("tenant_id", organizationId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by day for the trend chart
    const trends = data.reduce((acc, order) => {
        const day = new Date(order.created_at).toISOString().split("T")[0];
        if (!acc[day]) acc[day] = { date: day, sales: 0, orders: 0 };
        acc[day].sales += parseFloat(order.total_amount) || 0;
        acc[day].orders += 1;
        return acc;
    }, {});

    return Object.values(trends);
};

exports.getStoreComparisons = async (organizationId) => {
    const { data, error } = await supabase
        .from("orders")
        .select("store_id, total_amount, stores(name)")
        .eq("tenant_id", organizationId);

    if (error) throw error;

    const comparison = data.reduce((acc, order) => {
        const storeName = order.stores?.name || "Unknown Store";
        if (!acc[storeName]) acc[storeName] = { name: storeName, revenue: 0, orderCount: 0 };
        acc[storeName].revenue += parseFloat(order.total_amount) || 0;
        acc[storeName].orderCount += 1;
        return acc;
    }, {});

    return Object.values(comparison);
};
