import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

type NamespaceKey = 'match' | 'signaling';

const sockets: Partial<Record<NamespaceKey, Socket>> = {};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getSocket(namespace: NamespaceKey): Socket {
  if (sockets[namespace]?.connected) {
    return sockets[namespace]!;
  }

  const token = getToken();
  if (!token) {
    throw new Error('No auth token available for socket connection');
  }

  const socket = io(`${SOCKET_URL}/${namespace}`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on('connect', () => {
    console.log(`[Socket] Connected to /${namespace}`);
  });

  socket.on('connect_error', (err) => {
    console.error(`[Socket] /${namespace} connection error:`, err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket] /${namespace} disconnected:`, reason);
  });

  sockets[namespace] = socket;
  return socket;
}

export function disconnectSocket(namespace: NamespaceKey): void {
  const socket = sockets[namespace];
  if (socket) {
    socket.disconnect();
    delete sockets[namespace];
  }
}

export function disconnectAll(): void {
  (Object.keys(sockets) as NamespaceKey[]).forEach(disconnectSocket);
}
