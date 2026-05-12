const { socketAuthMiddleware } = require('../middlewares/auth');

function initSignalingSocket(io) {
  const sigNsp = io.of('/signaling');

  // Shared JWT + banned-user check
  sigNsp.use(socketAuthMiddleware);

  sigNsp.on('connection', (socket) => {
    console.log(`[Signaling] User connected: ${socket.userId}`);

    // Join a specific session room
    socket.on('join_session', ({ sessionId }) => {
      socket.join(sessionId);
      socket.sessionId = sessionId;
      // Notify others in the room
      socket.to(sessionId).emit('peer_joined', { userId: socket.userId });
      console.log(`[Signaling] ${socket.userId} joined session ${sessionId}`);
    });

    // Relay WebRTC offer
    socket.on('offer', ({ sessionId, offer }) => {
      socket.to(sessionId).emit('offer', {
        offer,
        from: socket.userId,
      });
    });

    // Relay WebRTC answer
    socket.on('answer', ({ sessionId, answer }) => {
      socket.to(sessionId).emit('answer', {
        answer,
        from: socket.userId,
      });
    });

    // Relay ICE candidate
    socket.on('ice_candidate', ({ sessionId, candidate }) => {
      socket.to(sessionId).emit('ice_candidate', {
        candidate,
        from: socket.userId,
      });
    });

    // Leave session
    socket.on('leave_session', ({ sessionId }) => {
      socket.to(sessionId).emit('peer_left', { userId: socket.userId });
      socket.leave(sessionId);
    });

    socket.on('disconnect', () => {
      if (socket.sessionId) {
        socket.to(socket.sessionId).emit('peer_left', { userId: socket.userId });
      }
      console.log(`[Signaling] User disconnected: ${socket.userId}`);
    });
  });

  return sigNsp;
}

module.exports = initSignalingSocket;
