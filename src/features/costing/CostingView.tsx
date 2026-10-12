import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { projectCosting } from './costing';
import { CostTable } from './CostTable';
import { MoneyBar } from './MoneyBar';
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
const hours = (min: number) => `${Math.round(min / 6) / 10} Std.`;

export function CostingView({ projectId }: { projectId: string }) {
  const colors = useColors();
  const { quotes, invoices, supplierPrices, projectCosts, projects } = useDemo();
  const [details, setDetails] = useState(false);
  const project = projects.find((p) => p.id === projectId)!;
  const { soll, ist } = projectCosting(projectId, quotes, invoices, supplierPrices, projectCosts);
  const own = projectCosts.filter((c) => c.projectId === projectId);
  const running = project.status !== 'abgeschlossen' && project.status !== 'bezahlt';
  const main = ist ?? soll;
  const tone = main ? colors[marginTone(main.breakdown.marginPercent)] : colors.neutral;
  const diffH = soll && ist ? Math.round((ist.minutes - soll.minutes) / 60) : 0;
  const add = (kind: 'material' | 'stunden') =>
    router.push({ pathname: '/kosten-neu', params: { projectId, kind } });

  return (
    <>
      <AppText variant="small" muted>
        🔒 {t.nurInhaber}
      </AppText>

      {main ? (
        <Card accent={tone}>
          <AppText variant="label" muted>
            {ist ? t.dirBleiben : t.dirBleibenVoraus}
          </AppText>
          <AppText variant="display" color={tone}>
            {formatEuro(main.breakdown.profitCents)}
          </AppText>
          <AppText variant="label" color={tone}>
            {t.vomAuftrag(main.breakdown.marginPercent.toLocaleString('de-DE'))}
          </AppText>
          {ist && soll ? (
            <AppText muted>{t.geplant(formatEuro(soll.breakdown.profitCents))}</AppText>
          ) : null}
          {diffH > 0 ? <AppText variant="label">⚠️ {t.mehrStunden(diffH)}</AppText> : null}
          {diffH < 0 ? <AppText variant="label">✅ {t.wenigerStunden(-diffH)}</AppText> : null}
          {ist && running ? (
            <AppText variant="small" muted>
              {t.laeuft}
            </AppText>
          ) : null}
          <View style={{ marginTop: spacing.sm, gap: spacing.xs }}>
            <AppText variant="small" muted>
              {t.wohin} ({t.einnahmen} {formatEuro(main.breakdown.revenueCents)})
            </AppText>
            <MoneyBar b={main.breakdown} />
            <AppText variant="small" muted>
              {t.fixkostenErklaerung(company.overheadPercent)}
            </AppText>
          </View>
        </Card>
      ) : (
        <Card>
          <AppText muted>{t.keinSoll}</AppText>
        </Card>
      )}

      {!ist ? <AppText muted>{t.keinIst}</AppText> : null}

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <Button
            title={t.plusMaterial}
            icon={<Ionicons name="add" size={22} color={colors.onPrimary} />}
            onPress={() => add('material')}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={t.plusStunden}
            icon={<Ionicons name="add" size={22} color={colors.onPrimary} />}
            onPress={() => add('stunden')}
          />
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
                  tone={c.kind === 'material' ? 'info' : 'warning'}
                  size={36}
                />
              }
              title={c.kind === 'material' ? c.text : memberById(c.memberId).name}
              subtitle={`${formatDate(c.date)}${c.kind === 'material' && c.supplierId ? ` · ${supplierById(c.supplierId).name}` : ''}`}
              right={
                <AppText variant="label">
                  {c.kind === 'material' ? formatEuro(c.amountCents) : hours(c.minutes)}
                </AppText>
              }
            />
          ))}
        </Card>
      ) : null}

      {soll || ist ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setDetails(!details)}
          style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
        >
          <Ionicons
            name={details ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.primary}
          />
          <AppText variant="label" color={colors.primary}>
            {details ? t.detailsZu : t.details}
          </AppText>
        </Pressable>
      ) : null}
      {details ? <CostTable soll={soll} ist={ist} /> : null}
    </>
  );
}
