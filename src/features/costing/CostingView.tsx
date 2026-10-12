import { router } from 'expo-router';
import { View } from 'react-native';

import { projectCosting, type Costing } from './costing';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { company } from '@/features/demo/data';
import { memberById, supplierById } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { marginTone } from '@/lib/calc';
import { formatDate } from '@/lib/date';
import { formatEuro } from '@/lib/money';
import { spacing, useColors } from '@/theme';

const t = de.kalk;
const h = (min: number) => `${Math.round(min / 6) / 10} Std.`;

function Row({
  label,
  soll,
  ist,
  strong,
}: {
  label: string;
  soll?: string;
  ist?: string;
  strong?: boolean;
}) {
  const v = strong ? 'label' : 'body';
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, paddingVertical: 4 }}>
      <AppText variant={v} muted={!strong} style={{ flex: 1.4 }}>
        {label}
      </AppText>
      <AppText variant={v} style={{ flex: 1, textAlign: 'right' }}>
        {soll ?? '–'}
      </AppText>
      <AppText variant={v} style={{ flex: 1, textAlign: 'right' }}>
        {ist ?? '–'}
      </AppText>
    </View>
  );
}

function Result({ costing, running }: { costing: Costing; running: boolean }) {
  const colors = useColors();
  const b = costing.breakdown;
  const tone = marginTone(b.marginPercent);
  return (
    <Card accent={colors[tone]}>
      <AppText variant="small" muted>
        {t.gewinn} · {running ? t.bisher : t.ist}
      </AppText>
      <AppText variant="display" color={colors[tone]}>
        {formatEuro(b.profitCents)}
      </AppText>
      <AppText variant="label" color={colors[tone]}>
        {b.marginPercent.toLocaleString('de-DE')} % vom Erlös
      </AppText>
    </Card>
  );
}

export function CostingView({ projectId }: { projectId: string }) {
  const { quotes, supplierPrices, projectCosts, projects } = useDemo();
  const project = projects.find((p) => p.id === projectId)!;
  const { soll, ist } = projectCosting(projectId, quotes, supplierPrices, projectCosts);
  const own = projectCosts.filter((c) => c.projectId === projectId);
  const running = project.status !== 'abgeschlossen' && project.status !== 'bezahlt';
  const pct = (m?: number) => (m === undefined ? undefined : `${m.toLocaleString('de-DE')} %`);
  const add = (kind: 'material' | 'stunden') =>
    router.push({ pathname: '/kosten-neu', params: { projectId, kind } });
  const diffH = soll && ist ? Math.round((ist.minutes - soll.minutes) / 60) : 0;

  return (
    <>
      <AppText variant="small" muted>
        🔒 {t.nurInhaber}
      </AppText>
      {ist ? <Result costing={ist} running={running} /> : null}
      {!ist && soll ? <Result costing={soll} running={false} /> : null}

      <Card>
        <Row label={t.posten} soll={t.soll} ist={t.ist} strong />
        <Row
          label={t.erloes}
          soll={soll && formatEuro(soll.breakdown.revenueCents)}
          ist={ist && formatEuro(ist.breakdown.revenueCents)}
        />
        <Row
          label={t.material}
          soll={soll && formatEuro(soll.breakdown.materialCents)}
          ist={ist && formatEuro(ist.breakdown.materialCents)}
        />
        <Row
          label={t.lohn}
          soll={soll && formatEuro(soll.breakdown.laborCents)}
          ist={ist && formatEuro(ist.breakdown.laborCents)}
        />
        <Row
          label={t.betrieb(company.overheadPercent)}
          soll={soll && formatEuro(soll.breakdown.overheadCents)}
          ist={ist && formatEuro(ist.breakdown.overheadCents)}
        />
        <Row
          label={t.kosten}
          soll={soll && formatEuro(soll.breakdown.costCents)}
          ist={ist && formatEuro(ist.breakdown.costCents)}
          strong
        />
        <Row
          label={t.gewinn}
          soll={soll && formatEuro(soll.breakdown.profitCents)}
          ist={ist && formatEuro(ist.breakdown.profitCents)}
          strong
        />
        <Row
          label={t.marge}
          soll={pct(soll?.breakdown.marginPercent)}
          ist={pct(ist?.breakdown.marginPercent)}
        />
        <Row label={t.stunden} soll={soll && h(soll.minutes)} ist={ist && h(ist.minutes)} />
        {diffH !== 0 ? (
          <AppText variant="label" style={{ marginTop: spacing.xs }}>
            {diffH > 0 ? `⚠️ ${t.mehrStunden(diffH)}` : `✅ ${t.wenigerStunden(-diffH)}`}
          </AppText>
        ) : null}
        <AppText variant="small" muted style={{ marginTop: spacing.xs }}>
          {t.hinweis}
        </AppText>
      </Card>

      {!soll ? <AppText muted>{t.keinSoll}</AppText> : null}
      {!ist ? <AppText muted>{t.keinIst}</AppText> : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button title={t.materialEintragen} onPress={() => add('material')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={t.stundenEintragen} onPress={() => add('stunden')} />
        </View>
      </View>

      {own.length ? (
        <Card style={{ paddingVertical: 4 }}>
          <AppText variant="small" muted style={{ paddingTop: spacing.sm }}>
            {t.erfasst}
          </AppText>
          {own.map((c, i) => (
            <ListRow
              key={c.id}
              divider={i > 0}
              left={
                <IconCircle
                  name={c.kind === 'material' ? 'cube' : 'time'}
                  tone={c.kind === 'material' ? 'info' : 'primary'}
                  size={36}
                />
              }
              title={c.kind === 'material' ? c.text : memberById(c.memberId).name}
              subtitle={`${formatDate(c.date)}${c.kind === 'material' && c.supplierId ? ` · ${supplierById(c.supplierId).name}` : ''}`}
              right={
                <AppText variant="label">
                  {c.kind === 'material' ? formatEuro(c.amountCents) : h(c.minutes)}
                </AppText>
              }
            />
          ))}
        </Card>
      ) : null}
    </>
  );
}
