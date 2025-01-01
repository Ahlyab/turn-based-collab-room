import { useStore } from '../lib/store';

export const RoomStatus = () => {
  const { room } = useStore();

  if (!room) return null;

  const activeDev = room.developers.find(dev => dev.isActive);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Room: {room.code}</h2>
        <span className="px-3 py-1 bg-gray-100 rounded-full">
          {room.developers.length}/2 Developers
        </span>
      </div>
      
      <div className="space-y-2">
        {room.developers.map((dev) => (
          <div
            key={dev.id}
            className={`flex items-center justify-between p-2 rounded ${
              dev.isActive ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            <span className="font-medium">{dev.name}</span>
            <div className="flex items-center gap-2">
              {dev.isConnected && (
                <span className="text-green-500 text-sm">Connected</span>
              )}
              {dev.isActive && (
                <span className="text-blue-500 text-sm">Active Turn</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};