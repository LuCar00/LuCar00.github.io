#!/bin/bash
# Ricostruisce Circolari.app sulla Scrivania. Serve se l'app viene
# cestinata, o se la cartella del progetto cambia posto (il percorso e'
# scritto dentro l'avviatore).
set -e
SORGENTE="$(cd "$(dirname "$0")" && pwd)"
APP="${1:-$HOME/Desktop/Circolari.app}"

[ -f "$SORGENTE/icona.icns" ] || python3 "$SORGENTE/fai-icona.py" "$SORGENTE"

rm -rf "$APP"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleName</key><string>Circolari</string>
    <key>CFBundleDisplayName</key><string>Circolari</string>
    <key>CFBundleIdentifier</key><string>com.lucarnevale.circolari.pannello</string>
    <key>CFBundleVersion</key><string>1.0</string>
    <key>CFBundleShortVersionString</key><string>1.0</string>
    <key>CFBundlePackageType</key><string>APPL</string>
    <key>CFBundleExecutable</key><string>avvia</string>
    <key>CFBundleIconFile</key><string>icona</string>
    <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

cat > "$APP/Contents/MacOS/avvia" <<AVVIA
#!/bin/bash
# Se il pannello e' gia' acceso, app.py riapre quello invece di avviarne un
# secondo. Si spegne dal bottone "Chiudi il pannello" nella pagina.
PANNELLO="$SORGENTE/app.py"
if [ ! -f "\$PANNELLO" ]; then
  osascript -e 'display alert "Pannello circolari" message "Non trovo i file del monitor. La cartella del progetto e'\''  stata spostata?" as critical'
  exit 1
fi
exec /usr/bin/python3 "\$PANNELLO"
AVVIA
chmod +x "$APP/Contents/MacOS/avvia"

cp "$SORGENTE/icona.icns" "$APP/Contents/Resources/icona.icns"
touch "$APP"
echo "creata: $APP"
