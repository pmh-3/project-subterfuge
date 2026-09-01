import { getTasksFromPacks } from '@/features/tasks/taskService';

// Minimal Firestore mock: getTasksFromPacks issues one query per pack and reads
// mission docs via getDocs(...).forEach. We feed a controlled set of mission docs
// (some malformed) to prove the blank/undefined-directive filter (batch-2 #4a).
type MissionDoc = { id: string; data: () => Record<string, unknown> };
let missionDocs: MissionDoc[] = [];

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => 'missions'),
  query: jest.fn(() => 'q'),
  where: jest.fn(() => 'w'),
  getDocs: jest.fn(async () => ({
    forEach: (cb: (doc: MissionDoc) => void) => missionDocs.forEach(cb),
  })),
}));

jest.mock('@/services/firebase', () => ({ db: {} }));

const mission = (id: string, directive: unknown, difficulty = 1): MissionDoc => ({
  id,
  data: () => ({ directive, difficulty, pack_id: 'basic_training' }),
});

describe('getTasksFromPacks — malformed mission filtering (batch-2 #4a)', () => {
  beforeEach(() => {
    missionDocs = [];
  });

  it('drops missions whose directive is missing, blank, or non-string', async () => {
    missionDocs = [
      mission('ok', 'Get your target to high-five you'),
      mission('undef', undefined),
      mission('blank', '   '),
      mission('empty', ''),
      mission('nonstr', 42),
      mission('ok2', 'Convince your target to switch seats'),
    ];

    const tasks = await getTasksFromPacks(['basic_training'], 'Mixed');

    expect(tasks.map((t) => t.text)).toEqual([
      'Get your target to high-five you',
      'Convince your target to switch seats',
    ]);
  });

  it('returns an empty list (never a blank task) when every mission is malformed', async () => {
    missionDocs = [mission('undef', undefined), mission('blank', ''), mission('ws', '  ')];

    const tasks = await getTasksFromPacks(['basic_training'], 'Mixed');

    expect(tasks).toEqual([]);
  });
});
