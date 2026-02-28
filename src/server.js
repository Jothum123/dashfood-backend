require('dotenv').config();
const http = require('http');
const { app } = require('./app');
const { initSocket } = require('./config/socket');
const { startSimulation } = require('./services/simulationService');
const { startSlaMonitor } = require('./services/monitorService');
const { handleNegotiation } = require('./controllers/negotiationController');

const server = http.createServer(app);
const io = initSocket(server);

// Register Negotiation Handlers
io.on('connection', (socket) => {
    handleNegotiation(socket, io);
});

// Start Background Services
startSimulation();
startSlaMonitor();

const PORT = process.env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Enterprise Merchant Core running on port ${PORT}`);
});
