const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Customer & Feedback Service
 */

exports.getCustomers = async (organizationId, { storeId, minOrders, minSpent }) => {
    let query = supabase
        .from("customers")
        .select("*")
        .eq("organization_id", organizationId);

    if (minOrders) {
        query = query.gte("total_orders", minOrders);
    }

    if (minSpent) {
        query = query.gte("total_spent", minSpent);
    }

    const { data, error } = await query.order("total_spent", { ascending: false });

    if (error) throw error;
    return data;
};

exports.getFeedback = async (storeId, { rating, status }) => {
    let query = supabase
        .from("customer_feedback")
        .select("*, orders(customer_name, total_amount, created_at)")
        .eq("store_id", storeId);

    if (rating) {
        query = query.eq("rating", rating);
    }

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

exports.updateFeedbackStatus = async (feedbackId, status) => {
    const { data, error } = await supabase
        .from("customer_feedback")
        .update({ status })
        .eq("id", feedbackId)
        .select()
        .single();

    if (error) throw error;
    return data;
};

exports.getInsights = async (organizationId) => {
    // Aggregated insights
    const { data: customers, error: custError } = await supabase
        .from("customers")
        .select("id, total_orders, total_spent")
        .eq("organization_id", organizationId);

    if (custError) throw custError;

    const totalCustomers = customers.length;
    const repeatCustomers = customers.filter(c => c.total_orders > 1).length;
    const totalRevenue = customers.reduce((sum, c) => sum + Number(c.total_spent), 0);

    return {
        total_customers: totalCustomers,
        repeat_rate: totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0,
        average_ltv: totalCustomers > 0 ? totalRevenue / totalCustomers : 0
    };
};
