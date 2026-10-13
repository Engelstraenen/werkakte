import { View } from 'react-native';

import { AppText } from '@/components/AppText';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { isOwner, memberById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { formatRelative } from '@/lib/date';
import { spacing, type Tone } from '@/theme';

const t = de.material;
const tone: Record<string, Tone> = { offen: 'warning', bestellt: 'info', erledigt: 'success' };

/** Materialanfragen des Projekts. Inhaber/Einkauf haken ab: bestellt → angekommen. */
export function MaterialList({ projectId }: { projectId: string }) {
  const { materialRequests, setMaterialStatus } = useDemo();
  const list = materialRequests.filter((r) => r.projectId === projectId);
  if (!list.length) return <EmptyState icon="cube-outline" text={de.akte.keinMaterial} />;

  return list.map((r) => (
    <Card key={r.id}>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
        <Badge
          label={t.status[r.status]}
          tone={r.urgent && r.status === 'offen' ? 'danger' : tone[r.status]}
        />
        {r.urgent && r.status === 'offen' ? <Badge label={t.dringend} tone="danger" /> : null}
      </View>
      <AppText variant="label">
        {r.text} · {r.quantity}
      </AppText>
      <AppText variant="small" muted>
        {t.von(memberById(r.memberId).name, formatRelative(r.createdAt))}
      </AppText>
      {isOwner() && r.status === 'offen' ? (
        <Button
          title={t.bestellt}
          variant="secondary"
          onPress={() => setMaterialStatus(r.id, 'bestellt')}
        />
      ) : null}
      {r.status === 'bestellt' ? (
        <Button
          title={t.da}
          variant="secondary"
          onPress={() => setMaterialStatus(r.id, 'erledigt')}
        />
      ) : null}
    </Card>
  ));
}
