import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  ABSCHLAG_PROZENT,
  ABSCHLAG_STUFEN,
  abschlagCents,
  invoiceOptions,
  type InvoiceKind,
} from './build';
import { AddButton } from '@/components/AddButton';
import { AppText } from '@/components/AppText';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { IconCircle } from '@/components/IconCircle';
import { ListRow } from '@/components/ListRow';
import { useStamm } from '@/features/demo/stamm';
import { useDemo } from '@/features/demo/store';
import { de } from '@/i18n/de';
import { formatDate } from '@/lib/date';
import { formatEuro } from '@/lib/money';
import { radius, spacing, touch, useColors } from '@/theme';

const t = de.rechnung;

/**
 * Rechnung mit Hilfe: 1. Kunde (oder neu per Plus) → 2. Auftrag (oder neuer) → 3. Art der Rechnung,
 * die App empfiehlt die passende (Abschlag vorab / Schluss / Gesamt). Ergebnis: Entwurf öffnen.
 */
export function RechnungStart({ projectId: fixedProject }: { projectId?: string }) {
  const colors = useColors();
  const customers = useStamm((s) => s.customers);
  const projects = useDemo((s) => s.projects);
  const quotes = useDemo((s) => s.quotes);
  const invoices = useDemo((s) => s.invoices);
  const addProject = useDemo((s) => s.addProject);
  const addInvoice = useDemo((s) => s.addInvoice);
  const [customerId, setCustomerId] = useState<string>();
  const [projectId, setProjectId] = useState(fixedProject);
  const [percent, setPercent] = useState<number>(ABSCHLAG_PROZENT);

  // Neu angelegten Kunden (Plus) sofort übernehmen.
  const known = useRef(new Set(customers.map((c) => c.id)));
  useEffect(() => {
    const fresh = customers.find((c) => !known.current.has(c.id));
    customers.forEach((c) => known.current.add(c.id));
    if (fresh) setCustomerId(fresh.id);
  }, [customers]);

  const create = (kind: InvoiceKind) =>
    router.replace({
      pathname: '/beleg/[id]',
      params: { id: addInvoice(projectId!, kind, percent) },
    });

  if (projectId) {
    const projectQuotes = quotes.filter((q) => q.projectId === projectId);
    const options = invoiceOptions(
      projectQuotes,
      invoices.filter((i) => i.projectId === projectId),
    ).map((o) =>
      o.kind === 'abschlag' ? { ...o, cents: abschlagCents(projectQuotes, percent) } : o,
    );
    const hasQuote = options.some((o) => o.cents > 0);
    const why = options.some((o) => o.kind === 'schluss')
      ? t.warumSchluss
      : !hasQuote
        ? t.warumOhne
        : options[0]!.recommended
          ? t.warumGross
          : t.warumKlein;
    const text = (kind: InvoiceKind, cents: number) =>
      kind === 'abschlag'
        ? cents
          ? t.abschlagText(formatEuro(cents), percent)
          : t.abschlagFrei
        : kind === 'schluss'
          ? t.schlussText(formatEuro(cents))
          : hasQuote
            ? t.einzelText(formatEuro(cents))
            : t.einzelFrei;
    return (
      <>
        <AppText variant="title">{t.artFrage}</AppText>
        <AppText muted>{why}</AppText>
        {options.map((o) => (
          <Pressable
            key={o.kind}
            accessibilityRole="button"
            onPress={() => create(o.kind)}
            style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
          >
            <Card
              style={{
                gap: spacing.sm,
                borderWidth: 2,
                borderColor: o.recommended ? colors.primary : colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <IconCircle
                  name={o.kind === 'abschlag' ? 'cube' : o.kind === 'schluss' ? 'flag' : 'receipt'}
                  tone={o.recommended ? 'primary' : 'neutral'}
                  size={40}
                />
                <AppText variant="title" style={{ flex: 1 }}>
                  {t[o.kind]}
                </AppText>
                {o.recommended ? <Badge label={t.empfohlen} tone="info" /> : null}
              </View>
              <AppText muted>{text(o.kind, o.cents)}</AppText>
              {o.kind === 'abschlag' && hasQuote ? (
                <View style={{ gap: spacing.xs }}>
                  <AppText variant="small" muted>
                    {t.wieviel}
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                    {ABSCHLAG_STUFEN.map((p) => {
                      const on = p === percent;
                      return (
                        <Pressable
                          key={p}
                          accessibilityRole="radio"
                          accessibilityState={{ selected: on }}
                          onPress={() => setPercent(p)}
                          style={{
                            flex: 1,
                            minHeight: touch.min,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: radius.md,
                            borderWidth: 2,
                            borderColor: on ? colors.primary : colors.border,
                            backgroundColor: on ? colors.primary : 'transparent',
                          }}
                        >
                          <AppText variant="label" color={on ? colors.onPrimary : colors.text}>
                            {p} %
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </Card>
          </Pressable>
        ))}
      </>
    );
  }

  if (customerId) {
    const customer = customers.find((c) => c.id === customerId)!;
    const open = projects
      .filter((p) => p.customerId === customerId && p.status !== 'bezahlt')
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const newJob = () =>
      setProjectId(
        addProject({
          title: t.auftragTitel(formatDate(new Date().toISOString())),
          customerId,
          street: customer.street,
          zipCity: customer.zipCity,
        }),
      );
    return (
      <>
        <AppText variant="title">{t.auftragFrage(customer.name)}</AppText>
        <Card style={{ paddingVertical: 4 }}>
          <ListRow
            title={t.neuerAuftrag}
            left={<IconCircle name="add" size={40} />}
            onPress={newJob}
          />
          {open.map((p) => (
            <ListRow
              key={p.id}
              divider
              title={p.title}
              subtitle={`${p.street} · ${de.status[p.status]}`}
              left={<IconCircle name="folder-open" size={40} />}
              onPress={() => setProjectId(p.id)}
            />
          ))}
        </Card>
      </>
    );
  }

  return (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <AppText variant="title" style={{ flex: 1 }}>
          {t.kundeFrage}
        </AppText>
        <AddButton label={de.anlegen.kunde} onPress={() => router.push('/kunde')} />
      </View>
      <Card style={{ paddingVertical: 4 }}>
        {customers.map((c, i) => (
          <ListRow
            key={c.id}
            divider={i > 0}
            title={c.name}
            subtitle={`${c.street}, ${c.zipCity}`}
            left={<Avatar name={c.name} />}
            onPress={() => setCustomerId(c.id)}
          />
        ))}
      </Card>
    </>
  );
}
