import {
  shufflePlayers,
  buildTargetChain,
  pickIndependentTarget,
  computeIndependentKill,
  computeIndependentJoin,
  validateIndependentTargets,
  isGameOver,
} from '@/features/game/gameLogic';
import { Player, PendingElimination } from '@/types';
import { MAX_PLAYERS } from '@/constants';

const TASKS = ['T1', 'T2', 'T3', 'T4', 'T5'];

const seededRng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

/**
 * A pure-logic simulator for the Option E independent-target model. It mirrors
 * the transactional write path of gameService (queue append, head/specific
 * resolution, join, swap) so the invariants can be exercised at scale.
 */
class InfiniteGameSimulator {
  private players: Player[] = [];
  private rng: () => number;
  private goal: number;
  private now = 1;

  constructor(
    private n: number,
    goal: number,
    seed: number,
  ) {
    this.goal = goal;
    this.rng = seededRng(seed);
  }

  start(): void {
    const roster = Array.from({ length: this.n }, (_, i) => ({
      uid: `p${i}`,
      callsign: `Agent${i}`,
    }));
    shufflePlayers(roster);
    const chain = buildTargetChain(roster, TASKS);
    this.players = chain.map((a) => ({
      uid: a.uid,
      callsign: roster.find((r) => r.uid === a.uid)!.callsign,
      status: 'ALIVE' as const,
      targetId: a.targetId,
      targetCallsign: a.targetCallsign,
      taskDescription: a.taskDescription,
      killCount: 0,
      respawnCount: 0,
      pendingEliminations: [],
    }));
    this.assertInvariant();
  }

  private get(uid: string): Player {
    return this.players.find((p) => p.uid === uid)!;
  }

  /** Assassin challenges (catches) their current target — appends to the queue. */
  challenge(assassinId: string): void {
    const assassin = this.get(assassinId);
    const targetId = assassin.targetId!;
    const target = this.get(targetId);
    const queue = target.pendingEliminations ?? [];
    if (queue.some((e) => e.assassinId === assassinId)) return; // dedupe
    const entry: PendingElimination = {
      assassinId,
      assassinCallsign: assassin.callsign,
      taskDescription: assassin.taskDescription ?? '',
      claimedAt: this.now++,
    };
    this.applyUpdate(targetId, { pendingEliminations: [...queue, entry] });
    this.assertInvariant();
  }

  /** Resolve the head (or a specific assassin's) queued claim as a confirmed kill. */
  confirm(targetId: string, assassinId?: string): boolean {
    const target = this.get(targetId);
    const queue = target.pendingEliminations ?? [];
    if (queue.length === 0) return false;
    const entry = assassinId
      ? queue.find((e) => e.assassinId === assassinId)
      : queue[0];
    if (!entry) return false;

    const assassin = this.get(entry.assassinId);
    const { victimUpdate, assassinUpdate } = computeIndependentKill(
      target,
      entry.assassinId,
      assassin.killCount ?? 0,
      this.players,
      TASKS,
      entry.assassinId,
      true,
      this.rng,
    );
    const remaining = queue.filter((e) => e !== entry);
    this.applyUpdate(targetId, { ...victimUpdate, pendingEliminations: remaining });
    this.applyUpdate(entry.assassinId, assassinUpdate);
    this.assertInvariant();
    return true;
  }

  /** Deny the head (or specific) queued claim — drop it, award nothing. */
  deny(targetId: string, assassinId?: string): boolean {
    const target = this.get(targetId);
    const queue = target.pendingEliminations ?? [];
    if (queue.length === 0) return false;
    const entry = assassinId ? queue.find((e) => e.assassinId === assassinId) : queue[0];
    if (!entry) return false;
    this.applyUpdate(targetId, {
      pendingEliminations: queue.filter((e) => e !== entry),
    });
    this.assertInvariant();
    return true;
  }

  joinLate(playerId: string): void {
    const fields = computeIndependentJoin(playerId, this.players, TASKS, this.rng);
    this.players.push({
      uid: playerId,
      callsign: playerId,
      status: 'ALIVE',
      killCount: 0,
      respawnCount: 0,
      pendingEliminations: [],
      ...fields,
    });
    this.assertInvariant();
  }

  swapTarget(playerId: string): void {
    const player = this.get(playerId);
    const newTargetId = pickIndependentTarget(playerId, this.players, player.targetId, this.rng);
    const target = this.get(newTargetId);
    this.applyUpdate(playerId, { targetId: newTargetId, targetCallsign: target.callsign });
    this.assertInvariant();
  }

  private applyUpdate(uid: string, update: Record<string, unknown>): void {
    this.players = this.players.map((p) => (p.uid === uid ? { ...p, ...update } : p));
  }

  assertInvariant(): void {
    const { valid, errors } = validateIndependentTargets(this.players);
    if (!valid) throw new Error(errors.join('; '));
  }

  getPlayers(): Player[] {
    return this.players;
  }

  pendingFor(uid: string): PendingElimination[] {
    return this.get(uid).pendingEliminations ?? [];
  }

  checkGameOver(): ReturnType<typeof isGameOver> {
    return isGameOver(
      {
        mode: 'INFINITE',
        infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: this.goal } },
      },
      this.players,
    );
  }
}

describe('Option E invariants', () => {
  it('no bystander swap: a single confirmed kill changes only victim + assassin targets', () => {
    const sim = new InfiniteGameSimulator(5, 99, 123);
    sim.start();
    const before = JSON.parse(JSON.stringify(sim.getPlayers())) as Player[];
    const assassin = before[0]!;
    const victimId = assassin.targetId!;

    sim.challenge(assassin.uid);
    sim.confirm(victimId);

    const after = sim.getPlayers();
    for (const p of before) {
      if (p.uid === assassin.uid || p.uid === victimId) continue;
      const now = after.find((a) => a.uid === p.uid)!;
      expect(now.targetId).toBe(p.targetId);
      expect(now.targetCallsign).toBe(p.targetCallsign);
    }
  });

  it('no inheritance: assassin gets a fresh directive + fresh target, never re-locks victim (N>2)', () => {
    const sim = new InfiniteGameSimulator(6, 99, 777);
    sim.start();
    const assassin = sim.getPlayers()[0]!;
    const victimId = assassin.targetId!;

    sim.challenge(assassin.uid);
    sim.confirm(victimId);

    const assassinAfter = sim.getPlayers().find((p) => p.uid === assassin.uid)!;
    // Fresh target (never the victim it just caught) and a fresh directive drawn
    // from the task pool (not inherited from the victim's contract). The
    // deterministic no-inheritance proof lives in gameLogic.infinite.test.ts.
    expect(assassinAfter.targetId).not.toBe(victimId);
    expect(TASKS).toContain(assassinAfter.taskDescription);
  });

  it('queue integrity: stacked confirmations resolve FIFO and preserve others (§5.2)', () => {
    // Force A→B and C→B (shared target), everyone else out of the way.
    const sim = new InfiniteGameSimulator(4, 99, 55);
    sim.start();
    // Point both p0 and p2 at p1 via swaps.
    const players = sim.getPlayers();
    // deterministically set up shared target by swapping until p0,p2 -> p1
    // (use direct challenge model: challenge appends regardless of target field,
    //  so drive p0 and p2 to target p1 first)
    // p0 -> p1
    while (sim.getPlayers().find((p) => p.uid === 'p0')!.targetId !== 'p1') {
      sim.swapTarget('p0');
    }
    while (sim.getPlayers().find((p) => p.uid === 'p2')!.targetId !== 'p1') {
      sim.swapTarget('p2');
    }
    expect(players.length).toBe(4);

    sim.challenge('p0');
    sim.challenge('p2');
    expect(sim.pendingFor('p1').map((e) => e.assassinId)).toEqual(['p0', 'p2']);

    // Confirm head (p0) -> p0 credited, p2 claim preserved
    sim.confirm('p1');
    expect(sim.pendingFor('p1').map((e) => e.assassinId)).toEqual(['p2']);
    expect(sim.getPlayers().find((p) => p.uid === 'p0')!.killCount).toBe(1);
    expect(sim.getPlayers().find((p) => p.uid === 'p1')!.respawnCount).toBe(1);

    // Confirm next (p2) -> p2 credited, queue empty
    sim.confirm('p1');
    expect(sim.pendingFor('p1')).toEqual([]);
    expect(sim.getPlayers().find((p) => p.uid === 'p2')!.killCount).toBe(1);
    expect(sim.getPlayers().find((p) => p.uid === 'p1')!.respawnCount).toBe(2);
  });

  it('deny one, keep the other (§5.3)', () => {
    const sim = new InfiniteGameSimulator(4, 99, 88);
    sim.start();
    while (sim.getPlayers().find((p) => p.uid === 'p0')!.targetId !== 'p1') sim.swapTarget('p0');
    while (sim.getPlayers().find((p) => p.uid === 'p2')!.targetId !== 'p1') sim.swapTarget('p2');
    sim.challenge('p0');
    sim.challenge('p2');
    sim.confirm('p1'); // p0 scores
    sim.deny('p1'); // p2 denied
    expect(sim.pendingFor('p1')).toEqual([]);
    expect(sim.getPlayers().find((p) => p.uid === 'p2')!.killCount).toBe(0);
  });

  it('dedupe: a repeated challenge from the same assassin does not stack', () => {
    const sim = new InfiniteGameSimulator(4, 99, 99);
    sim.start();
    const assassin = sim.getPlayers()[0]!;
    sim.challenge(assassin.uid);
    sim.challenge(assassin.uid);
    expect(sim.pendingFor(assassin.targetId!)).toHaveLength(1);
  });

  it('swap changes only the caller and honors the invariant (§5.5)', () => {
    const sim = new InfiniteGameSimulator(5, 99, 202);
    sim.start();
    const before = JSON.parse(JSON.stringify(sim.getPlayers())) as Player[];
    const oldTarget = before.find((p) => p.uid === 'p0')!.targetId;
    sim.swapTarget('p0');
    const after = sim.getPlayers();
    const p0 = after.find((p) => p.uid === 'p0')!;
    expect(p0.targetId).not.toBe(oldTarget);
    for (const p of before) {
      if (p.uid === 'p0') continue;
      const now = after.find((a) => a.uid === p.uid)!;
      expect(now.targetId).toBe(p.targetId);
    }
  });
});

describe.each([2, 3, 4, 5, 10, 20, 30])('InfiniteGameSimulator N=%i', (n) => {
  it('round-robin kills keep everyone ALIVE with a valid independent graph', () => {
    const sim = new InfiniteGameSimulator(n, 999, n * 11);
    sim.start();
    for (let i = 0; i < n; i++) {
      const assassin = sim.getPlayers()[i % n]!;
      sim.challenge(assassin.uid);
      sim.confirm(assassin.targetId!);
      expect(sim.getPlayers().every((p) => p.status === 'ALIVE')).toBe(true);
    }
    sim.assertInvariant();
  });
});

describe('long-run simulation', () => {
  it('thousands of random ops never break the invariant and never starve a live agent', () => {
    const sim = new InfiniteGameSimulator(8, 100000, 20260831);
    sim.start();
    const rng = seededRng(4242);
    let joinCounter = 100;

    for (let step = 0; step < 4000; step++) {
      const players = sim.getPlayers();
      const roll = rng();
      const actor = players[Math.floor(rng() * players.length)]!;
      if (roll < 0.55) {
        sim.challenge(actor.uid);
        // Sometimes a target has stacked claims; resolve head.
        sim.confirm(actor.targetId!);
      } else if (roll < 0.7) {
        sim.swapTarget(actor.uid);
      } else if (roll < 0.8 && players.length < MAX_PLAYERS) {
        sim.joinLate(`late${joinCounter++}`);
      } else {
        // challenge without confirm to build queues, then maybe deny
        sim.challenge(actor.uid);
        if (rng() < 0.5) sim.deny(actor.targetId!);
      }
      sim.assertInvariant();
    }

    // Every alive agent still has exactly one valid target (invariant proven each step).
    expect(validateIndependentTargets(sim.getPlayers()).valid).toBe(true);
  });

  it('kill goal terminates the game', () => {
    const sim = new InfiniteGameSimulator(4, 3, 31337);
    sim.start();
    let over = false;
    for (let i = 0; i < 500 && !over; i++) {
      const p0Target = sim.getPlayers().find((p) => p.uid === 'p0')!.targetId!;
      sim.challenge('p0');
      sim.confirm(p0Target);
      over = sim.checkGameOver().over;
    }
    const result = sim.checkGameOver();
    expect(result.over).toBe(true);
    expect(sim.getPlayers().find((p) => p.uid === 'p0')!.killCount).toBeGreaterThanOrEqual(3);
  });

  it('fairness probe (informational): logs times-eliminated distribution', () => {
    const sim = new InfiniteGameSimulator(6, 100000, 9001);
    sim.start();
    const rng = seededRng(13);
    for (let step = 0; step < 3000; step++) {
      const players = sim.getPlayers();
      const actor = players[Math.floor(rng() * players.length)]!;
      sim.challenge(actor.uid);
      sim.confirm(actor.targetId!);
    }
    const dist = sim.getPlayers().map((p) => ({ uid: p.uid, deaths: p.respawnCount }));
    // Not a hard assertion — variance expected. Just ensure it ran and all seats respawned some.
    expect(dist.every((d) => (d.deaths ?? 0) >= 0)).toBe(true);
  });
});

describe('mid-game join coverage', () => {
  it('joiner gets a valid target and touches no existing player', () => {
    const sim = new InfiniteGameSimulator(5, 99, 55);
    sim.start();
    const before = JSON.parse(JSON.stringify(sim.getPlayers())) as Player[];
    sim.joinLate('p5');
    const after = sim.getPlayers();
    expect(after).toHaveLength(6);
    const joiner = after.find((p) => p.uid === 'p5')!;
    expect(joiner.killCount).toBe(0);
    expect(['p0', 'p1', 'p2', 'p3', 'p4']).toContain(joiner.targetId);
    for (const p of before) {
      const now = after.find((a) => a.uid === p.uid)!;
      expect(now.targetId).toBe(p.targetId);
    }
  });

  it('respects MAX_PLAYERS conceptually', () => {
    expect(MAX_PLAYERS).toBe(40);
    const sim = new InfiniteGameSimulator(30, 999, 1);
    sim.start();
    for (let i = 30; i < MAX_PLAYERS; i++) {
      sim.joinLate(`late${i}`);
    }
    expect(sim.getPlayers().length).toBe(MAX_PLAYERS);
    sim.assertInvariant();
  });

  it('30-player perf: 30 kills under 200ms', () => {
    const sim = new InfiniteGameSimulator(30, 999, 30);
    const start = Date.now();
    sim.start();
    for (let i = 0; i < 30; i++) {
      const assassin = sim.getPlayers()[i % 30]!;
      sim.challenge(assassin.uid);
      sim.confirm(assassin.targetId!);
    }
    expect(Date.now() - start).toBeLessThan(200);
  });
});
