const { io } = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../realtime_test.log');
const log = (msg) => {
    const entry = `${new Date().toISOString()} - ${msg}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(msg);
};

fs.writeFileSync(logFile, '--- START TEST ---\n');

const socket = io('http://localhost:8001', {
    transports: ['websocket']
});

const storeId = '1a143cec-2215-43ff-be67-c7dc88506fc2';

socket.on('connect', () => {
    log('✅ Connected to local socket server');
    socket.emit('join_store', storeId);
});

socket.on('joined', (data) => {
    log(`🏁 Joined Room Confirmation: ${JSON.stringify(data)}`);
});

socket.on('newIncomingOrder', (data) => {
    log('⚡ Realtime Event Received: newIncomingOrder');
    log(JSON.stringify(data, null, 2));
    socket.disconnect();
    process.exit(0);
});

socket.onAny((eventName, ...args) => {
    log(`📡 Event: ${eventName} - ${JSON.stringify(args)}`);
});

socket.on('connect_error', (err) => {
    log(`❌ Socket Error: ${err.message}`);
    process.exit(1);
});

setTimeout(() => {
    log('❌ Timeout: No event received');
    process.exit(1);
}, 30000);
