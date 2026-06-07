import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button, Stack, Text, Sheet, GameCodeTag, space } from '@/design-system';
import { strings } from '@/strings';
import { InviteQrCode } from '@/features/game/components/InviteQrCode';

const MODAL_QR_SIZE = 200;

export interface InviteAgentsSheetProps {
  open: boolean;
  onClose: () => void;
  gameCode: string;
  inviteUrl: string;
  onCopyLink: () => void;
  onCopyCode: () => void;
  onShare: () => void;
}

export function InviteAgentsSheet({
  open,
  onClose,
  gameCode,
  inviteUrl,
  onCopyLink,
  onCopyCode,
  onShare,
}: InviteAgentsSheetProps) {
  const canNativeShare =
    Platform.OS !== 'web' || (typeof navigator !== 'undefined' && !!navigator.share);

  return (
    <Sheet open={open} onClose={onClose} contentStyle={styles.sheetContent}>
      <Stack gap={6}>
        <Text variant="title">{strings.GAME_INVITE_SHEET_TITLE}</Text>

        <View style={styles.qrRow}>
          <InviteQrCode value={inviteUrl} size={MODAL_QR_SIZE} />
        </View>

        <View style={styles.codeRow}>
          <GameCodeTag code={gameCode} label={strings.GAME_CODE_LABEL} />
        </View>

        <Stack gap={4}>
          <Button title={strings.GAME_INVITE_COPY_LINK} onPress={onCopyLink} fullWidth />
          <Button title={strings.GAME_INVITE_COPY_CODE} onPress={onCopyCode} variant="ghost" fullWidth />
          {canNativeShare ? (
            <Button title={strings.GAME_INVITE_SHARE} onPress={onShare} variant="ghost" fullWidth />
          ) : null}
        </Stack>
      </Stack>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    padding: space[8],
  },
  qrRow: {
    alignItems: 'center',
  },
  codeRow: {
    alignItems: 'center',
  },
});
