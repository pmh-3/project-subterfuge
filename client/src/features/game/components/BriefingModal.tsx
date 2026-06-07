import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../../../theme';
import { Button } from '../../../components/Button';
import { strings } from '../../../strings';

interface BriefingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BriefingModal = ({ visible, onClose }: BriefingModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Folder Tab */}
          <View style={styles.folderTab}>
            <Text style={styles.tabText}>{strings.BRIEFING_TAB}</Text>
          </View>

          <View style={styles.folder}>
            {/* Close X Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.title}>{strings.BRIEFING_TITLE}</Text>
              <Text style={styles.subtitle}>{strings.PROTOCOL_NAME}</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.section}>
                <View style={styles.step}>
                  <Text style={styles.stepNum}>1.</Text>
                  <Text style={styles.text}>{strings.BRIEFING_STEP_1}</Text>
                </View>
                <View style={styles.step}>
                  <Text style={styles.stepNum}>2.</Text>
                  <Text style={styles.text}>{strings.BRIEFING_STEP_2}</Text>
                </View>
                <View style={styles.step}>
                  <Text style={styles.stepNum}>3.</Text>
                  <Text style={styles.text}>{strings.BRIEFING_STEP_3}</Text>
                </View>
                <View style={styles.step}>
                  <Text style={styles.stepNum}>4.</Text>
                  <Text style={styles.text}>{strings.BRIEFING_STEP_4}</Text>
                </View>
                <View style={styles.step}>
                  <Text style={styles.stepNum}>5.</Text>
                  <Text style={styles.text}>{strings.BRIEFING_STEP_5}</Text>
                </View>
              </View>
            </ScrollView>

            <Button title={strings.BRIEFING_ACKNOWLEDGE} onPress={onClose} style={styles.button} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 60,
  },
  container: {
    flex: 1,
    marginBottom: 20,
  },
  folderTab: {
    backgroundColor: theme.colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: -1,
    zIndex: 1,
  },
  tabText: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.sans,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  folder: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 2,
    borderTopLeftRadius: 0,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeText: {
    color: theme.colors.secondary,
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.sans,
    fontWeight: 'bold',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.text,
    paddingBottom: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.serif,
    color: theme.colors.text,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.secondary,
    letterSpacing: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  text: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text,
    lineHeight: 22,
    flex: 1,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepNum: {
    width: 24,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
  }
});
