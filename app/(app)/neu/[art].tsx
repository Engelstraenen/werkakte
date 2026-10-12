import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chips } from '@/components/Chips';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useDemo } from '@/features/demo/store';
import type { MediaTag } from '@/features/demo/types';
import { NewProjectForm } from '@/features/quick-actions/NewProjectForm';
import { ProjectPicker } from '@/features/quick-actions/ProjectPicker';
import { de } from '@/i18n/de';
import { spacing } from '@/theme';

export type Art = 'projekt' | 'notiz' | 'foto' | 'angebot' | 'zeit';
const t = de.neu;
const tags: MediaTag[] = ['vorher', 'nachher', 'mangel', 'sonstiges'];

export default function NeuScreen() {
  const params = useLocalSearchParams<{ art: Art; projectId?: string; fromQuoteId?: string }>();
  const [projectId, setProjectId] = useState(params.projectId);
  const [text, setText] = useState('');
  const [tag, setTag] = useState<MediaTag>('sonstiges');
  const [error, setError] = useState<string>();
  const { addNote, addPhoto, addQuote, duplicateQuote, startTimer } = useDemo();
  const from = params.fromQuoteId;
  const art = params.art;
  const done = useRef(false);

  // Angebot und Zeit brauchen nach der Projektwahl keine weiteren Eingaben.
  useEffect(() => {
    // Ref verhindert doppeltes Anlegen (StrictMode führt Effekte in der Entwicklung zweimal aus).
    if (!projectId || done.current) return;
    if (art === 'angebot' || art === 'zeit') done.current = true;
    if (art === 'angebot')
      router.replace({
        pathname: '/beleg/[id]',
        params: { id: from ? duplicateQuote(from, projectId) : addQuote(projectId) },
      });
    if (art === 'zeit') {
      startTimer(projectId);
      router.back();
    }
  }, [art, projectId, from, addQuote, duplicateQuote, startTimer]);

  const openProject = (tab: string) =>
    router.replace({ pathname: '/projekt/[id]', params: { id: projectId!, tab } });

  function save() {
    if (art === 'notiz') {
      if (!text.trim()) return setError(t.pflicht);
      addNote(projectId!, text.trim());
      openProject('notizen');
    } else {
      addPhoto(projectId!, tag, text.trim() || de.tag[tag]);
      openProject('fotos');
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: from ? t.vorlage : t[art] }} />
      {art === 'projekt' ? (
        <NewProjectForm />
      ) : !projectId ? (
        <>
          <AppText variant="title">{t.welchesProjekt}</AppText>
          <ProjectPicker onPick={setProjectId} onlyMine={art === 'zeit'} />
        </>
      ) : art === 'notiz' || art === 'foto' ? (
        <>
          {art === 'foto' ? (
            <View style={{ gap: spacing.xs }}>
              <AppText muted>{t.fotoHinweis}</AppText>
              <AppText variant="label">{t.fotoArt}</AppText>
              <Chips
                options={tags.map((x) => ({ value: x, label: de.tag[x] }))}
                value={tag}
                onChange={setTag}
                segmented
              />
            </View>
          ) : null}
          <TextField
            label={t.notizFeld}
            placeholder={t.notizBeispiel}
            value={text}
            onChangeText={setText}
            error={error}
            multiline
            style={{ minHeight: 140, textAlignVertical: 'top', paddingTop: spacing.md }}
            autoFocus={art === 'notiz'}
          />
          <Button title={t.speichern} onPress={save} />
        </>
      ) : null}
    </Screen>
  );
}
