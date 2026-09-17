#!/usr/bin/env python3
"""
Pannello locale del monitor circolari.

Avvia un server sul solo 127.0.0.1 e apre la pagina nel browser. Serve a
gestire token e id, lanciare le prove, leggere il log e sfogliare l'archivio
senza passare dal Terminale.

Nessuna dipendenza: solo standard library. Si chiude con Ctrl-C o dalla
pagina stessa.
"""

import http.server
import json
import os
import re
import secrets
import socket
import subprocess
import threading
import urllib.parse
import webbrowser

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
ARCHIVIO = os.path.join(HERE, "archivio.json")
RUN_MAC = os.path.join(HERE, "run-mac.sh")
UI = os.path.join(HERE, "ui.html")
CONF = os.path.expanduser("~/.circolari")
ENV = os.path.join(CONF, "env")
LOG = os.path.join(CONF, "log.txt")
SEGNALIBRO = os.path.join(CONF, "pannello.url")
PLIST = os.path.expanduser(
    "~/Library/LaunchAgents/com.lucarnevale.circolari.plist")
LABEL = "com.lucarnevale.circolari"

CHIAVI = ("TELEGRAM_TOKEN", "TELEGRAM_CHAT_ID", "TELEGRAM_HEARTBEAT_ID")

# Chiave di sessione: senza, qualunque pagina aperta nel browser potrebbe
# parlare con questo server. Vive solo finche' il pannello e' acceso.
CHIAVE = secrets.token_urlsafe(24)

INTESTAZIONE_ENV = """\
# Segreti del monitor circolari. Resta sul Mac, fuori dal repo (che e' pubblico).
# Scritto dal pannello: si puo' modificare anche a mano.
"""


# --- lettura dello stato ---------------------------------------------------

def leggi_env():
    valori = {}
    if os.path.exists(ENV):
        with open(ENV, encoding="utf-8") as fh:
            for riga in fh:
                riga = riga.strip()
                if not riga or riga.startswith("#") or "=" not in riga:
                    continue
                chiave, _, valore = riga.partition("=")
                valori[chiave.strip()] = valore.strip().strip('"').strip("'")
    return valori


def mascherato(valore):
    """Mostra solo la coda: basta a riconoscere il valore, non a usarlo."""
    if not valore or valore.startswith("INCOLLA_QUI"):
        return None
    coda = valore[-4:] if len(valore) > 6 else ""
    return {"impostato": True, "coda": coda, "lunghezza": len(valore)}


def scrivi_env(nuovi):
    """Salva solo i campi arrivati non vuoti: gli altri restano come sono."""
    correnti = leggi_env()
    for chiave in CHIAVI:
        valore = (nuovi.get(chiave) or "").strip()
        if valore:
            correnti[chiave] = valore
    os.makedirs(CONF, exist_ok=True)
    with open(ENV, "w", encoding="utf-8") as fh:
        fh.write(INTESTAZIONE_ENV)
        for chiave in CHIAVI:
            fh.write(f'{chiave}="{correnti.get(chiave, "")}"\n')
    os.chmod(ENV, 0o600)


def stato_launchd():
    try:
        elenco = subprocess.run(["launchctl", "list"], capture_output=True,
                                text=True, timeout=10).stdout
    except (OSError, subprocess.SubprocessError):
        return {"attivo": False, "errore": "launchctl non raggiungibile"}
    return {"attivo": any(LABEL in r for r in elenco.splitlines()),
            "plist": os.path.exists(PLIST)}


def orari_previsti():
    if not os.path.exists(PLIST):
        return []
    with open(PLIST, encoding="utf-8") as fh:
        testo = fh.read()
    ore = re.findall(r"<key>Hour</key><integer>(\d+)</integer>", testo)
    return [f"{int(o):02d}:00" for o in ore]


def coda_log(righe=400):
    if not os.path.exists(LOG):
        return ""
    with open(LOG, encoding="utf-8", errors="replace") as fh:
        return "".join(fh.readlines()[-righe:])


def archivio():
    if not os.path.exists(ARCHIVIO):
        return {"documenti": [], "ultimo_controllo": None}
    with open(ARCHIVIO, encoding="utf-8") as fh:
        return json.load(fh)


# --- azioni ----------------------------------------------------------------

AZIONI = {
    "controllo": [],
    "prova-circolare": ["--test"],
    "prova-riepilogo": ["--heartbeat"],
}

_in_corso = threading.Lock()


def esegui(azione):
    """Lancia run-mac.sh e restituisce quello che ha scritto nel log."""
    if azione not in AZIONI:
        return {"ok": False, "output": "azione sconosciuta"}
    if not _in_corso.acquire(blocking=False):
        return {"ok": False, "output": "c'e' gia' un'esecuzione in corso"}
    try:
        prima = len(coda_log(100000).splitlines())
        try:
            esito = subprocess.run(["bash", RUN_MAC] + AZIONI[azione],
                                   capture_output=True, text=True, timeout=300)
        except subprocess.TimeoutExpired:
            return {"ok": False, "output": "l'esecuzione non e' terminata entro 5 minuti"}
        righe = coda_log(100000).splitlines()
        nuove = "\n".join(righe[prima:]) or (esito.stderr or "").strip()
        return {"ok": esito.returncode == 0, "output": nuove or "(nessun output)"}
    finally:
        _in_corso.release()


def cambia_launchd(accendi):
    uid = os.getuid()
    if accendi:
        cmd = ["launchctl", "bootstrap", f"gui/{uid}", PLIST]
    else:
        cmd = ["launchctl", "bootout", f"gui/{uid}/{LABEL}"]
    esito = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    messaggio = (esito.stderr or esito.stdout or "").strip()
    return {"ok": esito.returncode == 0,
            "output": messaggio or ("attivato" if accendi else "disattivato")}


# --- server ----------------------------------------------------------------

class Pannello(http.server.BaseHTTPRequestHandler):
    server_version = "circolari"

    def log_message(self, *args):
        pass                      # niente rumore sul terminale

    def _autorizzato(self, query):
        fornita = (query.get("k", [""])[0]
                   or self.headers.get("X-Chiave", ""))
        return secrets.compare_digest(fornita, CHIAVE)

    def _json(self, dati, codice=200):
        corpo = json.dumps(dati, ensure_ascii=False).encode("utf-8")
        self.send_response(codice)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(corpo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(corpo)

    def do_GET(self):
        percorso, _, stringa = self.path.partition("?")
        query = urllib.parse.parse_qs(stringa)

        if percorso == "/":
            if not self._autorizzato(query):
                self.send_error(403, "chiave mancante")
                return
            with open(UI, "rb") as fh:
                corpo = fh.read().replace(b"__CHIAVE__", CHIAVE.encode())
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(corpo)))
            self.end_headers()
            self.wfile.write(corpo)
            return

        if not self._autorizzato(query):
            self._json({"errore": "non autorizzato"}, 403)
            return

        if percorso == "/api/stato":
            env = leggi_env()
            arch = archivio()
            docs = arch["documenti"]
            self._json({
                "secrets": {c: mascherato(env.get(c)) for c in CHIAVI},
                "launchd": stato_launchd(),
                "orari": orari_previsti(),
                "documenti": len(docs),
                "ultimo_controllo": arch.get("ultimo_controllo"),
                "ultimo_battito": arch.get("ultimo_battito"),
                "in_sospeso": sum(1 for d in docs if not d.get("notificato", True)),
                "piu_recente": docs[0]["data"] if docs else None,
            })
        elif percorso == "/api/documenti":
            self._json(archivio()["documenti"])
        elif percorso == "/api/log":
            self._json({"testo": coda_log()})
        else:
            self._json({"errore": "non trovato"}, 404)

    def do_POST(self):
        percorso, _, stringa = self.path.partition("?")
        if not self._autorizzato(urllib.parse.parse_qs(stringa)):
            self._json({"errore": "non autorizzato"}, 403)
            return
        lunghezza = int(self.headers.get("Content-Length") or 0)
        try:
            corpo = json.loads(self.rfile.read(lunghezza) or b"{}")
        except json.JSONDecodeError:
            self._json({"errore": "richiesta illeggibile"}, 400)
            return

        if percorso == "/api/secrets":
            scrivi_env(corpo)
            self._json({"ok": True})
        elif percorso == "/api/azione":
            self._json(esegui(corpo.get("azione", "")))
        elif percorso == "/api/launchd":
            self._json(cambia_launchd(bool(corpo.get("accendi"))))
        elif percorso == "/api/spegni":
            self._json({"ok": True})
            threading.Thread(target=self.server.shutdown, daemon=True).start()
        else:
            self._json({"errore": "non trovato"}, 404)


def porta_libera(preferita=8787):
    for porta in range(preferita, preferita + 20):
        with socket.socket() as s:
            if s.connect_ex(("127.0.0.1", porta)) != 0:
                return porta
    return 0


def gia_acceso():
    """Se un pannello e' gia' in ascolto, restituisce il suo indirizzo.

    Senza questo controllo un secondo doppio clic aprirebbe un secondo
    server su un'altra porta, con una chiave diversa: due pannelli vivi e
    nessun modo ovvio di capire quale sia quale.
    """
    if not os.path.exists(SEGNALIBRO):
        return None
    try:
        with open(SEGNALIBRO, encoding="utf-8") as fh:
            url = fh.read().strip()
        porta = int(url.split("127.0.0.1:")[1].split("/")[0])
    except (OSError, ValueError, IndexError):
        return None
    with socket.socket() as s:
        s.settimeout(1)
        return url if s.connect_ex(("127.0.0.1", porta)) == 0 else None


def main():
    attivo = gia_acceso()
    if attivo:
        print("Il pannello era gia' acceso: riapro quello.", flush=True)
        webbrowser.open(attivo)
        return

    porta = porta_libera()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", porta), Pannello)
    url = f"http://127.0.0.1:{porta}/?k={CHIAVE}"
    print("Pannello circolari acceso.", flush=True)
    print(f"  {url}", flush=True)
    print("  Chiudi questa finestra o premi Ctrl-C per spegnerlo.", flush=True)
    os.makedirs(CONF, exist_ok=True)
    with open(SEGNALIBRO, "w", encoding="utf-8") as fh:
        fh.write(url)

    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        try:
            os.remove(SEGNALIBRO)
        except OSError:
            pass
    print("\nPannello spento.", flush=True)


if __name__ == "__main__":
    main()
