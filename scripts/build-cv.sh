#!/usr/bin/env sh
# Render cv/cv-en.html to public/cv-en.pdf with headless Chrome.
#
# The HTML carries its own @page rule (A4, no margins), so Chrome only needs
# to be told to skip its header/footer. Fonts load from Google Fonts, so run
# it online or the PDF falls back to system fonts.
#
# Run with:  pnpm cv:pdf
# Override the browser with CHROME=/path/to/chrome when not on macOS.
set -eu
cd "$(dirname "$0")/.."

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
if [ ! -x "$CHROME" ]; then
  echo "Chrome not found at: $CHROME (set CHROME=/path/to/chrome)" >&2
  exit 1
fi

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PWD/public/cv-en.pdf" "file://$PWD/cv/cv-en.html" 2>/dev/null

echo "Rendered public/cv-en.pdf from cv/cv-en.html"
