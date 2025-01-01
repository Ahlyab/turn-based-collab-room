import { useEffect } from 'react';
import { useStore } from '../lib/store';

export const Timer = () => {
  const { room } = useStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDev = room?.developers.find(dev => dev.isActive);

  if (!room?.sessionStarted) {
    return (
      <div className="p-4 bg-gray-800 text-white rounded-lg">
        <div className="text-sm text-gray-400">Waiting for another developer to join...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-800 text-white rounded-lg">
        <div className="mb-3 text-sm text-gray-400">
          Current Turn: {currentDev?.name || 'Loading...'}
        </div>
        <div className="flex gap-4">
          <div>
            <div className="text-sm text-gray-400">Session Time</div>
            <div className="text-2xl font-bold">
              {formatTime(room?.totalTimeRemaining || 0)}
            </div>
          </div>
          <div className="border-l border-gray-600 pl-4">
            <div className="text-sm text-gray-400">Turn Time</div>
            <div className="text-2xl font-bold">
              {formatTime(room?.turnTimeRemaining || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};