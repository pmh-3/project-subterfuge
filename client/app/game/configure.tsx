import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '@/services/firebase';
import {
  Text,
  Button,
  Input,
  Stack,
  ScreenHeader,
  SegmentChips,
  PillSegments,
  Rule,
  Row,
  colors,
  space,
  radius,
} from '@/design-system';
import {
  DEFAULT_INFINITE_KILL_GOAL,
  INFINITE_KILL_GOAL_OPTIONS,
  INFINITE_KILL_GOAL_MIN,
  INFINITE_KILL_GOAL_MAX,
} from '@/constants';
import { parseGameOrThrow } from '@/types/firestoreParse';
import { fetchTaskPacks } from '@/features/tasks/taskService';
import { TaskPack, DifficultySetting } from '@/types/taskPack';
import { useAlert } from '@/hooks/useAlert';
import { useLayout } from '@/hooks/useLayout';
import { strings, dynamicStrings } from '@/strings';

const DIFFICULTY_OPTIONS: DifficultySetting[] = ['Mixed', 'Easy', 'Medium', 'Hard'];

function TaskPackCard({
  pack,
  selected,
  expanded,
  onToggleSelect,
  onToggleExamples,
}: {
  pack: TaskPack;
  selected: boolean;
  expanded: boolean;
  onToggleSelect: () => void;
  onToggleExamples: () => void;
}) {
  const hasExamples = pack.tasks.length > 0;

  return (
    <View style={[styles.packCard, selected && styles.packCardSelected]}>
      <Pressable onPress={onToggleSelect} style={styles.packMain}>
        <Row justify="space-between" align="flex-start" gap={4}>
          <Text variant="body" style={styles.packName}>
            {pack.displayName}
          </Text>
          {selected ? (
            <Text variant="body" accent>
              ✓
            </Text>
          ) : null}
        </Row>
        {pack.description ? (
          <Text variant="bodySmall" muted style={styles.packDescription}>
            {pack.description}
          </Text>
        ) : null}
      </Pressable>

      {hasExamples ? (
        <>
          <Rule marginVertical={4} style={styles.packDivider} />
          <Pressable onPress={onToggleExamples} style={styles.examplesToggle}>
            <Row justify="space-between" align="center">
              <Text variant="bodySmall" color={expanded ? colors.accentText : colors.inkSecondary}>
                {expanded ? strings.PACK_HIDE_EXAMPLES : strings.PACK_SHOW_EXAMPLES}
              </Text>
              <Text variant="bodySmall" muted>
                {expanded ? '▴' : '▾'}
              </Text>
            </Row>
          </Pressable>
          {expanded ? (
            <View style={styles.examplesList}>
              {pack.tasks.slice(0, 3).map((task) => (
                <Text key={task.id} variant="bodySmall" style={styles.exampleTask}>
                  {task.text}
                </Text>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export default function ConfigureScreen() {
  const router = useRouter();
  const { id: gameId } = useLocalSearchParams<{ id: string }>();
  const { showAlert, AlertComponent } = useAlert();
  const { contentStyle } = useLayout();

  const [packs, setPacks] = useState<TaskPack[]>([]);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(['basic_training']);
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);
  // D4: defaults are Infinite + Easy so a fresh doc (no mode/difficulty yet — the
  // create-flow case) preselects the intended default. Overwritten below (:139-148)
  // once the loaded doc has explicit values.
  const [gameMode, setGameMode] = useState('infinite');
  const [killGoal, setKillGoal] = useState(DEFAULT_INFINITE_KILL_GOAL);
  const [customKillGoal, setCustomKillGoal] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultySetting>('Easy');
  const [maxRerolls, setMaxRerolls] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Deep-link guard (D6): configure is a LOBBY-only screen. A host navigating
  // directly here (bookmark/back/typed URL) while the game is ACTIVE or
  // COMPLETED must not see the editable form or be able to write — that would
  // let handleAuthorize revert the game to LOBBY and flip its mode mid-game,
  // corrupting pending queues / respawn state. `redirecting` keeps the
  // loading view up while we bounce back to the game screen.
  const [gameStatus, setGameStatus] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      const [availablePacks, gameSnap] = await Promise.all([
        fetchTaskPacks(),
        getDoc(doc(db, 'games', gameId!)),
      ]);

      setPacks(availablePacks);

      if (gameSnap.exists()) {
        const game = parseGameOrThrow(gameSnap.data());
        setGameStatus(game.status);

        if (game.status !== 'LOBBY') {
          setRedirecting(true);
          router.replace(`/game/${gameId}`);
          return;
        }

        if (game.selectedPacks?.length) {
          setSelectedPackIds(game.selectedPacks);
        } else if (availablePacks.some((p) => p.id === 'basic_training')) {
          setSelectedPackIds(['basic_training']);
        } else if (availablePacks.length > 0) {
          setSelectedPackIds([availablePacks[0].id]);
        }
        if (game.difficultySetting) setDifficulty(game.difficultySetting);
        if (game.maxRerolls != null) setMaxRerolls(game.maxRerolls);
        if (game.mode === 'INFINITE') {
          setGameMode('infinite');
          const goal = game.infiniteConfig?.endCondition.value ?? DEFAULT_INFINITE_KILL_GOAL;
          setKillGoal(goal);
          if (!INFINITE_KILL_GOAL_OPTIONS.includes(goal as (typeof INFINITE_KILL_GOAL_OPTIONS)[number])) {
            setCustomKillGoal(String(goal));
          }
        } else if (game.mode === 'CLASSIC') {
          // Explicit Classic on the loaded doc must win over the component's
          // Infinite-by-default state (D4) — only a doc with no mode yet (the
          // fresh create-flow case) should show the default.
          setGameMode('elimination');
        }
      } else if (availablePacks.some((p) => p.id === 'basic_training')) {
        setSelectedPackIds(['basic_training']);
      } else if (availablePacks.length > 0) {
        setSelectedPackIds([availablePacks[0].id]);
      }
    } catch (error) {
      if (__DEV__) console.error('Failed to load packs:', error);
      showAlert({
        title: strings.CONFIGURE_CONNECTION_ERROR_TITLE,
        message: strings.CONFIGURE_CONNECTION_ERROR_MESSAGE,
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePack = (packId: string) => {
    if (selectedPackIds.includes(packId)) {
      if (selectedPackIds.length > 1) {
        setSelectedPackIds(selectedPackIds.filter((id) => id !== packId));
      }
    } else {
      setSelectedPackIds([...selectedPackIds, packId]);
    }
  };

  const toggleExamples = (packId: string) => {
    setExpandedPackId((current) => (current === packId ? null : packId));
  };

  const handleAuthorize = async () => {
    if (gameStatus !== 'LOBBY') {
      // Defense in depth: never write status/mode-reverting fields once the
      // loaded doc is known to be non-LOBBY, even if the render guard above
      // were somehow bypassed (e.g. a stale status flip mid-visit).
      router.replace(`/game/${gameId}`);
      return;
    }

    if (selectedPackIds.length === 0) {
      showAlert({
        title: strings.CONFIGURE_NO_PACKS_TITLE,
        message: strings.CONFIGURE_NO_PACKS_MESSAGE,
      });
      return;
    }

    const resolvedKillGoal = customKillGoal
      ? Math.min(
          INFINITE_KILL_GOAL_MAX,
          Math.max(INFINITE_KILL_GOAL_MIN, parseInt(customKillGoal, 10) || killGoal),
        )
      : killGoal;

    setSaving(true);
    try {
      const gameRef = doc(db, 'games', gameId!);
      await updateDoc(gameRef, {
        selectedPacks: selectedPackIds,
        difficultySetting: difficulty,
        maxRerolls,
        status: 'LOBBY',
        mode: gameMode === 'infinite' ? 'INFINITE' : 'CLASSIC',
        ...(gameMode === 'infinite'
          ? {
              infiniteConfig: {
                endCondition: { type: 'KILL_GOAL', value: resolvedKillGoal },
              },
            }
          : { infiniteConfig: deleteField() }),
      });

      router.replace(`/game/${gameId}`);
    } catch (error) {
      if (__DEV__) console.error('Failed to save configuration:', error);
      showAlert({
        title: strings.CONFIGURE_SAVE_FAILED_TITLE,
        message: strings.CONFIGURE_SAVE_FAILED_MESSAGE,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || redirecting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text variant="bodySmall" muted>
            {strings.CONFIGURE_LOADING}
          </Text>
        </View>
        <StatusBar style="dark" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, contentStyle]}>
        <ScreenHeader
          eyebrow={dynamicStrings.operationSubtitle(gameId!)}
          title={strings.CONFIGURE_HEADER_TITLE}
        />

        <Stack gap={8}>
          <View>
            <Text variant="label" muted style={styles.sectionLabel}>
              {strings.CONFIGURE_TASK_PACKS_LABEL}
            </Text>
            <Text variant="bodySmall" muted style={styles.sectionHint}>
              {strings.CONFIGURE_TASK_PACKS_HINT}
            </Text>
            <Stack gap={3}>
              {packs.map((pack) => (
                <TaskPackCard
                  key={pack.id}
                  pack={pack}
                  selected={selectedPackIds.includes(pack.id)}
                  expanded={expandedPackId === pack.id}
                  onToggleSelect={() => togglePack(pack.id)}
                  onToggleExamples={() => toggleExamples(pack.id)}
                />
              ))}
            </Stack>
          </View>

          <View>
            <Text variant="label" muted style={styles.sectionLabel}>
              {strings.CONFIGURE_MODE_LABEL}
            </Text>
            <SegmentChips
              value={gameMode}
              onChange={setGameMode}
              options={[
                {
                  value: 'elimination',
                  label: strings.CONFIGURE_MODE_ELIMINATION,
                  sublabel: strings.CONFIGURE_MODE_ELIMINATION_SUB,
                },
                {
                  value: 'infinite',
                  label: strings.CONFIGURE_MODE_INFINITE,
                  sublabel: strings.CONFIGURE_MODE_INFINITE_SUB,
                },
              ]}
            />
          </View>

          {gameMode === 'infinite' ? (
            <View>
              <Text variant="label" muted style={styles.sectionLabel}>
                {strings.CONFIGURE_MISSION_SUCCESS_LABEL}
              </Text>
              <Text variant="bodySmall" muted style={styles.sectionHint}>
                {strings.CONFIGURE_MISSION_SUCCESS_HINT}
              </Text>
              <PillSegments
                value={
                  customKillGoal ||
                  !INFINITE_KILL_GOAL_OPTIONS.includes(killGoal as (typeof INFINITE_KILL_GOAL_OPTIONS)[number])
                    ? 'custom'
                    : String(killGoal)
                }
                onChange={(v) => {
                  if (v === 'custom') {
                    setCustomKillGoal(String(killGoal));
                    return;
                  }
                  setCustomKillGoal('');
                  setKillGoal(Number(v));
                }}
                options={[
                  ...INFINITE_KILL_GOAL_OPTIONS.map((n) => ({ value: String(n), label: String(n) })),
                  { value: 'custom', label: 'Custom' },
                ]}
              />
              {customKillGoal !== '' || !INFINITE_KILL_GOAL_OPTIONS.includes(killGoal as (typeof INFINITE_KILL_GOAL_OPTIONS)[number]) ? (
                <Input
                  value={customKillGoal || String(killGoal)}
                  onChangeText={(text) => {
                    setCustomKillGoal(text);
                    const parsed = parseInt(text, 10);
                    if (!Number.isNaN(parsed)) setKillGoal(parsed);
                  }}
                  keyboardType="number-pad"
                  placeholder={`${INFINITE_KILL_GOAL_MIN}-${INFINITE_KILL_GOAL_MAX}`}
                  style={styles.customGoalInput}
                />
              ) : null}
            </View>
          ) : null}

          <View>
            <Text variant="label" muted style={styles.sectionLabel}>
              {strings.CONFIGURE_DIFFICULTY_LABEL}
            </Text>
            <Text variant="bodySmall" muted style={styles.sectionHint}>
              {strings.CONFIGURE_DIFFICULTY_HINT}
            </Text>
            <PillSegments
              value={difficulty}
              onChange={(v) => setDifficulty(v as DifficultySetting)}
              options={DIFFICULTY_OPTIONS.map((d) => ({
                value: d,
                label: d === 'Medium' ? 'Med' : d,
              }))}
            />
          </View>

          <View>
            <Text variant="label" muted style={styles.sectionLabel}>
              {strings.CONFIGURE_OBJECTIVE_SWAPS_LABEL}
            </Text>
            <Text variant="bodySmall" muted style={styles.sectionHint}>
              {strings.CONFIGURE_OBJECTIVE_SWAPS_HINT}
            </Text>
            <PillSegments
              value={String(maxRerolls)}
              onChange={(v) => setMaxRerolls(Number(v))}
              options={[1, 3, 5, 10].map((n) => ({ value: String(n), label: String(n) }))}
            />
          </View>

          <Button title={strings.CONFIGURE_AUTHORIZE_BUTTON} onPress={handleAuthorize} loading={saving} fullWidth />

          <Pressable onPress={() => router.replace(`/game/${gameId}`)} style={styles.backLink}>
            <Text variant="bodySmall" muted>
              {strings.CONFIGURE_BACK_TO_LOBBY}
            </Text>
          </Pressable>
        </Stack>
      </ScrollView>

      <StatusBar style="dark" />
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: space[9],
    paddingTop: space[7],
    paddingBottom: space[14],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionLabel: {
    marginBottom: space[2],
  },
  sectionHint: {
    marginBottom: space[4],
    lineHeight: 20,
  },
  packCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  packCardSelected: {
    backgroundColor: colors.accentTint,
    borderColor: colors.accent,
    borderWidth: 2,
  },
  packMain: {
    paddingVertical: space[6],
    paddingHorizontal: space[6],
  },
  packName: {
    flex: 1,
  },
  packDescription: {
    marginTop: space[3],
    lineHeight: 20,
  },
  packDivider: {
    marginVertical: 0,
  },
  examplesToggle: {
    paddingVertical: space[4],
    paddingHorizontal: space[6],
  },
  examplesList: {
    paddingHorizontal: space[6],
    paddingBottom: space[6],
    gap: space[3],
  },
  exampleTask: {
    lineHeight: 20,
  },
  backLink: {
    alignSelf: 'flex-start',
    paddingVertical: space[4],
  },
  customGoalInput: {
    marginTop: space[4],
  },
});
