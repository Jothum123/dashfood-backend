const supabase = require('../config/supabase');
const { getIO } = require('../config/socket');

let drivers = [];
let activeTrips = [];

const syncStateFromSupabase = async () => {
    try {
        const { data: driverData } = await supabase.from('drivers').select('*');
        const { data: tripData } = await supabase.from('trips').select('*').in('status', ['negotiating', 'matched']);

        if (driverData) drivers = driverData;
        if (tripData) activeTrips = tripData;
    } catch (err) {
        console.error("[Simulation] Error syncing state:", err.message);
    }
};

const startSimulation = () => {
    setInterval(syncStateFromSupabase, 10000);
    syncStateFromSupabase();

    setInterval(async () => {
        if (drivers.length === 0) return;
        const io = getIO();

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

        drivers = updatedDrivers;

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
};

module.exports = { startSimulation, activeTrips };
