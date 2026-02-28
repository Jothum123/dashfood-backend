const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173", // Vite default port
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('[Socket] Client connected:', socket.id);

        socket.on('join_store', (storeId) => {
            socket.join(`store_${storeId}`);
            console.log(`[Socket] Client joined store: store_${storeId}`);
        });

        socket.on('disconnect', () => {
            console.log('[Socket] Client disconnected');
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

module.exports = { initSocket, getIO };
