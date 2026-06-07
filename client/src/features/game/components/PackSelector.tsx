import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { TaskPack } from '../../../types/taskPack';
import { theme } from '../../../theme';
import { strings, dynamicStrings } from '../../../strings';

interface PackSelectorProps {
  packs: TaskPack[];
  selectedPackIds: string[];
  onSelectionChange: (packIds: string[]) => void;
}

export const PackSelector = ({ packs, selectedPackIds, onSelectionChange }: PackSelectorProps) => {
  const [previewPack, setPreviewPack] = useState<TaskPack | null>(null);

  const togglePack = (packId: string) => {
    if (selectedPackIds.includes(packId)) {
      // Don't allow deselecting if it's the only one
      if (selectedPackIds.length > 1) {
        onSelectionChange(selectedPackIds.filter(id => id !== packId));
      }
    } else {
      onSelectionChange([...selectedPackIds, packId]);
    }
  };

  const handleLongPress = (pack: TaskPack) => {
    setPreviewPack(pack);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{strings.PACK_SELECT_THEME}</Text>
      <Text style={styles.hint}>{strings.PACK_HINT}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {packs.map((pack) => {
          const isSelected = selectedPackIds.includes(pack.id);
          
          return (
            <TouchableOpacity
              key={pack.id}
              style={[
                styles.folder,
                isSelected && styles.folderSelected,
              ]}
              onPress={() => togglePack(pack.id)}
              onLongPress={() => handleLongPress(pack)}
              activeOpacity={0.8}
            >
              {/* Folder tab */}
              <View style={[styles.folderTab, isSelected && styles.folderTabSelected]}>
                <Text style={styles.folderTabText}>
                  {pack.displayName.substring(0, 8).toUpperCase()}
                </Text>
              </View>
              
              {/* Folder body */}
              <View style={styles.folderBody}>
                <Text style={styles.packName}>{pack.displayName}</Text>
                <Text style={styles.packDifficulty}>{pack.difficulty}</Text>
                <Text style={styles.packCount}>{dynamicStrings.packTasksCount(pack.tasks.length)}</Text>
                
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkText}>✓</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Preview Modal */}
      <Modal
        visible={previewPack !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewPack(null)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setPreviewPack(null)}
        >
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{previewPack?.displayName}</Text>
            <Text style={styles.previewDescription}>{previewPack?.description}</Text>
            
            <View style={styles.previewDivider} />
            
            <Text style={styles.previewSampleLabel}>{strings.PACK_SAMPLE_TASKS}</Text>
            {previewPack?.tasks.slice(0, 3).map((task, index) => (
              <Text key={task.id} style={styles.previewTask}>
                • {task.text}
              </Text>
            ))}
            
            <Text style={styles.previewTapHint}>{strings.PACK_TAP_TO_CLOSE}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  hint: {
    color: theme.colors.secondary,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingRight: theme.spacing.lg,
    gap: 12,
  },
  folder: {
    width: 130,
    height: 150,
    position: 'relative',
  },
  folderSelected: {},
  folderTab: {
    position: 'absolute',
    top: 0,
    left: 10,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    zIndex: 1,
  },
  folderTabSelected: {
    backgroundColor: theme.colors.surface, // Keep manila when selected
  },
  folderTabText: {
    color: theme.colors.background,
    fontSize: 9,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  folderBody: {
    position: 'absolute',
    top: 18,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 6,
    borderTopLeftRadius: 0,
    padding: 14,
    paddingTop: 18,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  packName: {
    color: theme.colors.background,
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  packDifficulty: {
    color: theme.colors.secondary,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.sans,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  packCount: {
    color: theme.colors.background,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.mono,
    opacity: 0.7,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Preview Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.darkOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  previewTitle: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.serif,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  previewDescription: {
    color: theme.colors.secondary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.mono,
    lineHeight: 20,
  },
  previewDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  previewSampleLabel: {
    color: theme.colors.background,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
  },
  previewTask: {
    color: theme.colors.background,
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.mono,
    lineHeight: 22,
    opacity: 0.9,
  },
  previewTapHint: {
    color: theme.colors.secondary,
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.mono,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    fontStyle: 'italic',
  },
});
