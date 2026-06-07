export type GameMode = 'CLASSIC' | 'INFINITE';

export interface InfiniteEndCondition {
  type: 'KILL_GOAL';
  value: number;
}

export interface InfiniteConfig {
  endCondition: InfiniteEndCondition;
}

export interface Player {
  uid: string;
  callsign: string;
  avatarId?: string; // Selected icon (e.g., 'icon-binoculars')
  status: 'ALIVE' | 'PENDING_ELIMINATION' | 'ELIMINATED' | 'WINNER';
  targetId?: string;
  targetCallsign?: string;
  taskDescription?: string;
  pendingEliminationBy?: string;
  pendingTaskDescription?: string; // Assassin's objective shown on confirm-elimination screen
  eliminatedBy?: string;
  eliminatedAt?: number;
  killCount?: number;
  respawnCount?: number;
  rerollsUsed?: number;
  emergencyPin?: string; // 3-digit Agent Key for identity recovery
}

export interface Game {
  id: string;
  hostId: string;
  status: 'LOBBY' | 'CONFIGURING' | 'ACTIVE' | 'COMPLETED';
  playerIds: string[];
  createdAt: number;
  winnerId?: string;
  mode?: GameMode;
  infiniteConfig?: InfiniteConfig;
  endsAt?: number;
  // Task pack configuration (set during host configuration)
  selectedPacks?: string[];
  difficultySetting?: 'Mixed' | 'Easy' | 'Medium' | 'Hard';
  maxRerolls?: number;
}
