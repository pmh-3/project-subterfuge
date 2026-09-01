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
    pendingEliminations: [],
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

const pickTask = (tasks: string[], rng: () => number): string =>
  tasks[Math.floor(rng() * tasks.length)]!;

/**
 * Picks a fresh independent target for `agentId`: a random ALIVE agent, never
 * self, and (when possible) never `avoidId` (so a swap/kill actually changes the
 * target). Falls back to allowing `avoidId` only when it is the sole option.
 * Throws when no eligible target exists.
 */
export function pickIndependentTarget(
  agentId: string,
  players: Pick<Player, 'uid' | 'status'>[],
  avoidId?: string,
  rng: () => number = Math.random,
): string {
  const alive = players.filter((p) => p.status === 'ALIVE' && p.uid !== agentId);
  if (alive.length === 0) {
    throw new Error('No eligible target for agent');
  }
  const preferred = avoidId ? alive.filter((p) => p.uid !== avoidId) : alive;
  const pool = preferred.length > 0 ? preferred : alive;
  const idx = Math.floor(rng() * pool.length);
  return pool[idx]!.uid;
}

/**
 * Kill resolution for infinite (Option E). The victim respawns instantly and
 * keeps their own target (no surprise); the assassin gets a FRESH random target
 * (never the victim when another option exists) plus a FRESH directive (never
 * inherited — closes the #12 information leak). No anchor, no bystander writes.
 *
 * The returned updates deliberately do NOT touch `pendingEliminations`; the
 * service removes only the resolved queue entry so stacked claims are preserved.
 */
export function computeIndependentKill(
  victim: Pick<Player, 'uid' | 'callsign' | 'respawnCount'>,
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
} {
  const victimUpdate: Record<string, unknown> = {
    status: 'ALIVE',
    respawnCount: (victim.respawnCount || 0) + 1,
    taskDescription: pickTask(tasks, rng),
    eliminatedBy,
    eliminatedAt: Date.now(),
    // targetId intentionally omitted: the victim keeps their existing target.
  };

  // If the victim's kept target is no longer valid (target left the game),
  // reassign so the invariant still holds after respawn.
  const victimRecord = allPlayers.find((p) => p.uid === victim.uid);
  const aliveIds = new Set(
    allPlayers.filter((p) => p.status === 'ALIVE').map((p) => p.uid),
  );
  const keptTargetId = victimRecord?.targetId;
  const keptTargetValid =
    !!keptTargetId && keptTargetId !== victim.uid && aliveIds.has(keptTargetId);
  if (!keptTargetValid) {
    const newTargetId = pickIndependentTarget(victim.uid, allPlayers, undefined, rng);
    victimUpdate.targetId = newTargetId;
    victimUpdate.targetCallsign =
      allPlayers.find((p) => p.uid === newTargetId)?.callsign ?? '';
  }

  const assassinTargetId = pickIndependentTarget(assassinId, allPlayers, victim.uid, rng);
  const assassinTarget = allPlayers.find((p) => p.uid === assassinTargetId);

  const assassinUpdate: Record<string, unknown> = {
    targetId: assassinTargetId,
    targetCallsign: assassinTarget?.callsign ?? '',
    taskDescription: pickTask(tasks, rng),
    ...(incrementKillCount && { killCount: assassinKillCount + 1 }),
  };

  return { victimUpdate, assassinUpdate };
}

/**
 * Fresh assignment for a brand-new (mid-game join) or reset agent. Picks a
 * random ALIVE target and a random directive. Touches no other player.
 */
export function computeIndependentJoin(
  newAgentId: string,
  players: Player[],
  tasks: string[],
  rng: () => number = Math.random,
): { targetId: string; targetCallsign: string; taskDescription: string } {
  const targetId = pickIndependentTarget(newAgentId, players, undefined, rng);
  const target = players.find((p) => p.uid === targetId);
  return {
    targetId,
    targetCallsign: target?.callsign ?? '',
    taskDescription: pickTask(tasks, rng),
  };
}

/**
 * A single per-hunter target reassignment produced when a player is force-removed
 * from an infinite game. `targetId: null` means the hunter has no eligible target
 * left (e.g. a lone survivor once everyone else is gone) — the round is
 * effectively over; clear the target rather than aborting.
 */
export interface ForceRemoveReassignment {
  uid: string;
  targetId: string | null;
  targetCallsign: string | null;
}

/**
 * Computes the target reassignments needed when `removedId` leaves an infinite
 * game (host force-remove). Every ALIVE agent that was hunting the removed player
 * gets a fresh target; no other agent is touched. Gracefully handles the
 * no-eligible-target case (returns `targetId: null`) instead of throwing, so the
 * removal transaction never aborts at small player counts (e.g. N=2).
 */
export function computeForceRemoveReassignments(
  removedId: string,
  players: Pick<Player, 'uid' | 'callsign' | 'status' | 'targetId'>[],
  rng: () => number = Math.random,
): ForceRemoveReassignment[] {
  // State AFTER the removal: the removed player is no longer ALIVE.
  const playersAfterRemoval = players.map((p) =>
    p.uid === removedId ? { ...p, status: 'ELIMINATED' as const } : p,
  );

  const reassignments: ForceRemoveReassignment[] = [];
  for (const player of players) {
    if (player.uid === removedId) continue;
    if (player.status !== 'ALIVE') continue;
    if (player.targetId !== removedId) continue;

    try {
      const newTargetId = pickIndependentTarget(player.uid, playersAfterRemoval, undefined, rng);
      const newTarget = playersAfterRemoval.find((p) => p.uid === newTargetId);
      reassignments.push({
        uid: player.uid,
        targetId: newTargetId,
        targetCallsign: newTarget?.callsign ?? '',
      });
    } catch {
      // No eligible target remains (lone survivor). Clear the target — the round
      // is effectively over — rather than aborting the whole removal.
      reassignments.push({ uid: player.uid, targetId: null, targetCallsign: null });
    }
  }
  return reassignments;
}

/**
 * Infinite-mode integrity check (replaces the Hamiltonian walk for infinite).
 * Every ALIVE agent must have a target that is a distinct, existing ALIVE agent.
 * In-degree is unconstrained — shared targets are allowed.
 */
export function validateIndependentTargets(
  players: Pick<Player, 'uid' | 'targetId' | 'status'>[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const alive = players.filter((p) => p.status === 'ALIVE');

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

  return { valid: errors.length === 0, errors };
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

/**
 * Times-eliminated count for a player, mode-aware (D8). Infinite mode has no
 * single-life status — a player respawns instantly on each kill, so their death
 * count is the running `respawnCount`. Classic is single-life: exactly 1 once
 * `ELIMINATED`, 0 otherwise.
 */
export function getDeathCount(
  player: Pick<Player, 'respawnCount' | 'status'>,
  isInfinite: boolean,
): number {
  return isInfinite ? player.respawnCount || 0 : player.status === 'ELIMINATED' ? 1 : 0;
}

export function sortPlayersByLeaderboard(players: Player[], isInfinite = true): Player[] {
  return [...players].sort((a, b) => {
    const killDiff = (b.killCount || 0) - (a.killCount || 0);
    if (killDiff !== 0) return killDiff;
    const deathDiff = getDeathCount(a, isInfinite) - getDeathCount(b, isInfinite);
    if (deathDiff !== 0) return deathDiff;
    return a.callsign.localeCompare(b.callsign);
  });
}
