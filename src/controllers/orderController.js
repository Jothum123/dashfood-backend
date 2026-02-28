const supabase = require('../config/supabase');

/**
 * Update order status with authoritative timestamps and real-time broadcast.
 */
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    console.log(`[Order] Authoritative Update: ${id} -> ${status}`);

    try {
        const updateData = {
            status,
            updated_at: new Date()
        };

        if (status === 'in_progress') updateData.accepted_at = new Date();
        if (status === 'ready') updateData.ready_at = new Date();
        if (status === 'completed') updateData.completed_at = new Date();

        const { data: updatedOrder, error } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // ==========================================
        // 🚀 UNIFIED HUB NOTIFICATION (STABLE SYNC)
        // ==========================================
        const notificationHub = require('../services/notificationHub');
        await notificationHub.notifyOrderStatusChange(updatedOrder, reason);

        res.json({ success: true, order: updatedOrder });
    } catch (err) {
        console.error("[Order] Status Update Error:", err.message);
        res.status(500).json({ error: "Failed to update order status" });
    }
};

module.exports = { updateOrderStatus };
