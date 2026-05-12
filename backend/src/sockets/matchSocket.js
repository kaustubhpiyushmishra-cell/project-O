const config = require('../config');
const matchingService = require('../services/matchingService');
const { socketAuthMiddleware } = require('../middlewares/auth');

function initMatchSocket(io) {
  const matchNsp = io.of('/match');

  // Shared JWT + banned-user check
  matchNsp.use(socketAuthMiddleware);

  matchNsp.on('connection', (socket) => {
    const userId = socket.userId;
    console.log(`[Match] User connected: ${userId}`);

    matchingService.registerSocket(userId, socket);
    matchingService.setPresence(userId);

    // Track current session for this socket
    let currentSessionId = null;
    let matchTimeoutTimer = null;

    // Clear match timeout
    function clearMatchTimeout() {
      if (matchTimeoutTimer) {
        clearTimeout(matchTimeoutTimer);
        matchTimeoutTimer = null;
      }
    }

    // Start match timeout — auto-leave queue after configured duration
    function startMatchTimeout() {
      clearMatchTimeout();
      matchTimeoutTimer = setTimeout(async () => {
        try {
          await matchingService.leaveQueue(userId);
          socket.emit('match_timeout', { message: 'No match found. Please try again.' });
        } catch (err) {
          console.error('[Match] timeout cleanup error:', err);
        }
      }, config.matchTimeout * 1000);
    }

    // User joins the matching queue
    socket.on('join_queue', async () => {
      try {
        const result = await matchingService.joinQueue(userId);

        if (result.status === 'matched') {
          clearMatchTimeout();
          currentSessionId = result.sessionId;

          // Notify current user
          socket.emit('matched', {
            sessionId: result.sessionId,
            partnerId: result.partnerId,
          });

          // Notify the partner
          const partnerSocket = matchingService.getSocket(result.partnerId);
          if (partnerSocket) {
            partnerSocket.emit('matched', {
              sessionId: result.sessionId,
              partnerId: userId,
            });
          }
        } else if (result.status === 'queued') {
          startMatchTimeout();
          socket.emit('queued', { message: 'Waiting for a match...' });
        } else if (result.status === 'already_in_queue') {
          socket.emit('queued', { message: 'Already in queue' });
        }
      } catch (err) {
        console.error('[Match] join_queue error:', err);
        socket.emit('error', { message: 'Failed to join queue' });
      }
    });

    // User leaves the queue
    socket.on('leave_queue', async () => {
      try {
        clearMatchTimeout();
        await matchingService.leaveQueue(userId);
        currentSessionId = null;
        socket.emit('left_queue', { message: 'Left the queue' });
      } catch (err) {
        console.error('[Match] leave_queue error:', err);
        socket.emit('error', { message: 'Failed to leave queue' });
      }
    });

    // User skips current match (Next button)
    socket.on('skip', async () => {
      try {
        // Notify partner that the other user skipped
        if (currentSessionId) {
          const sessionData = await matchingService.getSessionPartner(currentSessionId, userId);
          if (sessionData) {
            const partnerSocket = matchingService.getSocket(sessionData.partnerId);
            if (partnerSocket) {
              partnerSocket.emit('partner_skipped', {
                message: 'Your partner has moved on.',
                sessionId: currentSessionId,
              });
            }
          }
        }

        const result = await matchingService.skipMatch(userId, currentSessionId);

        if (result.status === 'matched') {
          clearMatchTimeout();
          currentSessionId = result.sessionId;
          socket.emit('matched', {
            sessionId: result.sessionId,
            partnerId: result.partnerId,
          });

          const partnerSocket = matchingService.getSocket(result.partnerId);
          if (partnerSocket) {
            partnerSocket.emit('matched', {
              sessionId: result.sessionId,
              partnerId: userId,
            });
          }
        } else {
          currentSessionId = null;
          startMatchTimeout();
          socket.emit('queued', { message: 'Waiting for next match...' });
        }
      } catch (err) {
        console.error('[Match] skip error:', err);
        socket.emit('error', { message: 'Failed to skip' });
      }
    });

    // Disconnect cleanup
    socket.on('disconnect', async () => {
      console.log(`[Match] User disconnected: ${userId}`);
      clearMatchTimeout();
      try {
        // Notify partner about disconnect
        if (currentSessionId) {
          const sessionData = await matchingService.getSessionPartner(currentSessionId, userId);
          if (sessionData) {
            const partnerSocket = matchingService.getSocket(sessionData.partnerId);
            if (partnerSocket) {
              partnerSocket.emit('partner_disconnected', {
                message: 'Your partner has disconnected.',
                sessionId: currentSessionId,
              });
            }
          }
        }
        await matchingService.handleDisconnect(userId, currentSessionId);
      } catch (err) {
        console.error('[Match] disconnect cleanup error:', err);
      }
    });
  });

  return matchNsp;
}

module.exports = initMatchSocket;
