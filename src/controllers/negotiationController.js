const supabase = require('../config/supabase');
const { activeTrips } = require('../services/simulationService');

const handleNegotiation = (socket, io) => {
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
            console.log(`[Negotiation] Fare proposed: ${tripExternalId} ($${data.amount})`);
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
                console.log(`[Negotiation] Driver ${data.driverId} countered: $${data.amount}`);
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
                activeTrips.splice(tripIndex, 1);
                io.emit('tripMatched', updatedTrip);
                console.log(`[Negotiation] Trip ${data.tripId} matched at $${updatedTrip.final_price}`);
            }
        }
    });
};

module.exports = { handleNegotiation };
