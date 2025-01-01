import { useState } from 'react';
import { useRouter } from 'next/router';
import { getSocket } from '../lib/socket';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const createRoom = () => {
    const socket = getSocket();
    socket.emit('create-room');
    socket.once('room-updated', (room) => {
      console.log("Room created with code:", room.code);
      router.push(`/room/${room.code}`);
    });
  };

  const joinRoom = () => {
    if (!roomCode) {
      setError('Please enter a room code');
      return;
    }

    const socket = getSocket();
    socket.emit('join-room', roomCode);
    socket.once('join-error', (error) => {
      setError(error);
    });
    socket.once('room-updated', (room) => {
      router.push(`/room/${room.code}`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Code Collaboration Room
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={createRoom}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create New Room
          </button>
          
          <div className="relative">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter Room Code"
              className="w-full p-2 border rounded-md"
              maxLength={6}
            />
            <button
              onClick={joinRoom}
              className="mt-2 w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
            >
              Join Room
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}