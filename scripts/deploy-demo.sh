#!/bin/sh
# Live-Demo bauen und als Branch gh-pages veröffentlichen (GitHub Pages, Quelle: Branch gh-pages).
# Grund: Der Actions-Deploy (.github/workflows/pages.yml) findet sein Artefakt seit 19.11.2026 nicht mehr
# und ist pausiert; den Workflow selbst kann unser Token nicht ändern (kein workflow-Recht).
set -e
OUT=$(mktemp -d)
EXPO_PUBLIC_DEMO_MODE=1 EXPO_BASE_URL=/werkakte npx expo export -p web --output-dir "$OUT"
cp "$OUT/index.html" "$OUT/404.html"   # Unterseiten wie /netzwerk direkt aufrufbar
touch "$OUT/.nojekyll"
REMOTE=$(git remote get-url origin)
cd "$OUT"
git init -q -b gh-pages
git add -A
git commit -q -m "Live-Demo $(date +%F)"
git push -q -f "$REMOTE" gh-pages      # gh-pages enthält nur den fertigen Build
echo "Live in 1–2 Minuten: https://engelstraenen.github.io/werkakte/"
