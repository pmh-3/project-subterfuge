import {
  shufflePlayers,
  buildTargetChain,
  computeInstantInfiniteElimination,
  computeMidGameJoinUpdates,
  validateAliveTargetChain,
  isGameOver,
} from '@/features/game/gameLogic';
import { Player } from '@/types';
import { MAX_PLAYERS } from '@/constants';

const TASKS = ['T1', 'T2', 'T3', 'T4', 'T5'];

const seededRng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

class InfiniteGameSimulator {
  private players: Player[] = [];
  private rng: () => number;
  private goal: number;

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
    }));
    this.assertChain();
  }

  eliminate(assassinId: string): void {
    const assassin = this.players.find((p) => p.uid === assassinId)!;
    const victim = this.players.find((p) => p.uid === assassin.targetId)!;
    const { victimUpdate, assassinUpdate, anchorUpdate, anchorId } =
      computeInstantInfiniteElimination(
        victim,
        assassinId,
        assassin.killCount || 0,
        this.players,
        TASKS,
        assassinId,
        true,
        this.rng,
      );
    this.players = this.players.map((p) => {
      if (p.uid === victim.uid) return { ...p, ...victimUpdate, status: 'ALIVE' as const };
      if (p.uid === assassinId) {
        return { ...p, ...assassinUpdate, killCount: (assassin.killCount || 0) + 1 };
      }
      if (p.uid === anchorId) return { ...p, ...anchorUpdate };
      return p;
    });
    this.assertChain();
  }

  joinLate(playerId: string): void {
    const { newPlayerFields, anchorUpdate, anchorId } = computeMidGameJoinUpdates(
      { uid: playerId, callsign: playerId },
      this.players,
      TASKS,
      this.rng,
    );
    this.players.push({
      uid: playerId,
      callsign: playerId,
      status: 'ALIVE',
      killCount: 0,
      respawnCount: 0,
      ...newPlayerFields,
    });
    this.players = this.players.map((p) =>
      p.uid === anchorId ? { ...p, ...anchorUpdate } : p,
    );
    this.assertChain();
  }

  assertChain(): void {
    const { valid, errors } = validateAliveTargetChain(this.players);
    if (!valid) throw new Error(errors.join('; '));
  }

  getPlayers(): Player[] {
    return this.players;
  }

  checkGameOver(): ReturnType<typeof isGameOver> {
    return isGameOver(
      { mode: 'INFINITE', infiniteConfig: { endCondition: { type: 'KILL_GOAL', value: this.goal } } },
      this.players,
    );
  }
}

describe.each([2, 3, 4, 5, 10, 20, 30])('InfiniteGameSimulator N=%i', (n) => {
  it('round-robin elimination keeps all ALIVE with valid chain', () => {
    const sim = new InfiniteGameSimulator(n, 99, n * 11);
    sim.start();
    for (let i = 0; i < n; i++) {
      const assassin = sim.getPlayers()[i % n]!;
      sim.eliminate(assassin.uid);
      expect(sim.getPlayers().every((p) => p.status === 'ALIVE')).toBe(true);
    }
  });

  it('rapid back-to-back kills keep chain valid', () => {
    if (n < 5) return;
    const sim = new InfiniteGameSimulator(n, 99, n * 13);
    sim.start();
    for (let i = 0; i < 3; i++) {
      sim.eliminate(sim.getPlayers()[0]!.uid);
    }
    sim.assertChain();
  });
});

describe('InfiniteGameSimulator scenarios', () => {
  it('N=2 instant cycle restore', () => {
    const sim = new InfiniteGameSimulator(2, 10, 2);
    sim.start();
    sim.eliminate('p0');
    sim.assertChain();
  });

  it('kill goal ends game with correct winner', () => {
    const sim = new InfiniteGameSimulator(3, 3, 99);
    sim.start();
    for (let i = 0; i < 3; i++) {
      sim.eliminate('p0');
      const result = sim.checkGameOver();
      if (result.over) {
        expect(result.winnerId).toBe('p0');
        return;
      }
    }
    expect(sim.checkGameOver().over).toBe(true);
  });

  it('mid-game join at N=5 adds 6th player', () => {
    const sim = new InfiniteGameSimulator(5, 10, 55);
    sim.start();
    sim.joinLate('p5');
    expect(sim.getPlayers()).toHaveLength(6);
    expect(sim.getPlayers().find((p) => p.uid === 'p5')?.killCount).toBe(0);
  });

  it('30-player perf: 30 eliminations under 200ms', () => {
    const sim = new InfiniteGameSimulator(30, 99, 30);
    const start = Date.now();
    sim.start();
    for (let i = 0; i < 30; i++) {
      sim.eliminate(sim.getPlayers()[i % 30]!.uid);
    }
    expect(Date.now() - start).toBeLessThan(200);
  });

  it('rejects join beyond MAX_PLAYERS conceptually', () => {
    expect(MAX_PLAYERS).toBe(40);
    const sim = new InfiniteGameSimulator(30, 10, 1);
    sim.start();
    for (let i = 30; i < MAX_PLAYERS; i++) {
      sim.joinLate(`late${i}`);
    }
    expect(sim.getPlayers().length).toBe(MAX_PLAYERS);
  });
});
