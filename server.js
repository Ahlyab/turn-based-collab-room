const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Constants
const TOTAL_TIME = 30 * 60; // 30 minutes in seconds
const TURN_TIME = 5 * 60;  // 5 minutes in seconds

// Store active rooms and timers
const activeRooms = new Map();
const roomTimers = new Map();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  function startRoomTimers(roomCode) {
    if (roomTimers.has(roomCode)) {
      clearInterval(roomTimers.get(roomCode));
    }

    const timer = setInterval(() => {
      const room = activeRooms.get(roomCode);
      if (!room || !room.sessionStarted) {
        clearInterval(timer);
        roomTimers.delete(roomCode);
        return;
      }

      // Update times
      room.totalTimeRemaining--;
      room.turnTimeRemaining--;

      // Switch turns when turn timer expires
      if (room.turnTimeRemaining <= 0) {
        room.developers = room.developers.map(dev => ({
          ...dev,
          isActive: !dev.isActive
        }));
        room.turnTimeRemaining = TURN_TIME;
      }

      // End session when total time expires
      if (room.totalTimeRemaining <= 0) {
        clearInterval(timer);
        roomTimers.delete(roomCode);
        io.to(roomCode).emit('session-ended');
        return;
      }

      // Broadcast updated room state
      const roomState = {
        ...room,
        users: Array.from(room.users)
      };
      io.to(roomCode).emit('room-updated', roomState);
    }, 1000);

    roomTimers.set(roomCode, timer);
  }

  io.on('connection', socket => {
    console.log('Client connected');
    
    socket.on('create-room', () => {
      const roomCode = Array.from({ length: 6 }, () =>
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.charAt(Math.floor(Math.random() * 36))
      ).join('');
      
      const newRoom = {
        id: roomCode,
        code: roomCode,
        developers: [{
          id: socket.id,
          name: 'Developer 1',
          isActive: true,
          isConnected: true
        }],
        currentCode: '// Start coding here...',
        sessionStarted: false,
        totalTimeRemaining: TOTAL_TIME,
        turnTimeRemaining: TURN_TIME,
        users: new Set([socket.id])
      };
      
      activeRooms.set(roomCode, newRoom);
      socket.roomCode = roomCode;
      socket.join(roomCode);
      
      socket.emit('room-updated', {
        ...newRoom,
        users: Array.from(newRoom.users)
      });
      console.log('Room created:', roomCode);
    });

    socket.on('join-room', (roomCode) => {
      const room = activeRooms.get(roomCode);
      console.log('Join attempt:', {
        roomCode,
        exists: !!room,
        developersCount: room?.developers?.length || 0
      });

      if (!room) {
        socket.emit('join-error', 'Room does not exist');
        return;
      }

      // Check if user is already in the room
      const existingDeveloper = room.developers.find(dev => dev.id === socket.id);
      if (existingDeveloper) {
        // If user is already in room, just send the current state
        socket.emit('room-updated', {
          ...room,
          users: Array.from(room.users)
        });
        return;
      }

      // Allow joining if there's less than 2 developers
      if (room.developers.length < 2) {
        room.users.add(socket.id);
        socket.roomCode = roomCode;
        socket.join(roomCode);

        const newDeveloper = {
          id: socket.id,
          name: `Developer ${room.developers.length + 1}`,
          isActive: false,
          isConnected: true
        };
        room.developers.push(newDeveloper);

        if (room.developers.length === 2) {
          room.sessionStarted = true;
          startRoomTimers(roomCode);
        }

        const roomState = {
          ...room,
          users: Array.from(room.users)
        };
        io.to(roomCode).emit('room-updated', roomState);
        console.log('User joined room:', {
          roomCode,
          developersCount: room.developers.length,
          developers: room.developers.map(d => ({ id: d.id, name: d.name }))
        });
      } else {
        socket.emit('join-error', 'Room is full');
        console.log('Room full:', {
          roomCode,
          developersCount: room.developers.length
        });
      }
    });

    socket.on('code-update', (code) => {
      if (!socket.roomCode) return;
      
      const room = activeRooms.get(socket.roomCode);
      if (!room) return;

      room.currentCode = code;
      const roomState = {
        ...room,
        users: Array.from(room.users)
      };
      io.to(socket.roomCode).emit('room-updated', roomState);
    });

    socket.on('disconnect', () => {
      if (!socket.roomCode) return;

      const room = activeRooms.get(socket.roomCode);
      if (!room) return;

      room.users.delete(socket.id);
      const developer = room.developers.find(dev => dev.id === socket.id);
      if (developer) {
        developer.isConnected = false;
      }

      if (room.sessionStarted) {
        const timer = roomTimers.get(socket.roomCode);
        if (timer) {
          clearInterval(timer);
          roomTimers.delete(socket.roomCode);
        }
        io.to(socket.roomCode).emit('session-ended');
      }

      if (room.users.size === 0) {
        activeRooms.delete(socket.roomCode);
      } else {
        const roomState = {
          ...room,
          users: Array.from(room.users)
        };
        io.to(socket.roomCode).emit('room-updated', roomState);
      }
    });
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
}).catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});
