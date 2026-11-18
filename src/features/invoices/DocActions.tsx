import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { company } from '@/features/demo/data';
import { customerOf } from '@/features/demo/selectors';
import { useDemo } from '@/features/demo/store';
import { invoiceChecks, missingRequired } from './checklist';
import type { Invoice, Quote } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { notice } from '@/lib/notice';
import { useColors } from '@/theme';

const a = de.ablauf;
const soon = (phase: number) => () => notice(de.prototyp.titel, de.prototyp.bald(phase));
const open = (id: string) => router.push({ pathname: '/beleg/[id]', params: { id } });
const toSend = (id: string) => router.push({ pathname: '/senden', params: { id } });

/**
 * Der nächste sinnvolle Schritt als großer Button – je nach Status:
 * Angebot: Senden → Kunde hat zugesagt → Rechnung erstellen. Rechnung: Senden → Bezahlt.
 */
export function DocActions({ doc }: { doc: Quote | Invoice }) {
  const colors = useColors();
  const { invoices, projects, acceptQuote, markPaid } = useDemo();
  const send = (
    <Button
      title={de.senden.senden}
      icon={<Ionicons name="paper-plane" size={20} color={colors.onPrimary} />}
      onPress={() => toSend(doc.id)}
    />
  );

  if (!('validUntil' in doc)) {
    if (doc.status === 'entwurf') {
      const project = projects.find((p) => p.id === doc.projectId)!;
      const missing = missingRequired(invoiceChecks(doc, customerOf(project), company));
      return missing.length ? (
        <Button title={de.rechnung.erstCheckliste} disabled onPress={() => undefined} />
      ) : (
        send
      );
    }
    if (doc.status === 'versendet')
      return (
        <>
          <Button title={a.bezahlt} onPress={() => markPaid(doc.id)} />
          <Button title={a.mahnen} variant="secondary" onPress={soon(5)} />
        </>
      );
    return null;
  }

  const template = (
    <Button
      title={de.editor.vorlage}
      variant="secondary"
      onPress={() =>
        router.push({ pathname: '/neu/[art]', params: { art: 'angebot', fromQuoteId: doc.id } })
      }
    />
  );
  const draftInvoice = invoices.find((i) => i.quoteId === doc.id && i.status === 'entwurf');

  return (
    <>
      {doc.status === 'entwurf' ? send : null}
      {doc.status === 'versendet' ? (
        <Button title={a.zugesagt} onPress={() => acceptQuote(doc.id)} />
      ) : null}
      {doc.status === 'angenommen' ? (
        draftInvoice ? (
          <Button title={a.zurRechnung} onPress={() => open(draftInvoice.id)} />
        ) : (
          <Button
            title={a.rechnungErstellen}
            onPress={() =>
              router.push({
                pathname: '/neu/[art]',
                params: { art: 'rechnung', projectId: doc.projectId },
              })
            }
          />
        )
      ) : null}
      {!doc.signedAt && doc.status !== 'angenommen' ? (
        <Button
          title={de.beleg.unterschreiben}
          variant="secondary"
          onPress={() => router.push({ pathname: '/unterschrift', params: { id: doc.id } })}
        />
      ) : null}
      {template}
    </>
  );
}
