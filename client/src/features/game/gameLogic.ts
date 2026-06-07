import { Game, Player } from '@/types';
import { DEFAULT_INFINITE_KILL_GOAL } from '@/constants';

export interface TargetAssignment {
  uid: string;
  targetId: string;
  targetCallsign: string;
  taskDescription: string;
}

/**
 * Fisher-Yates shuffle (in-place, returns same array reference).
 */
export function shufflePlayers<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Builds a circular target chain from an ordered list of players.
 * Each player targets the next; the last player targets the first.
 */
export function buildTargetChain(
  players: Pick<Player, 'uid' | 'callsign'>[],
  tasks: string[],
): TargetAssignment[] {
  return players.map((player, index) => {
    const target = players[(index + 1) % players.length];
    return {
      uid: player.uid,
      targetId: target.uid,
      targetCallsign: target.callsign,
      taskDescription: tasks[Math.floor(Math.random() * tasks.length)],
    };
  });
}

/**
 * Determines whether eliminating targetId results in a win for the assassin.
 * A win occurs when the target's target is the assassin (chain collapses to 1).
 */
export function detectWin(targetData: Pick<Player, 'targetId'>, assassinId: string): boolean {
  return targetData.targetId === assassinId;
}

/**
 * Computes the updates needed when a player is eliminated.
 * Pure computation -- no Firestore I/O.
 */
export function computeEliminationUpdates(
  targetData: Pick<Player, 'targetId' | 'targetCallsign' | 'taskDescription'>,
  assassinId: string,
  assassinKillCount: number,
  eliminatedBy: string,
  incrementKillCount: boolean,
): {
  targetUpdate: Record<string, unknown>;
  assassinUpdate: Record<string, unknown>;
  isWin: boolean;
} {
  const isWin = detectWin(targetData, assassinId);

  const targetUpdate: Record<string, unknown> = {
    status: 'ELIMINATED',
    pendingEliminationBy: null,
    pendingTaskDescription: null,
    eliminatedBy,
    eliminatedAt: Date.now(),
  };

  let assassinUpdate: Record<string, unknown>;

  if (isWin) {
    assassinUpdate = {
      status: 'WINNER',
      targetId: null,
      targetCallsign: null,
      taskDescription: 'VICTORY ACHIEVED',
      ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
    };
  } else {
    assassinUpdate = {
      targetId: targetData.targetId,
      targetCallsign: targetData.targetCallsign,
      taskDescription: targetData.taskDescription,
      ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
    };
  }

  return { targetUpdate, assassinUpdate, isWin };
}

// --- Infinite mode (parallel to classic; do not modify computeEliminationUpdates) ---

export function isClassicMode(game: Pick<Game, 'mode'>): boolean {
  return !game.mode || game.mode === 'CLASSIC';
}

export function isInfiniteMode(game: Pick<Game, 'mode'>): boolean {
  return game.mode === 'INFINITE';
}

export function getKillGoal(game: Pick<Game, 'infiniteConfig'>): number {
  return game.infiniteConfig?.endCondition.value ?? DEFAULT_INFINITE_KILL_GOAL;
}

export function pickChainInsertionAnchor(
  alivePlayers: Pick<Player, 'uid' | 'targetId'>[],
  excludeTargetId?: string,
  rng: () => number = Math.random,
): string {
  const preferred = excludeTargetId
    ? alivePlayers.filter((p) => p.targetId !== excludeTargetId)
    : alivePlayers;
  const pool = preferred.length > 0 ? preferred : alivePlayers;

  if (pool.length === 0) {
    throw new Error('No alive players for chain insertion');
  }
  const idx = Math.floor(rng() * pool.length);
  return pool[idx]!.uid;
}

export function computeChainInsertionUpdates(
  insertedPlayer: Pick<Player, 'uid' | 'callsign'>,
  anchorId: string,
  allPlayers: Pick<Player, 'uid' | 'callsign' | 'targetId' | 'targetCallsign'>[],
  tasks: string[],
  rng: () => number = Math.random,
): {
  insertedUpdate: { targetId: string; targetCallsign: string; taskDescription: string };
  anchorUpdate: { targetId: string; targetCallsign: string };
} {
  const anchor = allPlayers.find((p) => p.uid === anchorId);
  if (!anchor?.targetId || !anchor.targetCallsign) {
    throw new Error('Invalid anchor for chain insertion');
  }

  const insertedTargetsAnchor = anchor.targetId === insertedPlayer.uid;
  const insertedTargetId = insertedTargetsAnchor ? anchor.uid : anchor.targetId;
  const insertedTarget = allPlayers.find((p) => p.uid === insertedTargetId);

  return {
    insertedUpdate: {
      targetId: insertedTargetId,
      targetCallsign: insertedTargetsAnchor
        ? anchor.callsign
        : (insertedTarget?.callsign ?? anchor.targetCallsign),
      taskDescription: tasks[Math.floor(rng() * tasks.length)]!,
    },
    anchorUpdate: {
      targetId: insertedPlayer.uid,
      targetCallsign: insertedPlayer.callsign,
    },
  };
}

export function resolveAssassinTargetAfterKill(
  victimTargetId: string,
  assassinId: string,
  alivePlayers: Pick<Player, 'uid' | 'callsign' | 'status'>[],
  rng: () => number = Math.random,
): { targetId: string; targetCallsign: string } {
  if (victimTargetId !== assassinId) {
    const target = alivePlayers.find((p) => p.uid === victimTargetId && p.status === 'ALIVE');
    if (target) {
      return { targetId: victimTargetId, targetCallsign: target.callsign };
    }
  }

  const eligible = alivePlayers.filter((p) => p.uid !== assassinId && p.status === 'ALIVE');
  if (eligible.length === 0) {
    throw new Error('No eligible target for assassin');
  }
  const picked = eligible[Math.floor(rng() * eligible.length)]!;
  return { targetId: picked.uid, targetCallsign: picked.callsign };
}

export function computeInstantInfiniteElimination(
  victim: Player,
  assassinId: string,
  assassinKillCount: number,
  allPlayers: Player[],
  tasks: string[],
  eliminatedBy: string,
  incrementKillCount: boolean,
  rng: () => number = Math.random,
): {
  victimUpdate: Record<string, unknown>;
  assassinUpdate: Record<string, unknown>;
  anchorUpdate: Record<string, unknown>;
  anchorId: string;
} {
  const victimPreTargetId = victim.targetId!;
  const victimPreTask = victim.taskDescription!;

  const aliveExceptVictim = allPlayers.filter((p) => p.status === 'ALIVE' && p.uid !== victim.uid);
  const anchorId = pickChainInsertionAnchor(aliveExceptVictim, victim.uid, rng);
  const { insertedUpdate, anchorUpdate } = computeChainInsertionUpdates(
    victim,
    anchorId,
    allPlayers,
    tasks,
    rng,
  );

  const assassinTarget = resolveAssassinTargetAfterKill(
    victimPreTargetId,
    assassinId,
    allPlayers.filter((p) => p.status === 'ALIVE'),
    rng,
  );

  const victimUpdate: Record<string, unknown> = {
    status: 'ALIVE',
    pendingEliminationBy: null,
    pendingTaskDescription: null,
    eliminatedBy,
    eliminatedAt: Date.now(),
    respawnCount: (victim.respawnCount || 0) + 1,
    ...insertedUpdate,
  };

  const assassinUpdate: Record<string, unknown> = {
    targetId: assassinTarget.targetId,
    targetCallsign: assassinTarget.targetCallsign,
    taskDescription: victimPreTask,
    ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
  };

  return { victimUpdate, assassinUpdate, anchorUpdate, anchorId };
}

export function computeMidGameJoinUpdates(
  newPlayer: Pick<Player, 'uid' | 'callsign'>,
  allPlayers: Player[],
  tasks: string[],
  rng: () => number = Math.random,
): {
  newPlayerFields: { targetId: string; targetCallsign: string; taskDescription: string };
  anchorUpdate: { targetId: string; targetCallsign: string };
  anchorId: string;
} {
  const alivePlayers = allPlayers.filter((p) => p.status === 'ALIVE');
  const anchorId = pickChainInsertionAnchor(alivePlayers, undefined, rng);
  const { insertedUpdate, anchorUpdate } = computeChainInsertionUpdates(
    newPlayer,
    anchorId,
    allPlayers,
    tasks,
    rng,
  );
  return { newPlayerFields: insertedUpdate, anchorUpdate, anchorId };
}

export function isGameOver(
  game: Pick<Game, 'mode' | 'infiniteConfig' | 'endsAt'>,
  players: Player[],
  now: number = Date.now(),
): { over: boolean; winnerId?: string; reason?: 'KILL_GOAL' | 'TIMER' } {
  if (isClassicMode(game)) {
    return { over: false };
  }

  if (game.endsAt && now >= game.endsAt) {
    return { over: true, reason: 'TIMER' };
  }

  const goal = getKillGoal(game);
  const inPlay = players.filter(
    (p) => p.status === 'ALIVE' || p.status === 'PENDING_ELIMINATION',
  );
  const atGoal = inPlay.filter((p) => (p.killCount || 0) >= goal);

  if (atGoal.length === 1) {
    return { over: true, winnerId: atGoal[0]!.uid, reason: 'KILL_GOAL' };
  }
  if (atGoal.length > 1) {
    return { over: true, reason: 'KILL_GOAL' };
  }
  return { over: false };
}

export function validateAliveTargetChain(
  alivePlayers: Pick<Player, 'uid' | 'targetId' | 'status'>[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const alive = alivePlayers.filter((p) => p.status === 'ALIVE');

  if (alive.length === 0) {
    return { valid: true, errors };
  }

  const aliveIds = new Set(alive.map((p) => p.uid));

  for (const player of alive) {
    if (!player.targetId) {
      errors.push(`${player.uid} has no target`);
      continue;
    }
    if (player.targetId === player.uid) {
      errors.push(`${player.uid} targets self`);
    }
    if (!aliveIds.has(player.targetId)) {
      errors.push(`${player.uid} targets non-alive player ${player.targetId}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (alive.length === 1) {
    return { valid: false, errors: ['Single player cannot form a valid chain'] };
  }

  const visited = new Set<string>();
  let current = alive[0]!.uid;
  for (let i = 0; i < alive.length; i++) {
    if (visited.has(current)) {
      if (visited.size < alive.length) {
        errors.push('Chain does not cover all alive players');
      }
      break;
    }
    visited.add(current);
    const player = alive.find((p) => p.uid === current);
    current = player?.targetId ?? '';
  }

  if (visited.size !== alive.length) {
    errors.push(`Chain covers ${visited.size} of ${alive.length} players`);
  }

  return { valid: errors.length === 0, errors };
}

export function sortPlayersByLeaderboard(players: Player[]): Player[] {
  return [...players].sort((a, b) => {
    const killDiff = (b.killCount || 0) - (a.killCount || 0);
    if (killDiff !== 0) return killDiff;
    return a.callsign.localeCompare(b.callsign);
  });
}
