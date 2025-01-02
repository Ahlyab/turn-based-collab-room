import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Editor } from '../../components/Editor';
import { Timer } from '../../components/Timer';
import { RoomStatus } from '../../components/RoomStatus';
import { useStore } from '../../lib/store';
import { getSocket } from '../../lib/socket';

export default function Room() {
  const router = useRouter();
  const { code } = router.query;
  const { room, setRoom } = useStore();

  useEffect(() => {
    const socket = getSocket();

    // Join the room when the page loads
    if (code && typeof code === 'string' && !room) {
      console.log('Joining room:', code);
      socket.emit('join-room', code);
    }

    socket.on('room-updated', (updatedRoom) => {
      console.log('Room updated:', updatedRoom);
      setRoom(updatedRoom);
    });

    socket.on('join-error', (error) => {
      console.error('Join error:', error);
      alert(error);
      router.push('/');
    });

    socket.on('session-ended', () => {
      alert('Session has ended!');
      router.push('/');
    });

    return () => {
      socket.off('room-updated');
      socket.off('join-error');
      socket.off('session-ended');
    };
  }, [code, room, setRoom, router]);

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-2xl text-gray-700 font-semibold animate-pulse">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <Editor />
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <RoomStatus />
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <Timer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}