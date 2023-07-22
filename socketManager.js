let io;

module.exports = {
    init: (server) => {
        io = require('socket.io')(server, {
            cors: {
                origin: (process.env.CORS_ORIGIN) || (process.env.DEV_ORIGIN),
            }
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
};
