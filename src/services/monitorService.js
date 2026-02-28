const supabase = require('../config/supabase');
const { getIO } = require('../config/socket');

const startSlaMonitor = () => {
    setInterval(async () => {
        try {
            const io = getIO();
            const { data: activeOrders } = await supabase
                .from('orders')
                .select('*, stores(*)')
                .in('status', ['new', 'in_progress', 'ready']);

            if (!activeOrders) return;

            for (const order of activeOrders) {
                const now = new Date();
                const createdAt = new Date(order.created_at);
                const elapsed = (now - createdAt) / 60000;
                const breachMin = order.stores?.sla_breach_minutes || 30;

                // SLA Breach Alert
                if (elapsed >= breachMin && order.status !== 'ready') {
                    const { data: existing } = await supabase
                        .from('issues')
                        .select('id')
                        .eq('order_id', order.id)
                        .eq('type', 'late')
                        .maybeSingle();

                    if (!existing) {
                        const { data: newIssue } = await supabase
                            .from('issues')
                            .insert({
                                order_id: order.id,
                                type: 'late',
                                severity: 'high',
                                status: 'open',
                                resolution_notes: `System detected SLA breach at ${elapsed.toFixed(0)} mins.`
                            })
                            .select()
                            .single();

                        if (newIssue) {
                            io.to(`store_${order.store_id}`).emit('newIssue', newIssue);
                        }
                    }
                }

                // Pickup Delay Monitor
                if (order.status === 'ready' && order.ready_at) {
                    const shelfElapsed = (now - new Date(order.ready_at)) / 60000;
                    if (shelfElapsed >= 20) {
                        const { data: existing } = await supabase
                            .from('issues')
                            .select('id')
                            .eq('order_id', order.id)
                            .eq('type', 'pickup_delay')
                            .maybeSingle();

                        if (!existing) {
                            const { data: newIssue } = await supabase
                                .from('issues')
                                .insert({
                                    order_id: order.id,
                                    type: 'pickup_delay',
                                    severity: 'medium',
                                    status: 'open',
                                    resolution_notes: `Order waiting on shelf for ${shelfElapsed.toFixed(0)} mins.`
                                })
                                .select()
                                .single();

                            if (newIssue) {
                                io.to(`store_${order.store_id}`).emit('newIssue', newIssue);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error("[Monitor] Error:", err.message);
        }
    }, 60000);
};

module.exports = { startSlaMonitor };
