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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading room...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Editor />
          </div>
          <div className="space-y-6">
            <RoomStatus />
            <Timer />
          </div>
        </div>
      </div>
    </div>
  );
}