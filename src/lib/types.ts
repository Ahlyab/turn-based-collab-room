export interface Developer {
  id: string;
  name: string;
  isActive: boolean;
  isConnected: boolean;
}

export interface Room {
  id: string;
  code: string;
  developers: Developer[];
  currentCode: string;
  sessionStarted: boolean;
  sessionEndTime?: Date;
  currentTurnEndTime?: Date;
  totalTimeRemaining: number;
  turnTimeRemaining: number;
}