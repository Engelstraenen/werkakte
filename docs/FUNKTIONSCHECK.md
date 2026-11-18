# Funktionscheck Werkakte (18.11.2026)

Prüffrage je Bereich: Kann man alles **anlegen, ändern, nutzen**, was ein Handwerker dort erwartet?
Regel: Anlegen immer über das orange **Plus** oben rechts (nie „Neu“-Text).

| Bereich | Vorher | Jetzt | Geprüft im Browser |
|---|---|---|---|
| Kunden | nur Liste (7), antippen = anrufen | Plus → Neuer Kunde; Zeile antippen → bearbeiten (+ Anrufen-Knopf) | ✅ 8. Kunde angelegt |
| Projekte | nur über Schnellmenü | Plus im Projekte-Tab; im Formular Plus neben „Kunde“ (neuer Kunde wird direkt gewählt) | ✅ |
| Angebote | „Neues Angebot“ = Projektliste ohne Erklärung, Entwurf mit festen Positionen, nur Menge änderbar | Überschrift „Für welches Projekt ist das Angebot?“ + „Neues Projekt anlegen“; leeres Angebot; Positionen aus Katalog **oder frei geschrieben**; Position antippen → Text, Einheit, Preis, MwSt ändern | ✅ freie Position 650 € → 773,50 € brutto |
| Termine | nicht anlegbar | Plus im Kalender; in der Akte „Termin hinzufügen“; Projekt, Tag, Uhrzeit, Mitarbeiter | ✅ Termin am Freitag sichtbar |
| Katalog | nicht anlegbar | Plus → Neuer Artikel / Leistung | tsc ✅ |
| Einkauf / Lieferanten | nicht anlegbar | Plus → Neuer Lieferant | tsc ✅ |
| Mitarbeiter | nicht anlegbar | Plus → Neuer Mitarbeiter (Rolle, Stundenkosten) | tsc ✅ |
| Team: Bewerber | nur per Webseite/Link | Plus → Bewerbung eintragen (Anruf/persönlich, „Empfohlen von“) | ✅ Plus sichtbar |
| Team: Stellen | fest 4 Stellen | Plus → Neue Stelle (Art, Titel, Gehalt, Arbeitszeit) | ✅ Plus sichtbar |
| Schnellmenü (+ unten) | Foto, Notiz, Angebot, Projekt, Material, Problem | zusätzlich **Kunde** und **Termin** | ✅ |
| Mehr-Tab | Zähler fest | Zähler zählen live mit | tsc ✅ |

## Technik
- Stammdaten (Kunden, Katalog, Lieferanten, Mitarbeiter, Termine) liegen jetzt im Store `src/features/demo/stamm.ts` statt fest im Code.
- Alles im Speicher (Prototyp): nach Neuladen wieder Demo-Stand. Speichern auf Server kommt mit Supabase.

## Offen
- Rechnungen frei schreiben (gleicher Editor wie Angebot) – noch nicht umgestellt.
- Nach dem Anlegen eines Termins springt der Kalender noch nicht auf den gewählten Tag.
- Löschen von Kunden/Artikeln fehlt bewusst (Belege hängen daran).
