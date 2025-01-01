import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Socket } from 'net';
import { v4 as uuidv4 } from 'uuid';

interface SocketServer extends HTTPServer {
  io?: Server;
}

interface SocketWithIO extends Socket {
  server: SocketServer;
}

interface ResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const TOTAL_SESSION_TIME = 10 * 60; // 10 minutes in seconds
const TURN_TIME = 2 * 60; // 2 minutes in seconds

const rooms = new Map();

const generateRoomCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

const SocketHandler = (req: NextApiRequest, res: ResponseWithSocket) => {
  // Check if socket server is already running
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO server...');
    
    const httpServer = res.socket.server as any;
    const io = new Server(httpServer, {
      path: '/socket.io/',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['polling', 'websocket']
    });

    // Store the Socket.IO server instance
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('create-room', () => {
        const roomCode = generateRoomCode();
        const room = {
          id: uuidv4(),
          code: roomCode,
          developers: [{
            id: socket.id,
            name: `Developer 1`,
            isActive: true,
            isConnected: true
          }],
          currentCode: '',
          sessionStarted: false,
          totalTimeRemaining: TOTAL_SESSION_TIME,
          turnTimeRemaining: TURN_TIME
        };
        
        rooms.set(roomCode, room);
        socket.join(roomCode);
        socket.emit('room-created', room);
      });

      socket.on('join-room', (roomCode) => {
        const room = rooms.get(roomCode);
        
        if (!room || room.developers.length >= 2) {
          socket.emit('join-error', 'Room not found or full');
          return;
        }

        room.developers.push({
          id: socket.id,
          name: `Developer ${room.developers.length + 1}`,
          isActive: false,
          isConnected: true
        });

        socket.join(roomCode);
        room.sessionStarted = true;
        room.sessionEndTime = new Date(Date.now() + TOTAL_SESSION_TIME * 1000);
        room.currentTurnEndTime = new Date(Date.now() + TURN_TIME * 1000);
        
        io.to(roomCode).emit('room-updated', room);
      });

      socket.on('code-update', (code) => {
        const room = Array.from(rooms.values()).find(room =>
          room.developers.some(dev => dev.id === socket.id)
        );
        
        if (!room) return;
        
        room.currentCode = code;
        io.to(room.code).emit('room-updated', room);
      });

      socket.on('disconnect', () => {
        for (const [roomCode, room] of rooms.entries()) {
          const devIndex = room.developers.findIndex(dev => dev.id === socket.id);
          
          if (devIndex === -1) continue;
          
          room.developers[devIndex].isConnected = false;
          
          setTimeout(() => {
            if (!room.developers[devIndex].isConnected) {
              room.developers = room.developers.filter(dev => dev.id !== socket.id);
              if (room.developers.length === 0) {
                rooms.delete(roomCode);
              } else {
                io.to(roomCode).emit('room-updated', room);
              }
            }
          }, 30000); // 30 second reconnection window
          
          io.to(roomCode).emit('room-updated', room);
          break;
        }
      });
    });

    res.end();
  } else {
    console.log('Socket is already running');
    res.end();
  }
};

export default SocketHandler;