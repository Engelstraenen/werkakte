#!/bin/sh
# Live-Demo bauen und veröffentlichen:
#  - Branch gh-pages  → GitHub Pages  https://engelstraenen.github.io/werkakte/   (Unterpfad /werkakte)
#  - Branch projektex → ZIP für Grok   https://github.com/Engelstraenen/werkakte/archive/refs/heads/projektex.zip
#                        (Grok kopiert es nach projektex.de/referenzen/werkakte/ – genau dieser Pfad, sonst lädt nichts)
# Grund für Branches statt Actions: deploy-pages@v4 fand das Artefakt seit 19.11.2026 nicht mehr, Workflow pausiert.
# Liegt eine .env mit Supabase vor, läuft das Handwerker-Netzwerk in beiden Fassungen echt (Anmeldung per E-Mail).
set -e
REMOTE=$(git remote get-url origin)

publish() { # $1 = Branch, $2 = Unterpfad
  OUT=$(mktemp -d)
  EXPO_PUBLIC_DEMO_MODE=1 EXPO_BASE_URL="$2" npx expo export -p web --output-dir "$OUT"
  cp "$OUT/index.html" "$OUT/404.html"   # Unterseiten wie /netzwerk direkt aufrufbar
  touch "$OUT/.nojekyll"
  printf 'RewriteEngine On\nRewriteCond %%{REQUEST_FILENAME} !-f\nRewriteRule . %s/index.html [L]\n' "$2" > "$OUT/.htaccess"
  (cd "$OUT" && git init -q -b "$1" && git add -A && git commit -q -m "Live-Demo $(date +%F) ($2)" && git push -q -f "$REMOTE" "$1")
  echo "→ $1 veröffentlicht ($2)"
}

publish gh-pages /werkakte
publish projektex /referenzen/werkakte
echo "GitHub Pages: https://engelstraenen.github.io/werkakte/ (1–2 Minuten)"
echo "Grok-ZIP:     https://github.com/Engelstraenen/werkakte/archive/refs/heads/projektex.zip"
