import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import {
  Text,
  Stack,
  Row,
  Rule,
  Divider,
  Card,
  Button,
  IconButton,
  Input,
  SegmentChips,
  PillSegments,
  HoldToConfirm,
  Avatar,
  Badge,
  AgentRow,
  ScreenHeader,
  NavBar,
  Alert,
  colors,
  space,
} from '@/design-system';
import { AVATARS } from '@/data/avatars';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Stack gap={4} style={styles.section}>
      <Text variant="labelLarge" muted>
        {title}
      </Text>
      <Rule />
      {children}
    </Stack>
  );
}

export function Gallery() {
  const [segment, setSegment] = useState('a');
  const [pill, setPill] = useState('mixed');
  const [nav, setNav] = useState('contract');
  const [alertOpen, setAlertOpen] = useState(false);
  const [avatarIdx, setAvatarIdx] = useState(0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text variant="displayHero">Midnight Wire</Text>
      <Text variant="labelLarge" muted style={styles.subtitle}>
        Design System Gallery
      </Text>

      <Section title="Typography">
        <Stack gap={3}>
          <Text variant="displayHero">Display Hero</Text>
          <Text variant="displayLarge">Display Large</Text>
          <Text variant="display">Display</Text>
          <Text variant="title">Title</Text>
          <Text variant="codeHero">968</Text>
          <Text variant="codeLarge">GGUC</Text>
          <Text variant="body">Body copy — directive text and briefing rules.</Text>
          <Text variant="bodySmall">Helper text under headlines.</Text>
          <Text variant="label">Label eyebrow</Text>
          <Text variant="labelMicro">Nav label</Text>
          <Text variant="metaMicro">Meta micro copy</Text>
          <Text accent>Accent text</Text>
          <Text muted>Muted text</Text>
        </Stack>
      </Section>

      <Section title="Buttons">
        <Stack gap={4}>
          <Button title="Join Operation" onPress={() => {}} fullWidth />
          <Button title="Start Operation" variant="ghost" onPress={() => {}} fullWidth />
          <Row gap={4}>
            <Button title="Small Primary" size="sm" onPress={() => {}} />
            <Button title="Small Ghost" variant="ghost" size="sm" onPress={() => {}} />
          </Row>
          <Button title="Show Alert" variant="ghost" onPress={() => setAlertOpen(true)} />
        </Stack>
      </Section>

      <Section title="Input">
        <Input label="Callsign" placeholder="dum dum" />
      </Section>

      <Section title="Cards">
        <Card>
          <Text variant="body">Standard dossier card on surface background.</Text>
        </Card>
        <Card folderTab="Contract" active>
          <Text variant="displayLarge">Target Name</Text>
          <Text variant="body" muted>
            Folder-tab variant for contract screen.
          </Text>
        </Card>
      </Section>

      <Section title="Segmented Controls">
        <SegmentChips
          options={[
            { value: 'a', label: 'Elimination', sublabel: 'Last wins' },
            { value: 'b', label: 'Infinite ∞', sublabel: 'Score attack' },
          ]}
          value={segment}
          onChange={setSegment}
        />
        <PillSegments
          options={[
            { value: 'easy', label: 'Easy' },
            { value: 'mixed', label: 'Mixed' },
            { value: 'hard', label: 'Hard' },
          ]}
          value={pill}
          onChange={setPill}
          mono
        />
      </Section>

      <Section title="Avatar & Badge">
        <Row gap={3}>
          {AVATARS.map((a, i) => (
            <IconButton
              key={a.id}
              accessibilityLabel={`Avatar ${a.id}`}
              onPress={() => setAvatarIdx(i)}
              style={avatarIdx === i ? styles.avatarSelected : undefined}
            >
              <Avatar avatarId={a.id} size={32} selected={avatarIdx === i} />
            </IconButton>
          ))}
        </Row>
        <Row gap={4}>
          <Badge label="HOST" />
          <Badge label="Confirmed" variant="accent" />
        </Row>
      </Section>

      <Section title="Agent Row">
        <AgentRow
          callsign="Nightfall"
          avatarId={AVATARS[0].id}
          subtitle="KEY 968"
          trailing={
            <>
              <Text variant="codeMedium">3</Text>
              <Text variant="labelMicro" muted>
                kills
              </Text>
            </>
          }
          isYou
          isHost
        />
        <AgentRow
          callsign="Shadow"
          avatarId={AVATARS[1].id}
          subtitle="KEY 412"
          trailing={
            <>
              <Text variant="codeMedium">1</Text>
              <Text variant="labelMicro" muted>
                kills
              </Text>
            </>
          }
        />
      </Section>

      <Section title="Screen Header">
        <ScreenHeader eyebrow="Op Code GGUC" title="Mission Control" />
      </Section>

      <Section title="Hold To Confirm">
        <HoldToConfirm onConfirm={() => {}} />
      </Section>

      <Section title="Layout">
        <Row gap={4}>
          <View style={styles.layoutBox}>
            <Text variant="labelMicro">Row</Text>
          </View>
          <Divider />
          <View style={styles.layoutBox}>
            <Text variant="labelMicro">Divider</Text>
          </View>
        </Row>
      </Section>

      <NavBar
        tabs={[
          { key: 'contract', label: 'Contract' },
          { key: 'situation', label: 'Situation' },
          { key: 'admin', label: 'Admin' },
          { key: 'briefing', label: 'Briefing' },
        ]}
        activeKey={nav}
        onTabPress={setNav}
      />

      <Alert
        open={alertOpen}
        title="Operation Failed"
        message="This is the design-system alert primitive."
        buttons={[
          { text: 'Cancel', style: 'cancel', onPress: () => setAlertOpen(false) },
          { text: 'Acknowledge', onPress: () => setAlertOpen(false) },
        ]}
        onDismiss={() => setAlertOpen(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: space[10],
    paddingTop: space[10],
    paddingBottom: space[14],
    gap: space[10],
  },
  subtitle: {
    marginBottom: space[8],
  },
  section: {
    marginBottom: space[8],
  },
  layoutBox: {
    flex: 1,
    padding: space[4],
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  avatarSelected: {
    borderColor: colors.accent,
  },
});
