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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Code Collaboration Room
        </h1>
        
        <div className="space-y-6">
          <button
            onClick={createRoom}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-[1.02] font-semibold shadow-md"
          >
            Create New Room
          </button>
          
          <div className="space-y-3">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter Room Code"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 bg-gray-50"
              maxLength={6}
            />
            <button
              onClick={joinRoom}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-[1.02] font-semibold shadow-md"
            >
              Join Room
            </button>
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}