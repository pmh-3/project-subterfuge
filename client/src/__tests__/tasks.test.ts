import { TASKS } from '@/data/tasks';

describe('TASKS fallback data', () => {
  it('has a non-empty list of tasks', () => {
    expect(TASKS.length).toBeGreaterThan(0);
  });

  it('every task is a non-empty string', () => {
    for (const task of TASKS) {
      expect(typeof task).toBe('string');
      expect(task.trim().length).toBeGreaterThan(0);
    }
  });

  it('contains no duplicate tasks', () => {
    const unique = new Set(TASKS);
    expect(unique.size).toBe(TASKS.length);
  });
});
