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
4. Eigenen SMTP-Versand einrichten (_Authentication › Emails › Set up SMTP_) – erst danach lassen sich die Vorlagen bearbeiten. Dann _Authentication › Emails_: in **Magic Link** und **Confirm signup** den Code ergänzen, z. B.
   `<p>Oder gib diesen Code in der App ein: <strong>{{ .Token }}</strong></p>`
5. Ohne eigenen SMTP: nur wenige Mails pro Stunde, nur an Mitglieder des Supabase-Teams, und ohne Code in der Mail (nur Link).

## Anmelden mit Apple, Google, Microsoft, Facebook

Jeder Anbieter wird in Supabase unter _Authentication › Sign In / Providers_ eingeschaltet.
Als Callback-URL beim Anbieter immer eintragen: `https://DEIN-PROJEKT.supabase.co/auth/v1/callback`.

- **Google:** [Google Cloud Console](https://console.cloud.google.com) › APIs & Dienste › Anmeldedaten › OAuth-Client-ID (Typ _Webanwendung_). Client-ID + Secret in Supabase eintragen.
- **Apple:** [Apple Developer](https://developer.apple.com) (kostenpflichtig) › Identifiers: App-ID `de.handwerkerapp.app` mit _Sign in with Apple_, dazu eine Services-ID (für Android/Browser) und einen Key. In Supabase: Services-ID, Team-ID, Key-ID, Key. Unter _Client IDs_ zusätzlich `de.handwerkerapp.app` und für Expo Go `host.exp.Exponent` eintragen (nativer iPhone-Dialog).
- **Microsoft (in Supabase: „Azure“):** [Azure Portal](https://portal.azure.com) › App-Registrierungen › Neu, Kontotypen _beliebiges Organisationsverzeichnis und persönliche Microsoft-Konten_. Client-ID + Secret in Supabase, Tenant-URL `https://login.microsoftonline.com/common`.
- **Facebook:** [Meta for Developers](https://developers.facebook.com) › App erstellen › _Facebook Login_. App-ID + Secret in Supabase. Für echte Nutzer muss die App bei Meta live geschaltet werden (Datenschutz-URL nötig).

Gleiche E-Mail bei verschiedenen Anbietern = ein Konto (Supabase verknüpft automatisch).
