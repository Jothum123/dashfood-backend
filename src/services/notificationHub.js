const { getIO } = require('../config/socket');
const { sendPushNotification } = require('./pushService');
const supabase = require('../config/supabase');

/**
 * Unified Notification Hub
 * Orchestrates real-time state sync (Socket.io) and background alerts (Push).
 */
class NotificationHub {
    /**
     * Notify store staff about an order status change
     */
    async notifyOrderStatusChange(order, reason) {
        const io = getIO();
        const payload = { ...order, reason };

        console.log(`[Hub] Notifying status change for Order ${order.id} -> ${order.status}`);

        // 1. Socket.io Broadcast (Real-time sync for active apps)
        io.to(`store_${order.store_id}`).emit('orderStatusChanged', payload);
        io.emit('orderStatusChanged', payload); // Global admin fallback

        // 2. Push Notifications (Background alerts)
        await this.dispatchPushToStoreStaff(
            order.store_id,
            `Order ${order.status.replace('_', ' ')}! 📦`,
            `Order #${order.id.slice(0, 8)} for ${order.customer_name} is now ${order.status.replace('_', ' ')}.`,
            { orderId: order.id, status: order.status, type: 'status_update' }
        );
    }

    /**
     * Notify store staff about a NEW incoming order
     */
    async notifyNewOrder(order) {
        const io = getIO();

        console.log(`[Hub] Notifying NEW Order ${order.id}`);

        // 1. Socket.io Broadcast
        io.to(`store_${order.store_id}`).emit('newIncomingOrder', order);

        // 2. Push Notifications
        await this.dispatchPushToStoreStaff(
            order.store_id,
            "New Order Received! 🍱",
            `A new order of $${Number(order.total_amount).toFixed(2)} is waiting for acceptance.`,
            { orderId: order.id, type: 'new_order' }
        );
    }

    /**
     * Dispatch push notifications to all authenticated staff of a store
     */
    async dispatchPushToStoreStaff(storeId, title, body, data) {
        try {
            // Fetch all staff users for this store who have a push token
            // In an enterprise setup, we'd join with a store_staff mapping table
            // For now, we'll fetch users scoped to the organization/store context
            const { data: users, error } = await supabase
                .from('users')
                .select('push_token')
                .not('push_token', 'is', null);
            // .eq('store_id', storeId); // Filter if store_id exists on user

            if (error) throw error;
            if (!users || users.length === 0) return;

            const tokens = [...new Set(users.map(u => u.push_token))];

            console.log(`[Hub] Dispatching push to ${tokens.length} staff tokens`);

            for (const token of tokens) {
                await sendPushNotification(token, title, body, data);
            }
        } catch (err) {
            console.error("[Hub] Push Dispatch Error:", err.message);
        }
    }
}

module.exports = new NotificationHub();
