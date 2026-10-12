# Entscheidungen und offene Punkte

## Entscheidungen

### Phase 0 (2026-10-12)

- **Expo SDK 57**, React Native 0.86, TypeScript 6 (strict + `noUncheckedIndexedAccess`).
- **Routen liegen in `app/` im Projekt-Root** (laut CLAUDE.md), nicht in `src/app/` wie im Expo-Template.
- **Login: Magic Link + 6-stelliger Code** in derselben E-Mail. Grund: Der Link klappt nicht, wenn die Mail auf einem anderen Gerät geöffnet wird; der Code klappt immer. Link nutzt PKCE (`/login-callback`).
- **Weitere Anmelde-Wege (optional neben E-Mail): Apple, Google, Microsoft, Facebook.** Google/Microsoft/Facebook (und Apple auf Android) über Supabase-OAuth im Browser-Fenster (`expo-web-browser`, PKCE, gleiche Route `/login-callback`). Apple auf dem iPhone mit nativem Dialog (`expo-apple-authentication`) – Pflicht laut App-Store-Regel 4.8, sobald Google-Login angeboten wird. Nativer Google-Dialog wurde verworfen (bräuchte Development-Build statt Expo Go).
- **Session-Speicher: `expo-secure-store`** (verschlüsselt), aufgeteilt in Stücke, weil eine Session > 2 KB sein kann. Im Web (nur Vorschau) `localStorage`.
- **Abmelden nur auf diesem Gerät** (`scope: 'local'`), funktioniert auch offline.
- **Navigation: JS-Tabs** (`expo-router/js-tabs`) statt Native Tabs, weil der Plus-Mittelbutton ein eigenes Aussehen braucht und kein Screen ist, sondern ein Bottom-Sheet öffnet.
- **Name: Werkakte.** Bundle-ID / Package `de.werkakte.app`, Deep-Link-Scheme `werkakte` (vorher `handwerkerapp` – in Supabase die Redirect-URL `werkakte://**` eintragen). Marke, Domain und App-Store-Name noch prüfen.
- **Farben:** Signal-Orange als Primärfarbe (`#C2410C` hell / `#FB923C` dunkel), Kontrast ≥ 4,5:1, Text ≥ 7:1.
- **Formulare:** Login nutzt nur Zod (ein Feld). React Hook Form kommt mit dem ersten echten Formular (Phase 2).
- **Texte** als einfaches Objekt in `src/i18n/de.ts`, noch keine i18n-Bibliothek.

### Klick-Prototyp (2026-10-12)

- **Auf Wunsch vorgezogen:** Alle Screens (Heute, Projekte, Projektakte, Angebote/Rechnungen, Kalender, Mehr, Neu-Formulare) mit Beispieldaten zum Durchklicken – vor Phase 1, um Aufbau und Design früh zu prüfen.
- **Beispieldaten nur im Speicher** (`src/features/demo`, Zustand). Nach Neuladen wieder Ausgangszustand. Wird ab Phase 1/2 durch SQLite + Sync ersetzt; die Screens bleiben.
- **Design:** eigene Bausteine (kein UI-Framework), Karten mit Schatten, Status-Farben, Avatare, große Titel. Online geprüft: NativeWind/React Native Reusables, gluestack-ui v3, Tamagui, Paper – bewusst nicht eingesetzt (Stack-Änderung, Risiko mit SDK 57).
- **Geld/MwSt-Logik** schon echt (`src/lib/money.ts`, Cent + Mengen in Tausendsteln, MwSt pro Satz auf die Summe) mit Unit-Tests.
- **Demo-Fotos** von Wikimedia Commons (freie Lizenzen, Quellen in `assets/demo/QUELLEN.md`) – vor dem Store-Release entfernen.
- **Offene Aufgaben** auf „Heute“ werden aus den Daten abgeleitet (überfällige Rechnung, Angebot nachfassen, Mangel, neue Anfrage) – kein eigenes Aufgaben-Modul.

### Einkauf, Kalkulation, Angebote (2026-10-12)

- **Preisvergleich ohne Großhändler-Schnittstelle:** Einkaufspreise je Lieferant von Hand (A), Online-Suche per Link zu Google Shopping/idealo (B), Foto → KI-Erkennung → Suche (C, Version 1.x; im Prototyp nur als Ablauf). IDS Connect/DATANORM (D) gestrichen – nicht nötig, Preise werden selbst gepflegt.
- **Empfehlung:** günstigster _aktueller_ Preis; Preise älter als 90 Tage gelten als veraltet und werden nur genommen, wenn es nichts Neueres gibt.
- **Kalkulation in 1.0 (nur Inhaber):** Vorkalkulation im Angebot (Material zum besten EK, Arbeit zu internen Kosten, Betriebskosten-Zuschlag), Nachkalkulation aus von Hand erfassten Material-Kosten und Stunden. Ampel: ab 15 % grün, ab 5 % gelb. **Fachlich zu prüfen:** Ist ein pauschaler Betriebskosten-Zuschlag auf Material + Lohn (Demo: 18 %) für die Zielgruppe verständlich, oder lieber Gemeinkosten nur auf Lohn?
- **Angebote schneller:** Vorschläge beim Tippen aus Katalog + früheren Positionen (Wortanfang zuerst, dann häufig benutzte), altes Angebot als Vorlage übernehmen. Startkatalog je Gewerk beim Einrichten (Inhalt noch offen).
- **Titelbild pro Projekt:** selbst gewählt, sonst neuestes Nachher-Foto, sonst neuestes Foto; ohne Foto farbiger Platzhalter. Hilft, ähnliche Aufträge (z. B. mehrere Bäder in einer Stadt) auseinanderzuhalten.
- **Kalkulation so einfach wie möglich:** oben ein Satz „Dir bleiben X € (Y %)“ mit Ampel, darunter ein Balken „Wohin geht das Geld?“ (Material, Arbeit, Fixkosten, Gewinn). Tabelle nur unter „Details“. Stunden per Schnelltaste (1/2/4/8), Material = nur Betrag Pflicht. Wörter: „Einnahmen“, „Ausgaben“, „Fixkosten“ statt Fachbegriffen.
- **Nummernkreise, Versand, E-Rechnung, Push** (Details in `docs/PRODUKTKONZEPT.md` §6): alles in Version 1.0. Rechnungsnummer erst beim Versand, Schlussrechnung zieht Abschläge ab, DATEV per Upload-Mail statt Schnittstelle.
- **Projektliste:** Titelbild rechts fast quadratisch; Projektakte oben 4:3.
- **Zeit läuft immer auf ein Projekt und eine Person:** Start/Stopp pro Teammitglied im Projekt; mehrere Personen parallel. Wechsel stoppt und speichert die alte Zeit derselben Person. Team-Mitgliedschaft im Projekt ist zugleich die Berechtigung. Heute zeigt „Gerade im Einsatz“ (Inhaber: alle).
- **Testmodus** bleibt in der Entwicklung über Neuladen gespeichert.
- **Design „Bauplan“ + Name „Werkakte“** (Auswahl aus drei Richtungen: Signal, Klar, Bauplan). Zusätzlich helle Variante für Sonne, weil CLAUDE.md hohen Kontrast draußen verlangt. Fließtext in normal breiter Schrift (besser lesbar), Überschriften schmal.
- **Bauplan-Kontrast nachgeschärft:** dunklerer Hintergrund, hellere Karten mit kräftigem Rand und Schatten, leiseres Raster, Abschnitte mit gelbem Balken, Statusstreifen 6 px. Grund: Karten gingen im Raster unter.
- **Farbvarianten:** Ruhig (Standard, Vorschlag nach Lesbarkeits-Forschung: positive Polarität, wenig Linien, eine Aktionsfarbe, Status immer mit Wort), Hell (weiß + hellblaues Raster + mittelblaue Umrandungen), Dunkel (Blaupause). Wählbar unter Mehr › Darstellung, wird gespeichert. **Offen: Bestätigung des Standards durch den Auftraggeber** (Vergleichsseite als Artifact).
- **Produktkonzept** (Versand, KVA → Rechnung, Nummernkreis, Bindung): siehe `docs/PRODUKTKONZEPT.md`.

## Offene Punkte

- Supabase-Projekt (Frankfurt) anlegen und Einrichtung laut README durchführen → danach Login auf echtem Gerät testen.
- Apple-, Google-, Microsoft- und Facebook-Zugänge anlegen (siehe README) und je Anbieter auf Gerät testen.
- Datenschutzerklärung muss die Login-Anbieter nennen (Datenübermittlung an Apple, Google, Microsoft, Meta – USA). Facebook-Login braucht sie zwingend für die Freischaltung bei Meta.
- Apple liefert den Namen nur beim allerersten Login – später beim Anlegen der Firma/des Profils abfragen.
- E-Mail-Dienst mit Server in der EU auswählen (Versand aus der App), DATEV-Upload-Mail mit einem Steuerberater testen.
- Startkataloge je Gewerk zusammenstellen (Maler, Schreiner, SHK, Elektro …) – am besten mit echten Betrieben.
- Eigener SMTP-Versand für Auth-Mails vor dem ersten Test mit echten Nutzern. Erst damit lassen sich die Supabase-Vorlagen bearbeiten → Code (`{{ .Token }}`) in die Mail. Bis dahin funktioniert nur der Link (auf demselben Gerät).
- Firma anlegen nach erstem Login (Phase 1/2).
- App-Name und Icon final festlegen (Phase 7).
- Xcode ist auf dem Entwickler-Mac nicht installiert → Test bisher über Web-Vorschau; native Prüfung mit Expo Go auf dem Handy.
