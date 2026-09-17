#!/bin/bash
# Lanciato da launchd cinque volte al giorno. Vedi
# ~/Library/LaunchAgents/com.lucarnevale.circolari.plist
#
# I secret NON stanno qui: questo file e' in un repo pubblico. Vivono in
# ~/.circolari/env, che resta sul Mac e non viene mai committato.
set -u

REPO="/Users/lucacarnevale/Desktop/Lavoro/LuCar00/LuCar00.github.io"
ENV_FILE="$HOME/.circolari/env"
LOG="$HOME/.circolari/log.txt"
PATH="/usr/bin:/bin:/usr/sbin:/sbin"     # launchd parte con un PATH minimo
export PATH

mkdir -p "$HOME/.circolari"
# Ruota il log prima di aprirlo, non dopo: troncarlo mentre e' aperto
# manderebbe le righe successive in un file ormai scollegato.
if [ -f "$LOG" ] && [ "$(wc -l < "$LOG")" -gt 3000 ]; then
  tail -n 1000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

exec >> "$LOG" 2>&1
echo "=== $(date '+%Y-%m-%d %H:%M:%S') ${*:-controllo} ==="

if [ ! -f "$ENV_FILE" ]; then
  echo "manca $ENV_FILE: senza token e chat id non si va da nessuna parte"
  exit 1
fi
set -a; . "$ENV_FILE"; set +a

cd "$REPO" || { echo "cartella del repo non trovata: $REPO"; exit 1; }

# Il remoto puo' essere cambiato (altri lavori sullo stesso repo).
git pull --rebase -q origin main || echo "pull non riuscito, proseguo lo stesso"

# Gli argomenti passano allo script: "run-mac.sh --test" manda una prova
# usando i secret del Mac, senza aspettare il prossimo orario.
python3 circolari/_src/check.py "$@" || { echo "il controllo e' fallito"; exit 1; }

if git diff --quiet -- circolari/; then
  echo "niente da pubblicare"
  exit 0
fi

git add circolari/
git commit -q -m "circolari: aggiornamento automatico"
for tentativo in 1 2 3; do
  if git push -q origin main; then
    echo "pagina aggiornata e pubblicata"
    exit 0
  fi
  echo "push rifiutato (tentativo $tentativo), riallineo e riprovo"
  git pull --rebase -q origin main || break
done
echo "push non riuscito: il commit resta in locale, verra' spinto al giro dopo"
