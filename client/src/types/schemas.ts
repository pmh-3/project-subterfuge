import { z } from 'zod';

export const PlayerStatusSchema = z.enum([
  'ALIVE',
  'PENDING_ELIMINATION',
  'ELIMINATED',
  'WINNER',
]);

export const GameStatusSchema = z.enum(['LOBBY', 'CONFIGURING', 'ACTIVE', 'COMPLETED']);

export const DifficultySettingSchema = z.enum(['Mixed', 'Easy', 'Medium', 'Hard']);

export const GameModeSchema = z.enum(['CLASSIC', 'INFINITE']);

export const InfiniteEndConditionSchema = z.object({
  type: z.literal('KILL_GOAL'),
  value: z.number().int().min(1).max(99),
});

export const InfiniteConfigSchema = z.object({
  endCondition: InfiniteEndConditionSchema,
});

export const TaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  difficultyScale: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const TaskPackSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  description: z.string(),
  difficulty: z.enum(['Recruit', 'Operative', 'Elite']),
  isPremium: z.boolean(),
  tasks: z.array(TaskSchema),
});

export const PlayerSchema = z.object({
  uid: z.string(),
  callsign: z.string(),
  avatarId: z.string().optional(),
  status: PlayerStatusSchema,
  targetId: z.string().nullish(),
  targetCallsign: z.string().nullish(),
  taskDescription: z.string().nullish(),
  pendingEliminationBy: z.string().nullish(),
  pendingTaskDescription: z.string().nullish(),
  eliminatedBy: z.string().nullish(),
  eliminatedAt: z.number().nullish(),
  killCount: z.number().nullish(),
  respawnCount: z.number().nullish(),
  rerollsUsed: z.number().nullish(),
  emergencyPin: z.string().optional(),
});

export const GameSchema = z.object({
  id: z.string(),
  hostId: z.string(),
  status: GameStatusSchema,
  playerIds: z.array(z.string()),
  createdAt: z.number(),
  winnerId: z.string().nullish(),
  selectedPacks: z.array(z.string()).optional(),
  difficultySetting: DifficultySettingSchema.optional(),
  maxRerolls: z.number().optional(),
  mode: GameModeSchema.optional(),
  infiniteConfig: InfiniteConfigSchema.optional(),
  endsAt: z.number().optional(),
});

export type ParsedGame = z.infer<typeof GameSchema>;
export type ParsedPlayer = z.infer<typeof PlayerSchema>;
export type ParsedTaskPack = z.infer<typeof TaskPackSchema>;
