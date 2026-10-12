# Produktkonzept: Warum Handwerker die App jeden Tag öffnen

Ziel: Der Handwerker soll sagen „Ohne die App arbeite ich nicht mehr – dafür zahle ich gern jeden Monat.“
Das gelingt nur, wenn die App **jeden Tag Zeit spart** und **am Ende Geld bringt** (schneller Angebote, schneller Rechnungen, weniger vergessene Stunden, bessere Preise).

## 1. Der rote Faden: ein Auftrag von Anfang bis Ende

Jeder Schritt ist höchstens ein paar Taps und baut auf dem vorherigen auf – nichts wird zweimal eingetippt.

| #   | Schritt                     | Was die App macht                                                                                                       | Taps       |
| --- | --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | **Anfrage** kommt rein      | Projekt anlegen, Kunde aus Kontakten/Telefon übernehmen                                                                 | 2–3        |
| 2   | **Besichtigung / Aufmaß**   | Fotos, Sprachnotiz, Maße direkt im Projekt                                                                              | 1 pro Foto |
| 3   | **Kostenvoranschlag (KVA)** | Vorlage aus ähnlichem Auftrag übernehmen oder Positionen per Vorschlag tippen; Gewinn wird live angezeigt (nur Inhaber) | ~3 Min.    |
| 4   | **KVA senden**              | PDF an Kunde (E-Mail oder WhatsApp), Kopie automatisch ans eigene Postfach                                              | 1          |
| 5   | **Kunde sagt Ja**           | Unterschrift auf dem Handy oder per Link; Status → „Beauftragt“, Termin vorschlagen                                     | 1          |
| 6   | **Arbeit**                  | Heute-Screen mit Route, Fotos vorher/nachher, Stunden + Material erfassen                                               | laufend    |
| 7   | **Rechnung**                | Aus dem KVA mit einem Tap: Einzel-, Abschlags- oder Schlussrechnung; Nummer automatisch                                 | 1          |
| 8   | **Rechnung senden**         | An Kunde + automatisch an **DATEV** (Upload-Mail des Steuerberaters) + Kopie ans eigene Postfach                        | 1          |
| 9   | **Zahlung**                 | Erinnerung bei Fälligkeit, Mahnung mit einem Tap, Status „Bezahlt“                                                      | 1          |
| 10  | **Nachkalkulation**         | Was hat der Auftrag wirklich gebracht? Ampel grün/gelb/rot                                                              | 0          |

## 2. Versenden: Kunde, eigenes Postfach, DATEV

**Wohin:**

- **Kunde:** E-Mail mit PDF im Anhang oder über WhatsApp/Teilen-Menü.
- **Eigenes Postfach:** Einstellung „Kopie jeder versendeten Rechnung/jedes Angebots an mich“ (automatische BCC).
- **DATEV:** DATEV bietet für Mandanten eine persönliche **Upload-Mail-Adresse** („DATEV Upload Mail“). Diese Adresse trägt man einmal in den Einstellungen ein – jede versendete Rechnung geht automatisch als PDF dorthin und landet beim Steuerberater. Keine Schnittstelle nötig. Ein echter DATEV-Export (Buchungsstapel) bleibt für Version 1.x.

**Wie technisch (Entscheidung offen, siehe unten):**

- **A) Aus der App senden** über einen E-Mail-Dienst mit Server in der EU. Absender z. B. „Weber Bad & Heizung“, Antworten gehen an die Firmen-Mail. Vorteil: Kopie an mich und an DATEV passiert automatisch, Versand wird protokolliert (GoBD). Nachteil: geht nur mit Netz, kleine laufende Kosten.
- **B) Über die Mail-App des Handys** (Teilen-Menü). Vorteil: keine Kosten, Mail liegt im eigenen „Gesendet“-Ordner. Nachteil: Kopie an DATEV muss der Nutzer selbst eintragen, Versand ist nicht protokolliert.
- **Empfehlung:** A als Standard, B immer zusätzlich als „Teilen“ (WhatsApp, eigene Mail-App).

## 3. KVA → Rechnung und Nummernkreis

- **Umwandeln:** Rechnung übernimmt Kunde, Projekt und alle Positionen aus dem angenommenen KVA. Mengen können vorher angepasst werden (z. B. tatsächlich verlegte m²).
- **Abschlagsrechnungen:** prozentual oder fester Betrag; die **Schlussrechnung zieht die Abschläge automatisch ab**.
- **Rechnungsnummer:** fortlaufend und eindeutig, Format z. B. `R-2026-0031`. Die Nummer wird **erst beim Festschreiben/Versenden** vergeben, nicht beim Entwurf – so entstehen keine Lücken.
- **Offline:** Rechnungen können offline als Entwurf erstellt werden. Die Nummer vergibt der Server beim Versenden (sonst könnten zwei Geräte dieselbe Nummer vergeben). Ohne Netz zeigt die App „Wird versendet, sobald Netz da ist“.
- **Nach dem Versand gesperrt** (GoBD): Korrektur nur per Storno-Rechnung + neue Rechnung; jede Änderung im Protokoll.
- **Pflichtangaben § 14 UStG** werden vor dem Versenden geprüft (Steuernummer/USt-IdNr., Leistungsdatum, Anschrift …) – fehlt etwas, sagt die App genau was.

## 4. Was die App „mega praktisch“ macht

**Spart jeden Tag Zeit**

- Heute-Screen: Termine mit Route, offene Aufgaben, laufende Zeit – der Tag beginnt in der App.
- Vorschläge beim Tippen und Vorlagen: Ein Angebot in 3 statt 30 Minuten.
- Startkatalog je Gewerk – die App ist ab Minute 1 befüllt.
- Sprachnotizen statt Tippen (mit Handschuhen); später KI: Diktat → Angebotspositionen.
- Alles offline – im Keller, auf dem Dach, auf dem Land.

**Bringt Geld**

- Erinnerungen: „Angebot seit 7 Tagen offen – nachfassen?“, „Rechnung überfällig – Mahnung senden?“ (Push-Nachricht).
- Rechnung direkt nach Abschluss, nicht erst Wochen später am Schreibtisch.
- Nachkalkulation zeigt, welche Aufträge sich lohnen und wo zu knapp kalkuliert wird.
- Einkaufspreise vergleichen – günstigsten Lieferanten sofort sehen.

**Schafft Vertrauen beim Kunden**

- Professionelles PDF mit Logo, digitale Unterschrift, Foto-Dokumentation vorher/nachher.

**Gewohnheit (warum man täglich reinschaut)**

- Morgens: Tagesplan. Unterwegs: Fotos, Stunden. Abends: Kurzer Tagesabschluss („3 Std. auf Badsanierung erfasst, 1 Foto fehlt noch“).
- Monatsübersicht: Umsatz, offene Rechnungen, Gewinn – das Gefühl „ich habe meinen Laden im Griff“.

## 5. Preis 5–10 € im Monat

- Das ist günstig im Vergleich zu bekannten Handwerker-Apps, die nach meinem Kenntnisstand meist deutlich mehr kosten und oft pro Nutzer abrechnen – ein starkes Verkaufsargument.
- Laufende Kosten pro Betrieb beachten: Server, Foto-Speicher, E-Mail-Versand, später KI. Fotos sind der größte Posten → Komprimierung vor Upload (ist geplant).
- Idee: **Basis für 1 Person** im unteren Bereich, **Team-Paket** (Mitarbeiter-Zugänge) und **KI-Funktionen** als Aufpreis. Vor dem Start mit echten Handwerkern testen, was sie zahlen würden.

## 6. Entscheidungen (2026-10-12)

1. **E-Rechnung in Version 1.0** – für Firmenkunden automatisch zusätzlich zum PDF. Fristen vom Steuerberater bestätigen lassen.
2. **Versand aus der App** (Weg A) mit automatischer Kopie an mich und an DATEV; Teilen über WhatsApp/Mail-App zusätzlich.
3. **Nummernkreise frei wählbar:** Präfix, nächste Zahl, Stellen, Suffix, Jahr als Platzhalter. Zahl kann nur erhöht werden.
4. **Push-Erinnerungen in Version 1.0:** Angebot nachfassen, Rechnung überfällig, Tagesabschluss.
