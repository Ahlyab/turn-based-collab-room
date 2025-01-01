import { create } from 'zustand';
import { Room, Developer } from './types';

interface CollabState {
  room: Room | null;
  setRoom: (room: Room) => void;
  updateDeveloper: (developerId: string, updates: Partial<Developer>) => void;
  updateCode: (code: string) => void;
  updateTimers: (totalTime: number, turnTime: number) => void;
}

export const useStore = create<CollabState>((set) => ({
  room: null,
  setRoom: (room) => set({ room }),
  updateDeveloper: (developerId, updates) =>
    set((state) => {
      if (!state.room) return state;
      
      const developers = state.room.developers.map((dev) =>
        dev.id === developerId ? { ...dev, ...updates } : dev
      );
      
      return {
        room: {
          ...state.room,
          developers,
        },
      };
    }),
  updateCode: (code) =>
    set((state) => ({
      room: state.room ? { ...state.room, currentCode: code } : null,
    })),
  updateTimers: (totalTime, turnTime) =>
    set((state) => ({
      room: state.room
        ? {
            ...state.room,
            totalTimeRemaining: totalTime,
            turnTimeRemaining: turnTime,
          }
        : null,
    })),
}));