# CLAUDE.md – Handwerker-App (Arbeitstitel)

> Masterfile für Claude Code. Vor jeder Aufgabe lesen und einhalten.
> Bei Konflikten gilt: diese Datei > Gewohnheit. Änderungen an Stack oder Architektur nur nach Rückfrage.

---

## 1. Ziel

Eine schlanke, extrem übersichtliche Mobile-App für Handwerker und kleine Handwerksbetriebe (1–15 Mitarbeiter) in Deutschland.
Sie ersetzt Zettelwirtschaft, WhatsApp-Fotos und Word-Angebote durch **eine Projektakte pro Auftrag**.

**Leitsatz:** Alles, was auf der Baustelle passiert, ist in 3 Taps erledigt – mit einer Hand, mit Handschuhen, ohne Netz.

## 2. Zielgruppe

- Inhaber/Meister: erstellt Angebote, Rechnungen, plant Termine, sieht alles
- Gesellen/Mitarbeiter: sehen nur ihre Aufträge, machen Fotos, Notizen, Zeiten
- Wenig technikaffin, wenig Zeit, oft draußen, oft schlechtes Netz

## 3. Design-Prinzipien (verbindlich)

1. **Projekt im Zentrum:** Jedes Foto, Video, jede Notiz, jedes Angebot, jede Rechnung, jeder Termin gehört zu genau einem Projekt.
2. **Große Touch-Ziele:** min. 48×48 pt, wichtige Buttons 56 pt+. Hauptaktion unten erreichbar (Daumenzone).
3. **Wenig Text, klare Sprache:** Deutsch, Du-Form, keine Fachbegriffe aus der Softwarewelt.
4. **Offline-first:** Jede Kernfunktion funktioniert ohne Netz und synchronisiert später automatisch.
5. **Kein Feature ohne Grund:** Lieber eine Funktion weglassen als den Screen überladen.
6. **Hoher Kontrast**, gut lesbar bei Sonnenlicht; Dark Mode unterstützt.

### Navigation (Bottom Tabs, max. 5)
`Heute` · `Projekte` · `+ (Schnellaktion)` · `Kalender` · `Mehr`

- **Heute:** Termine des Tages, offene Aufgaben, zuletzt bearbeitete Projekte
- **+ Schnellaktion:** Foto aufnehmen · Notiz/Sprachnotiz · Neues Angebot · Neues Projekt · Zeit starten
- **Mehr:** Einkauf & Preise, Kunden, Artikelkatalog, Firmendaten, Nummernkreise, Versand & DATEV, Erinnerungen, Mitarbeiter

## 4. Tech-Stack (festgelegt)

| Bereich | Technologie |
|---|---|
| App | Expo (React Native), TypeScript strict, Expo Router |
| UI | eigene Komponentenbibliothek auf Basis von React Native, Design-Tokens zentral in `src/theme` |
| State / Server-Daten | TanStack Query + Zustand (nur UI-State) |
| Lokale DB (offline) | SQLite via `expo-sqlite` + Drizzle ORM |
| Sync | eigene Sync-Schicht: lokale Änderungen in Outbox-Tabelle → Supabase; Konflikte: last-write-wins pro Feld, Zeitstempel `updated_at` |
| Backend | Supabase (Region **EU – Frankfurt**): Postgres, Auth, Storage, Row Level Security |
| Medien | `expo-camera`, `expo-image-picker`, `expo-image-manipulator` (Komprimierung vor Upload) |
| PDF | HTML-Templates → `expo-print` (Angebote, Rechnungen, Berichte) |
| Unterschrift | Signatur-Pad-Komponente, als PNG im Projekt gespeichert |
| Formulare | React Hook Form + Zod |
| Tests | Jest + React Native Testing Library; Kernlogik (Preise, Steuern, Nummernkreise) mit Unit-Tests |
| Builds | EAS Build / EAS Update |

## 5. Datenmodell (MVP)

```
Firma (company)                 Gewerk, Fixkosten-Zuschlag %, Nummernkreise (Angebot/Rechnung: Präfix, nächste Zahl, Stellen, Suffix),
                                Versand (Kopie an mich, DATEV-Upload-Mail), Erinnerungen
 ├─ Mitarbeiter (member)        rolle: inhaber | mitarbeiter, interne Stundenkosten
 ├─ Kunde (customer)            privat | gewerblich, Adresse, Kontakt
 ├─ Artikel/Leistung (catalog_item)  Name, Einheit, Preis netto (VK), MwSt-Satz, Typ: material | arbeit, interne Kosten (nur Arbeit)
 ├─ Lieferant (supplier)        Name, Art: großhandel | baumarkt | online
 │    └─ Lieferantenpreis (supplier_price)  Artikel, Einkaufspreis netto, Stand-Datum
 └─ Projekt (project)           Kunde, Titel, Adresse Baustelle, Status, Titelbild (optional, sonst automatisch)
      ├─ Medien (media)         Foto | Video, Notiz, Tag (vorher/nachher/mangel/sonstiges), Zeitstempel, GPS optional
      ├─ Notiz (note)           Text oder Sprachnotiz (Audio + Transkript)
      ├─ Termin (appointment)   Start, Ende, zugewiesene Mitarbeiter
      ├─ Zeiteintrag (time_entry)  Mitarbeiter, Start, Ende, Pause, Art: arbeit | fahrt
      ├─ Projektkosten (project_cost)  Ist-Kosten von Hand: Material (Betrag, Lieferant) | Stunden (Mitarbeiter, Dauer)
      ├─ Angebot (quote)        Nummer, Datum, Gültig bis, Status, Positionen, Unterschrift
      │    └─ Position (quote_item)  Menge, Einheit, Einzelpreis, MwSt, Rabatt, Katalog-Bezug (optional)
      └─ Rechnung (invoice)     Nummer (fortlaufend, unveränderbar, erst beim Versand vergeben), Typ: abschlag | schluss | einzel, Positionen, Bezug zum Angebot, Versanddatum
```

Projekt-Status: `anfrage → angebot → beauftragt → in_arbeit → abgeschlossen → bezahlt`

Alle Tabellen: `id (uuid)`, `company_id`, `created_at`, `updated_at`, `deleted_at` (Soft Delete).
RLS: Nutzer sehen nur Daten ihrer Firma; Mitarbeiter nur Projekte, denen sie zugewiesen sind.
Einkaufspreise, interne Kosten, Projektkosten und Gewinn sieht **nur der Inhaber**.

## 6. MVP-Funktionsumfang

**Muss (Version 1.0):**
- Login (E-Mail + Magic Link), Firma anlegen, Firmendaten + Logo
- Kunden anlegen/bearbeiten, Suche
- Projekte mit Status, **Titelbild** (zum schnellen Wiedererkennen), Baustellenadresse (Tippen öffnet Navigation)
- Fotos/Videos aufnehmen oder aus Galerie, mit Tag + Notiz, Galerie-Ansicht pro Projekt
- Notizen, Sprachnotizen
- Artikel- und Leistungskatalog, beim Einrichten **Startkatalog je Gewerk** (Maler, Schreiner, SHK …)
- **Einkauf & Preise:** Einkaufspreise je Lieferant von Hand, Empfehlung des günstigsten aktuellen Preises, Online-Suche per Link (Google Shopping, idealo)
- Angebot erstellen aus Katalog oder Freitext, **Vorschläge beim Tippen** (Katalog + frühere Positionen, häufige zuerst), **altes Angebot als Vorlage übernehmen**, automatische Summen (netto, MwSt 19 %/7 %, brutto), PDF, teilen per E-Mail/WhatsApp, Kundenunterschrift auf dem Handy
- Angebot → Rechnung mit einem Tap (Schlussrechnung zieht Abschläge automatisch ab)
- **Nummernkreise selbst festlegen** (Präfix, Zahl, Stellen, Suffix, Jahr als Platzhalter); Zahl nur erhöhbar
- **Versand aus der App** (E-Mail-Dienst mit Server in der EU): an Kunde, automatische Kopie an mich, Rechnungen automatisch an die **DATEV-Upload-Mail**; zusätzlich Teilen (WhatsApp, Mail-App). Ohne Netz: Versand wartet.
- **E-Rechnung (ZUGFeRD/XRechnung)** für Rechnungen an Firmenkunden – automatisch zusätzlich zum PDF
- **Zeit pro Projekt:** Start/Stopp-Button im Projekt; beim Stoppen werden die Stunden im Projekt gespeichert (Summe sichtbar, fließt in die Kalkulation). Immer nur eine laufende Zeit.
- **Push-Erinnerungen:** Angebot nachfassen (nach X Tagen), Rechnung überfällig, Tagesabschluss
- **Kalkulation (nur Inhaber):** Vorkalkulation im Angebot (Material zum EK, Arbeit zu internen Kosten, Betriebskosten-Zuschlag), Nachkalkulation pro Projekt aus von Hand erfassten Material-Kosten und Stunden, Gewinn mit Ampel
- Kalender (Tag/Woche), Termine pro Projekt und Mitarbeiter
- Offline-Modus für alles oben

**Danach (Version 1.x):**
- Erweiterte Zeiterfassung (Pausen, Fahrzeit, Stundenzettel pro Mitarbeiter), Baustellen-/Regiebericht mit Unterschrift
- Aufmaß-Erfassung → Positionen
- Sprachdiktat → KI erzeugt Angebotspositionen (Vorschlag, Nutzer bestätigt)
- Foto eines Teils → KI erkennt es → Preise vergleichen
- DATEV-Export (Buchungsstapel)
- Mahnwesen, Auswertungen

**Nicht geplant:** Großhändler-Schnittstelle (IDS Connect, DATANORM) – Preise werden von Hand gepflegt.
**Nicht im MVP:** Lager, GAEB, Kundenportal, Buchhaltung.

## 7. Rechtliches / Compliance (immer beachten)

- **Rechnungen:** fortlaufende, lückenlose Nummernkreise; versendete Rechnungen sind **nicht editierbar** (nur Storno + Neue). Pflichtangaben nach § 14 UStG im Template.
- **GoBD:** Änderungen an Rechnungen protokollieren (Audit-Log-Tabelle), keine physischen Löschungen.
- **Kleinunternehmer (§ 19 UStG)** als Einstellung: dann keine MwSt, Hinweistext auf PDF.
- **E-Rechnung:** ZUGFeRD/XRechnung in 1.0 für Rechnungen an Unternehmen (Ausstellungspflicht nach Übergangsfristen bis Ende 2026/2027 – Fristen vom Steuerberater bestätigen lassen).
- **Rechnungsnummer** wird serverseitig beim Versenden vergeben (eindeutig auch bei mehreren Geräten/offline).
- **DSGVO:** Daten nur in EU, Medien in privatem Storage-Bucket mit signierten URLs, Konto-Löschung möglich.
- Geldbeträge **immer in Cent als Integer** speichern und rechnen, nie Floats.

## 8. Code-Regeln

- TypeScript strict, keine `any`.
- Ordnerstruktur:
  ```
  app/            Screens (Expo Router)
  src/components  wiederverwendbare UI
  src/features/   pro Bereich: customers, projects, media, quotes, invoices, calendar
  src/db/         Drizzle-Schema, Migrationen, Sync
  src/lib/        Helfer (Geld, Datum, PDF)
  src/theme/      Farben, Abstände, Typografie
  supabase/       SQL-Migrationen, RLS-Policies
  ```
- Komponenten klein halten (< 200 Zeilen), Logik in Hooks.
- Alle UI-Texte auf Deutsch, zentral in `src/i18n/de.ts` (spätere Mehrsprachigkeit möglich).
- Jede neue Tabelle: Drizzle-Schema + Supabase-Migration + RLS-Policy + Sync-Eintrag.
- Vor Abschluss einer Aufgabe: `npm run typecheck`, `npm run lint`, `npm test` müssen grün sein.
- Kleine, nachvollziehbare Commits mit deutscher Beschreibung.

## 9. Bau-Reihenfolge

| Phase | Inhalt | Fertig, wenn … |
|---|---|---|
| 0 | Projekt-Setup: Expo, TS, Lint, Theme, Navigation-Gerüst, Supabase-Anbindung | App startet, 5 Tabs sichtbar, Login funktioniert |
| 1 | Lokale DB + Sync-Grundgerüst | Datensatz offline anlegen → online automatisch in Supabase |
| 2 | Kunden + Projekte | Kunde und Projekt anlegen, Status ändern, Liste + Suche |
| 3 | Fotos/Videos/Notizen | Foto im Projekt, offline aufgenommen, später hochgeladen |
| 4 | Katalog + Einkaufspreise + Angebote (Vorschläge, Vorlage, Vorkalkulation) + PDF + Unterschrift | Angebot als PDF per WhatsApp teilen |
| 5 | Rechnungen + E-Rechnung + Versand + Nachkalkulation | Angebot → Rechnung, eigener Nummernkreis, Versand an Kunde/mich/DATEV, ZUGFeRD, Sperre nach Versand, Soll/Ist pro Projekt |
| 6 | Kalender + Heute-Screen | Termine pro Mitarbeiter, Tagesübersicht |
| 7 | Push-Erinnerungen, Feinschliff, Tests mit echten Handwerkern, Store-Vorbereitung | Testflight/Play-Testversion läuft |

Immer nur **eine Phase** gleichzeitig bearbeiten. Nach jeder Phase kurze Zusammenfassung: was gebaut, was offen, was getestet.

## 10. Arbeitsweise mit Claude Code

- Vor größeren Aufgaben erst einen kurzen Plan zeigen, dann bauen.
- Bei Unklarheiten zu Fachlichkeit (Handwerk, Steuern, Recht) nachfragen statt raten.
- Offene Punkte und Entscheidungen in `docs/ENTSCHEIDUNGEN.md` festhalten.
