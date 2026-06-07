import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/services/firebase';
import { Button } from '../../src/components/Button';
import { PackSelector } from '../../src/features/game/components/PackSelector';
import { fetchTaskPacks } from '../../src/features/tasks/taskService';
import { TaskPack, DifficultySetting } from '../../src/types/taskPack';
import { theme } from '../../src/theme';
import { useAlert } from '../../src/hooks/useAlert';
import { strings, dynamicStrings } from '../../src/strings';

const DIFFICULTY_OPTIONS: DifficultySetting[] = ['Mixed', 'Easy', 'Medium', 'Hard'];

export default function ConfigureScreen() {
  const router = useRouter();
  const { id: gameId } = useLocalSearchParams<{ id: string }>();
  const { showAlert, AlertComponent } = useAlert();
  
  const [packs, setPacks] = useState<TaskPack[]>([]);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>(['basic_training']);
  const [difficulty, setDifficulty] = useState<DifficultySetting>('Mixed');
  const [maxRerolls, setMaxRerolls] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      // Fetch all available packs from Firestore
      const availablePacks = await fetchTaskPacks();
      setPacks(availablePacks);
      
      // Default to basic_training if available
      if (availablePacks.some(p => p.id === 'basic_training')) {
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

  const handleAuthorize = async () => {
    if (selectedPackIds.length === 0) {
      showAlert({
        title: strings.CONFIGURE_NO_PACKS_TITLE,
        message: strings.CONFIGURE_NO_PACKS_MESSAGE,
      });
      return;
    }

    setSaving(true);
    try {
      // Save configuration to game document
      const gameRef = doc(db, 'games', gameId!);
      await updateDoc(gameRef, {
        selectedPacks: selectedPackIds,
        difficultySetting: difficulty,
        maxRerolls: maxRerolls,
        status: 'LOBBY', // Move to LOBBY after configuration
      });
      
      // Navigate to the game room
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

  const handleBack = () => {
    router.replace('/game/lobby');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{strings.CONFIGURE_LOADING}</Text>
        </View>
        <StatusBar style="light" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{strings.CONFIGURE_HEADER_TITLE}</Text>
          <Text style={styles.subtitle}>{dynamicStrings.operationSubtitle(gameId!)}</Text>
        </View>

        {/* Pack Selector */}
        <PackSelector
          packs={packs}
          selectedPackIds={selectedPackIds}
          onSelectionChange={setSelectedPackIds}
        />

        {/* Difficulty Selector */}
        <View style={styles.difficultySection}>
          <Text style={styles.label}>{strings.CONFIGURE_DIFFICULTY_LABEL}</Text>
          <View style={styles.difficultyToggle}>
            {DIFFICULTY_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.difficultyOption,
                  difficulty === option && styles.difficultyOptionActive,
                ]}
                onPress={() => setDifficulty(option)}
              >
                <Text style={[
                  styles.difficultyText,
                  difficulty === option && styles.difficultyTextActive,
                ]}>
                  {option.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reroll Selector */}
        <View style={styles.difficultySection}>
          <Text style={styles.label}>{strings.CONFIGURE_REROLLS_LABEL}</Text>
          <View style={styles.difficultyToggle}>
            {[1, 3, 5, 10].map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.difficultyOption,
                  maxRerolls === option && styles.difficultyOptionActive,
                ]}
                onPress={() => setMaxRerolls(option)}
              >
                <Text style={[
                  styles.difficultyText,
                  maxRerolls === option && styles.difficultyTextActive,
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title={strings.CONFIGURE_AUTHORIZE_BUTTON}
            onPress={handleAuthorize}
            loading={saving}
          />
        </View>

        {/* Back Link */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>{strings.CONFIGURE_CANCEL_OPERATION}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <StatusBar style="light" />
      {AlertComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    color: theme.colors.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.mono,
    letterSpacing: 2,
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  difficultySection: {
    marginBottom: theme.spacing.xl,
  },
  difficultyToggle: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceFaint,
    borderRadius: 4,
    padding: 4,
  },
  difficultyOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 2,
  },
  difficultyOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  difficultyText: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  difficultyTextActive: {
    color: theme.colors.background,
  },
  actions: {
    marginBottom: theme.spacing.lg,
  },
  bottomNav: {
    paddingTop: theme.spacing.lg,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: theme.spacing.md,
  },
  backText: {
    color: theme.colors.surfaceMuted,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.mono,
  },
});
