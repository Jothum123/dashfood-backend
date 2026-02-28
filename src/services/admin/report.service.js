const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Uber-Style Reporting Service
 * Handles generation of business reports (Sales, Operations, Finance).
 */

exports.generateSalesReport = async (organizationId, startDate, endDate) => {
    const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, total_amount, status, created_at, stores(name)")
        .eq("tenant_id", organizationId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

    if (error) throw error;

    const header = "Order ID,Store Name,Customer,Amount,Status,Date\n";
    const rows = data.map(order => {
        const storeName = order.stores?.name || "Unknown";
        return `"${order.id.slice(0, 8)}","${storeName}","${order.customer_name || 'Anonymous'}",${order.total_amount},"${order.status}","${new Date(order.created_at).toLocaleString()}"`;
    }).join("\n");

    return {
        filename: `sales_report_${startDate.split('T')[0]}.csv`,
        content: header + rows,
        contentType: "text/csv"
    };
};

exports.generateOperationsReport = async (organizationId, startDate, endDate) => {
    const { data, error } = await supabase
        .from("orders")
        .select("id, status, accepted_at, ready_at, completed_at, stores(name)")
        .eq("tenant_id", organizationId)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

    if (error) throw error;

    // Calculate Operations Performance Metrics
    const metrics = data.map(order => {
        const prepTime = (order.accepted_at && order.ready_at)
            ? (new Date(order.ready_at) - new Date(order.accepted_at)) / 60000
            : null;

        const fulfillmentTime = (order.ready_at && order.completed_at)
            ? (new Date(order.completed_at) - new Date(order.ready_at)) / 60000
            : null;

        return {
            orderId: order.id.slice(0, 8),
            store: order.stores?.name,
            prepTimeMinutes: prepTime ? Math.round(prepTime) : "N/A",
            fulfillmentMinutes: fulfillmentTime ? Math.round(fulfillmentTime) : "N/A",
            status: order.status
        };
    });

    return {
        filename: `operations_report_${startDate.split('T')[0]}.json`,
        content: JSON.stringify(metrics, null, 2),
        contentType: "application/json"
    };
};
