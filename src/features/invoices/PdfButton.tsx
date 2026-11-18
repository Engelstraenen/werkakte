import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';

import { hasXRechnung, shareBeleg, shareXRechnung } from './belegExport';
import { Button } from '@/components/Button';
import type { Invoice, Project, Quote } from '@/features/demo/types';
import { de } from '@/i18n/de';
import { notice } from '@/lib/notice';
import { useColors } from '@/theme';

/** PDF erzeugen und übers Teilen-Menü verschicken oder speichern. */
export function PdfButton({ doc, project }: { doc: Quote | Invoice; project: Project }) {
  const colors = useColors();
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true);
    try {
      await shareBeleg(doc, project);
    } catch {
      notice(de.pdf.teilen, de.pdf.fehler);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Button
        title={de.pdf.teilen}
        variant="secondary"
        loading={busy}
        icon={<Ionicons name="document-text-outline" size={20} color={colors.text} />}
        onPress={run}
      />
      {hasXRechnung(doc, project) ? (
        <Button
          title={de.pdf.xml}
          variant="secondary"
          icon={<Ionicons name="code-slash-outline" size={20} color={colors.text} />}
          onPress={() =>
            shareXRechnung(doc, project).catch(() => notice(de.pdf.xml, de.pdf.fehler))
          }
        />
      ) : null}
    </>
  );
}
