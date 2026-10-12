# Handwerker-App (Arbeitstitel)

Projektakte für Handwerksbetriebe. Regeln und Architektur: siehe [CLAUDE.md](CLAUDE.md), Entscheidungen: [docs/ENTSCHEIDUNGEN.md](docs/ENTSCHEIDUNGEN.md).

## Starten

```bash
npm install
cp .env.example .env   # Supabase-URL und anon key eintragen
npm start              # QR-Code mit Expo Go scannen
```

Prüfen vor jedem Commit:

```bash
npm run typecheck && npm run lint && npm test
```

## Supabase einrichten (einmalig)

1. Auf [supabase.com](https://supabase.com) ein Projekt anlegen, Region **Central EU (Frankfurt)**.
2. _Project Settings › API_: Project URL und `anon` key in `.env` eintragen.
3. _Authentication › URL Configuration › Redirect URLs_ hinzufügen:
   - `handwerkerapp://**` (eigener Build)
   - `exp://**` (Expo Go während der Entwicklung)
4. _Authentication › Email Templates_: in **Magic Link** und **Confirm signup** den Code ergänzen, z. B.
   `<p>Oder gib diesen Code in der App ein: <strong>{{ .Token }}</strong></p>`
5. Für echte Nutzer später eigenen SMTP-Versand einrichten (der eingebaute Versand ist stark begrenzt).
