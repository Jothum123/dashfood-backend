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
        const { data, error } = await supabase
            .from('orders')
            .insert({
                customer_name: orderData.customer,
                total_amount: orderData.amount,
                status: 'new',
                store_id: orderData.store_id || '476e91d7-3b2a-4e83-680a-7f61ff95bf3c',
                tenant_id: 'cfd01e92-8b1d-4afd-8d27-0a18aa8564ed',
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
        res.status(500).json({ error: "Failed to sync to Supabase" });
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
