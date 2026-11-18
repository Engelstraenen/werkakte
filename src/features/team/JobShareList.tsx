import { useState } from 'react';
import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CURRENT_MEMBER_ID, company } from '@/features/demo/data';
import { de } from '@/i18n/de';
import { spacing, useColors } from '@/theme';

import { jobs } from './data';
import { jobMessage, shareText } from './share';
import { useTeam } from './store';

const t = de.team;

/** Offene Stellen mit „Teilen“: persönlicher Link per WhatsApp & Co. */
export function JobShareList() {
  const colors = useColors();
  const countShare = useTeam((s) => s.countShare);
  const [sharedId, setSharedId] = useState<string>();
  const share = async (id: string) => {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    await shareText(jobMessage(job, CURRENT_MEMBER_ID, company.name));
    countShare(CURRENT_MEMBER_ID);
    setSharedId(id);
  };
  return (
    <View style={{ gap: spacing.sm + 4 }}>
      <AppText muted>{t.stellenHinweis}</AppText>
      {jobs
        .filter((j) => j.open)
        .map((j) => (
          <Card key={j.id} style={{ gap: spacing.sm }}>
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}
            >
              <AppText variant="title" style={{ flex: 1 }}>
                {j.title}
              </AppText>
              <AppText variant="label" color={colors.primary}>
                {j.salary}
              </AppText>
            </View>
            <AppText muted>{j.hours}</AppText>
            <Button
              title={sharedId === j.id ? t.linkGeteilt : t.teilen}
              onPress={() => share(j.id)}
            />
          </Card>
        ))}
    </View>
  );
}
