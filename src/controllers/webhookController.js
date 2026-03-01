const supabase = require('../config/supabase');
const { getIO } = require('../config/socket');
const { sendPushNotification } = require('../services/pushService');

/**
 * Handle incoming external orders (e.g. from Render or other partners).
 */
const handleNewOrder = async (req, res) => {
    const orderData = req.body;
    const io = getIO();
    console.log("[Webhook] External Order Received:", orderData.customer);

    try {
        // Match store and organization
        let { data: store } = await supabase
            .from('stores')
            .select('id, organization_id')
            .eq('id', orderData.store_id)
            .maybeSingle();

        if (!store) {
            // Fallback to first available store for testing
            const { data: firstStore } = await supabase.from('stores').select('id, organization_id').limit(1).single();
            store = firstStore;
        }

        const { data, error } = await supabase
            .from('orders')
            .insert({
                customer_name: orderData.customer,
                total_amount: orderData.amount,
                status: 'new',
                store_id: store?.id,
                tenant_id: store?.organization_id,
                items: orderData.items || []
            })
            .select()
            .single();

        if (error) throw error;

        // Real-time Broadcast
        io.to(`store_${data.store_id}`).emit('newIncomingOrder', data);
        io.emit('newIncomingOrder', data);

        // Push Notifications
        const { data: usersWithTokens } = await supabase
            .from('users')
            .select('push_token')
            .eq('store_id', data.store_id)
            .not('push_token', 'is', null);

        if (usersWithTokens) {
            usersWithTokens.forEach(u => {
                if (u.push_token) {
                    sendPushNotification(
                        u.push_token,
                        'New Order Received! 🍱',
                        `Order for ${data.customer_name} of $${data.total_amount?.toFixed(2)}`,
                        { orderId: data.id, storeId: data.store_id }
                    );
                }
            });
        }

        res.status(200).json({ success: true, orderId: data.id });
    } catch (err) {
        console.error("[Webhook] Insert Error:", err.message);
        res.status(500).json({ error: "Failed to sync to Supabase", details: err.message });
    }
};

/**
 * Handle Supabase Database Webhooks for state synchronization.
 */
const handleSupabaseSync = (req, res) => {
    const { record, type, table } = req.body;
    const io = getIO();

    if (table === 'orders' && type === 'UPDATE') {
        const payload = {
            id: record.id,
            status: record.status,
            updatedAt: record.updated_at
        };

        io.to(`store_${record.store_id}`).emit('orderStatusChanged', payload);
        io.emit('orderStatusChanged', payload);
    }

    res.status(200).send("OK");
};

module.exports = { handleNewOrder, handleSupabaseSync };
