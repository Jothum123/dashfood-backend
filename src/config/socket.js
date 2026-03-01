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
            const room = `store_${storeId}`;
            socket.join(room);
            console.log(`[Socket] Client ${socket.id} joined store: ${room}`);
            // Send confirmation back
            socket.emit('joined', { room });
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
