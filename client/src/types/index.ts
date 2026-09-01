export type GameMode = 'CLASSIC' | 'INFINITE';

export interface InfiniteEndCondition {
  type: 'KILL_GOAL';
  value: number;
}

export interface InfiniteConfig {
  endCondition: InfiniteEndCondition;
}

/**
 * A single queued claim that this player has been eliminated. Under Option E
 * (infinite mode) a shared target can be caught by several assassins at once, so
 * claims stack in a FIFO queue and are resolved one at a time. In classic mode
 * the queue only ever holds 0 or 1 entry (single hunter).
 */
export interface PendingElimination {
  assassinId: string; // who claims the catch
  assassinCallsign: string; // denormalized for host panel + victim screen (no extra reads)
  taskDescription: string; // the assassin's directive at claim time (what they made you do)
  claimedAt: number; // Date.now(); used for FIFO ordering + display
}

export interface Player {
  uid: string;
  callsign: string;
  avatarId?: string; // Selected icon (e.g., 'icon-binoculars')
  status: 'ALIVE' | 'ELIMINATED' | 'WINNER';
  targetId?: string;
  targetCallsign?: string;
  taskDescription?: string;
  pendingEliminations?: PendingElimination[]; // FIFO queue; [] or undefined = none
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
  status: 'LOBBY' | 'ACTIVE' | 'COMPLETED';
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
