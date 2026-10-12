# Entscheidungen und offene Punkte

## Entscheidungen

### Phase 0 (2026-10-12)

- **Expo SDK 57**, React Native 0.86, TypeScript 6 (strict + `noUncheckedIndexedAccess`).
- **Routen liegen in `app/` im Projekt-Root** (laut CLAUDE.md), nicht in `src/app/` wie im Expo-Template.
- **Login: Magic Link + 6-stelliger Code** in derselben E-Mail. Grund: Der Link klappt nicht, wenn die Mail auf einem anderen Gerät geöffnet wird; der Code klappt immer. Link nutzt PKCE (`/login-callback`).
- **Session-Speicher: `expo-secure-store`** (verschlüsselt), aufgeteilt in Stücke, weil eine Session > 2 KB sein kann. Im Web (nur Vorschau) `localStorage`.
- **Abmelden nur auf diesem Gerät** (`scope: 'local'`), funktioniert auch offline.
- **Navigation: JS-Tabs** (`expo-router/js-tabs`) statt Native Tabs, weil der Plus-Mittelbutton ein eigenes Aussehen braucht und kein Screen ist, sondern ein Bottom-Sheet öffnet.
- **Bundle-ID / Package:** `de.handwerkerapp.app` (vorläufig), Deep-Link-Scheme `handwerkerapp`.
- **Farben:** Signal-Orange als Primärfarbe (`#C2410C` hell / `#FB923C` dunkel), Kontrast ≥ 4,5:1, Text ≥ 7:1.
- **Formulare:** Login nutzt nur Zod (ein Feld). React Hook Form kommt mit dem ersten echten Formular (Phase 2).
- **Texte** als einfaches Objekt in `src/i18n/de.ts`, noch keine i18n-Bibliothek.

## Offene Punkte

- Supabase-Projekt (Frankfurt) anlegen und Einrichtung laut README durchführen → danach Login auf echtem Gerät testen.
- Eigener SMTP-Versand für Auth-Mails vor dem ersten Test mit echten Nutzern.
- Firma anlegen nach erstem Login (Phase 1/2).
- App-Name und Icon final festlegen (Phase 7).
- Xcode ist auf dem Entwickler-Mac nicht installiert → Test bisher über Web-Vorschau; native Prüfung mit Expo Go auf dem Handy.
