const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

// Supabase Init (Using Render Env Vars)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use Service Role Key for backend bypass
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(morgan('dev')); // Production-grade logging
app.use(express.json());

// API Auth Middleware
const validateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (process.env.BACKEND_API_KEY && apiKey !== process.env.BACKEND_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Vite default port
        methods: ["GET", "POST"]
    }
});

// Initial driver and trip state will be managed via Supabase
let drivers = [];
let activeTrips = [];

// Helper to fetch state from Supabase
const syncStateFromSupabase = async () => {
    try {
        const { data: driverData } = await supabase.from('drivers').select('*');
        const { data: tripData } = await supabase.from('trips').select('*').in('status', ['negotiating', 'matched']);

        if (driverData) drivers = driverData;
        if (tripData) activeTrips = tripData;
    } catch (err) {
        console.error("Error syncing state:", err.message);
    }
};

// Periodic Sync
setInterval(syncStateFromSupabase, 10000);
syncStateFromSupabase(); // Initial sync

// Simulation loop
setInterval(async () => {
    if (drivers.length === 0) return;

    const updatedDrivers = drivers.map(d => {
        const speedKms = (d.speed || 10) / 3600;
        const rad = (d.heading * Math.PI) / 180;
        const deltaLat = (Math.cos(rad) * speedKms) / 111.32;
        const deltaLng = (Math.sin(rad) * speedKms) / (111.32 * Math.cos(d.latitude * Math.PI / 180));
        const newHeading = (d.heading + (Math.random() - 0.5) * 10 + 360) % 360;

        return {
            ...d,
            latitude: d.latitude + deltaLat,
            longitude: d.longitude + deltaLng,
            heading: newHeading,
            speed: Math.max(10, Math.min(60, (d.speed || 10) + (Math.random() - 0.5) * 5))
        };
    });

    // Update locally
    drivers = updatedDrivers;

    // Push to Supabase (optimized for simulation)
    // In production, we'd use a more efficient batched update or only update changed fields
    for (const d of updatedDrivers) {
        await supabase.from('drivers').update({
            latitude: d.latitude,
            longitude: d.longitude,
            heading: d.heading,
            speed: d.speed,
            updated_at: new Date()
        }).eq('external_id', d.external_id);
    }

    io.emit('driversUpdate', drivers.map(d => ({
        id: d.external_id,
        name: d.name,
        location: { lat: d.latitude, lng: d.longitude },
        telemetry: { speed: d.speed, battery: d.battery, heading: d.heading, altitude: d.altitude },
        onlineStatus: d.status
    })));

    io.emit('marketUpdate', {
        liquidityRatio: 0.84,
        discoveryGap: 4.20,
        activeTrips: activeTrips.length
    });
}, 2000);

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.emit('driversUpdate', drivers);

    // Module B: Negotiation Engine Handler
    socket.on('proposeFare', async (data) => {
        const tripExternalId = `TRIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const newTrip = {
            external_id: tripExternalId,
            rider_id: data.riderId,
            initial_offer: data.amount,
            current_price: data.amount,
            negotiation_history: [{ type: 'Rider Proposal', price: data.amount, time: new Date() }],
            status: 'negotiating'
        };

        const { data: savedTrip, error } = await supabase.from('trips').insert(newTrip).select().single();

        if (!error && savedTrip) {
            activeTrips.push(savedTrip);
            io.emit('newTripRequest', savedTrip);
            console.log(`Fare proposed for ${tripExternalId}: $${data.amount}`);
        }
    });

    socket.on('driverCounterOffer', async (data) => {
        const tripIndex = activeTrips.findIndex(t => t.external_id === data.tripId || t.id === data.tripId);
        if (tripIndex > -1) {
            const trip = activeTrips[tripIndex];
            const updatedHistory = [...trip.negotiation_history, {
                type: 'Driver Counter',
                driverId: data.driverId,
                price: data.amount,
                time: new Date()
            }];

            const { data: updatedTrip, error } = await supabase.from('trips')
                .update({
                    current_price: data.amount,
                    negotiation_history: updatedHistory,
                    updated_at: new Date()
                })
                .eq('id', trip.id)
                .select()
                .single();

            if (!error && updatedTrip) {
                activeTrips[tripIndex] = updatedTrip;
                io.emit('tripUpdate', updatedTrip);
                console.log(`Driver ${data.driverId} countered for ${data.tripId}: $${data.amount}`);
            }
        }
    });

    socket.on('acceptFare', async (data) => {
        const tripIndex = activeTrips.findIndex(t => t.external_id === data.tripId || t.id === data.tripId);
        if (tripIndex > -1) {
            const trip = activeTrips[tripIndex];

            const { data: updatedTrip, error } = await supabase.from('trips')
                .update({
                    status: 'matched',
                    final_price: trip.current_price,
                    updated_at: new Date()
                })
                .eq('id', trip.id)
                .select()
                .single();

            if (!error && updatedTrip) {
                // Remove from active list if it's no longer actively negotiating
                activeTrips.splice(tripIndex, 1);
                io.emit('tripMatched', updatedTrip);
                console.log(`Trip ${data.tripId} matched at $${updatedTrip.final_price}`);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// ==========================
// Module C: DashFood API
// ==========================

// Dashboard Status Sync Endpoint
app.patch('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    console.log(`[DashFood] Status Sync: Order ${id} -> ${status}${reason ? ` (${reason})` : ''}`);

    // In a real app, we might trigger internal logic or push to another stream
    io.emit('orderStatusChanged', { id, status, reason, updatedAt: new Date() });

    res.json({ success: true, message: `Order ${id} updated to ${status}` });
});

app.get('/health', (req, res) => {
    res.json({ status: 'live', system: 'dashfood-sync' });
});

// ==========================
// Module D: Supabase Sync
// ==========================

// 1. Render -> Supabase (Incoming External Order)
app.post("/webhooks/new-order", validateApiKey, async (req, res) => {
    const orderData = req.body;
    console.log("[Webhook] New external order received:", orderData);

    try {
        const { data, error } = await supabase
            .from('orders')
            .insert({
                customer_name: orderData.customer,
                total_amount: orderData.amount,
                status: 'new',
                store_id: orderData.store_id || 'main-store',
                items: orderData.items || []
            })
            .select()
            .single();

        if (error) throw error;

        // Broadcast to Dashboard
        io.emit('newIncomingOrder', data);
        res.status(200).json({ success: true, orderId: data.id });
    } catch (err) {
        console.error("Supabase Insert Error:", err.message);
        res.status(500).json({ error: "Failed to sync to Supabase" });
    }
});

// 2. Supabase -> Render (Database Event Sync)
// This is called by Supabase Database Webhooks
app.post("/webhooks/supabase-sync", validateApiKey, (req, res) => {
    const { record, type, table } = req.body;

    console.log(`[Supabase Event] ${type} on ${table}:`, record.id);

    if (table === 'orders' && type === 'UPDATE') {
        io.emit('orderStatusChanged', {
            id: record.id,
            status: record.status,
            updatedAt: record.updated_at
        });
    }

    res.status(200).send("OK");
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Real-time simulation server running on port ${PORT}`);
});
