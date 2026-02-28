const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Payment & Financial Service
 */

exports.getPayouts = async (organizationId, { storeId, status }) => {
    let query = supabase
        .from("merchant_payouts")
        .select("*, stores(name)")
        .eq("organization_id", organizationId);

    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    if (status) {
        query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

exports.getInvoices = async (organizationId, { storeId, limit = 50 }) => {
    let query = supabase
        .from("merchant_invoices")
        .select("*, orders(customer_name, created_at)")
        .eq("organization_id", organizationId);

    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    const { data, error } = await query.limit(limit).order("created_at", { ascending: false });

    if (error) throw error;
    return data;
};

exports.getFinancialSummary = async (organizationId, { storeId }) => {
    // Current Period Accruals
    let query = supabase
        .from("merchant_invoices")
        .select("net_amount, commission, tax, fees")
        .eq("organization_id", organizationId)
        .eq("status", "unpaid");

    if (storeId) {
        query = query.eq("store_id", storeId);
    }

    const { data: invoices, error } = await query;
    if (error) throw error;

    const summary = invoices.reduce((acc, inv) => {
        acc.pending_balance += Number(inv.net_amount);
        acc.total_commission += Number(inv.commission);
        acc.total_tax += Number(inv.tax);
        acc.total_fees += Number(inv.fees);
        return acc;
    }, { pending_balance: 0, total_commission: 0, total_tax: 0, total_fees: 0 });

    return summary;
};
