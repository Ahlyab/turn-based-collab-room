import { io, Socket } from 'socket.io-client';
import { Room } from './types';

let socket: Socket;

export const initSocket = () => {
  socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3000', {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const createRoom = () => {
  socket.emit('create-room');
};

export const joinRoom = (roomCode: string) => {
  socket.emit('join-room', roomCode);
};

export const updateCode = (code: string) => {
  socket.emit('code-update', code);
};

export const leaveRoom = () => {
  socket.emit('leave-room');
};