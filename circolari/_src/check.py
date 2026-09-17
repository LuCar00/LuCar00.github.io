#!/usr/bin/env python3
"""
Monitor delle circolari pubblicate dall'IC Locatelli-Quasimodo su Spaggiari.

Tiene traccia dei soli documenti classificati "Famiglie" e/o "Alunni",
manda una notifica Telegram per ogni novita' e rigenera la pagina HTML.

TELEGRAM_CHAT_ID accetta un id singolo oppure piu' id separati da virgola
(es. "123456,-1001234567890" per notificare se stessi e un canale).

Nessuna dipendenza esterna: solo standard library.

Uso:
  python3 check.py              run normale (3 pagine, notifica le novita')
  python3 check.py --full       crawl completo dell'archivio
  python3 check.py --no-notify  non manda niente su Telegram (seed iniziale)
  python3 check.py --test       invia una notifica di prova e basta
  python3 check.py --heartbeat  invia subito il riepilogo settimanale
"""

import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

# --- configurazione -------------------------------------------------------

CUSTCODE = "MIME0093"
BASE_URL = f"https://web.spaggiari.eu/sdg2/Comunicati/{CUSTCODE}"

# id delle categorie da sorvegliare (vedi props.categorie nella pagina)
WATCHED = {30001: "Alunni", 30003: "Famiglie"}

PAGES_QUICK = 3          # pagine lette a ogni run normale (10 doc/pagina)
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) circolari-monitor"

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.dirname(HERE)                  # cartella circolari/
ARCHIVE = os.path.join(HERE, "archivio.json")    # storico dei doc gia' visti
PAGE = os.path.join(OUT_DIR, "index.html")

ROME = timezone(timedelta(hours=2))              # solo per l'etichetta "aggiornato"


# --- fetch ----------------------------------------------------------------

def fetch_page(page):
    """Scarica una pagina dell'elenco e ne estrae il JSON Inertia."""
    url = BASE_URL if page == 1 else f"{BASE_URL}?page={page}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                raw = resp.read().decode("utf-8", "replace")
            break
        except (urllib.error.URLError, TimeoutError) as err:
            if attempt == 2:
                raise SystemExit(f"errore di rete su {url}: {err}")
            time.sleep(3 * (attempt + 1))

    match = re.search(r'data-page="(.*?)"\s*>', raw, re.S)
    if not match:
        raise SystemExit(f"payload Inertia non trovato in {url} (il sito e' cambiato?)")
    return json.loads(html.unescape(match.group(1)))["props"]["documenti"]


def normalize(entry):
    """Riduce un documento del payload ai campi che ci servono."""
    doc = entry.get("documento") or {}
    prot = entry.get("protocollo") or doc.get("protocollo") or {}
    cats = entry.get("categorie") or []

    titolo = (prot.get("oggetto") or doc.get("nome_file_origine") or "").strip()
    titolo = re.sub(r"\.pdf$", "", titolo, flags=re.I)

    return {
        "id": entry.get("id"),
        "titolo": titolo or "(senza titolo)",
        "data": entry.get("data_pubblicazione") or "",
        "tipo": ((doc.get("tipo") or {}).get("description") or "").strip(),
        "link": doc.get("url") or "",
        "categorie": sorted({c.get("descrizione_class") for c in cats if c.get("descrizione_class")}),
        "watched": sorted({WATCHED[c["id"]] for c in cats if c.get("id") in WATCHED}),
    }


def collect(full=False):
    """Restituisce i documenti Famiglie/Alunni piu' recenti."""
    first = fetch_page(1)
    pages = first["last_page"] if full else min(PAGES_QUICK, first["last_page"])

    entries = list(first["data"])
    for page in range(2, pages + 1):
        entries.extend(fetch_page(page)["data"])
        time.sleep(0.5)          # gentile con il server della scuola

    keep = []
    for entry in entries:
        item = normalize(entry)
        if item["watched"] and item["id"] is not None:
            keep.append(item)
    return keep


# --- archivio -------------------------------------------------------------

def sort_key(item):
    """Ordina per data di pubblicazione decrescente, id come spareggio."""
    try:
        day, month, year = item["data"].split("/")
        stamp = f"{year}{month}{day}"
    except ValueError:
        stamp = "00000000"
    return (stamp, item["id"] or 0)


def load_archive():
    if not os.path.exists(ARCHIVE):
        return {"documenti": [], "ultimo_controllo": None}
    with open(ARCHIVE, encoding="utf-8") as fh:
        return json.load(fh)


def save_archive(data):
    with open(ARCHIVE, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=1)
        fh.write("\n")


# --- telegram -------------------------------------------------------------

def telegram_targets():
    """Lista dei destinatari. TELEGRAM_CHAT_ID accetta piu' id separati da virgola."""
    raw = os.environ.get("TELEGRAM_CHAT_ID", "")
    return [t.strip() for t in raw.split(",") if t.strip()]


def send_to(token, chat, testo):
    payload = urllib.parse.urlencode({
        "chat_id": chat,
        "text": testo,
        "parse_mode": "HTML",
        "disable_web_page_preview": "true",
    }).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage", data=payload)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            return bool(json.load(resp).get("ok"))
    except urllib.error.HTTPError as err:
        dettaglio = err.read().decode("utf-8", "replace")[:200]
        print(f"   {chat}: Telegram ha risposto {err.code} \u2014 {dettaglio}")
    except urllib.error.URLError as err:
        print(f"   {chat}: Telegram irraggiungibile \u2014 {err}")
    return False


def notify(item, prova=False):
    """Manda la notifica a tutti i destinatari configurati.

    Restituisce True se almeno uno ha ricevuto, oppure se Telegram non e'
    configurato (in quel caso non ha senso accumulare un arretrato di invii).
    Con prova=True il messaggio e' marcato come test, cosi' non viene scambiato
    per una circolare appena pubblicata.
    """
    token = os.environ.get("TELEGRAM_TOKEN")
    chats = telegram_targets()
    if not token or not chats:
        print("   (Telegram non configurato, notifica saltata)")
        return True

    intestazione = (
        "\U0001F9EA <b>Messaggio di prova</b>\n"
        "Se lo stai leggendo, il collegamento funziona. "
        "Questa circolare non e' nuova, e' solo la piu' recente in archivio.\n\n"
        "\u2500\u2500\u2500\n\n"
    ) if prova else ""

    tag = " + ".join(item["watched"])
    testo = (
        f"{intestazione}"
        f"\U0001F4C4 <b>Nuova circolare \u2014 {html.escape(tag)}</b>\n\n"
        f"{html.escape(item['titolo'])}\n\n"
        f"<i>Pubblicata il {html.escape(item['data'])}</i>\n"
        f'<a href="{html.escape(item["link"])}">Apri il PDF</a>'
    )

    esiti = [send_to(token, chat, testo) for chat in chats]
    riusciti = sum(esiti)
    if riusciti:
        print(f"   notifica inviata a {riusciti}/{len(chats)} destinatari")
    return riusciti > 0


# --- pagina ---------------------------------------------------------------

def render(data):
    docs = data["documenti"]
    aggiornato = data.get("ultimo_controllo") or ""

    def card(item):
        tags = "".join(
            f'<span class="tag tag-{t.lower()}">{html.escape(t)}</span>'
            for t in item["watched"])
        altre = [c for c in item["categorie"] if c not in item["watched"]]
        altre_html = "".join(
            f'<span class="tag tag-altro">{html.escape(c)}</span>' for c in altre)
        return f"""      <li class="doc" data-cats="{html.escape(' '.join(item['watched']))}">
        <a class="doc-link" href="{html.escape(item['link'])}" target="_blank" rel="noopener">
          <time datetime="{html.escape(item['data'])}">{html.escape(item['data'])}</time>
          <span class="doc-title">{html.escape(item['titolo'])}</span>
          <span class="tags">{tags}{altre_html}</span>
        </a>
      </li>"""

    voci = "\n".join(card(d) for d in docs) or \
        '      <li class="vuoto">Nessuna circolare registrata per ora.</li>'

    return f"""<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Circolari — Famiglie e Alunni</title>
<style>
  :root {{
    --bg: #fbfaf8;
    --surface: #ffffff;
    --border: #e6e2db;
    --text: #1c1b19;
    --muted: #6f6a62;
    --accent: #9a2a1f;
    --famiglie: #2f5d50;
    --famiglie-bg: #e6efec;
    --alunni: #1f4d7a;
    --alunni-bg: #e4edf5;
    --altro: #6f6a62;
    --altro-bg: #efece7;
  }}
  @media (prefers-color-scheme: dark) {{
    :root:not([data-theme="light"]) {{
      --bg: #151413;
      --surface: #1e1d1b;
      --border: #333029;
      --text: #f2efea;
      --muted: #a09a90;
      --accent: #e0705f;
      --famiglie: #8fc9b6;
      --famiglie-bg: #21332d;
      --alunni: #93bde0;
      --alunni-bg: #1e2d3b;
      --altro: #a09a90;
      --altro-bg: #2a2723;
    }}
  }}
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0;
    padding: 0 16px 64px;
    background: var(--bg);
    color: var(--text);
    font: 16px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }}
  .wrap {{ max-width: 760px; margin: 0 auto; }}
  header {{ padding: 40px 0 24px; border-bottom: 1px solid var(--border); }}
  h1 {{ margin: 0 0 6px; font-size: 26px; letter-spacing: -0.02em; }}
  .sub {{ margin: 0; color: var(--muted); font-size: 14px; }}
  .filtri {{ display: flex; gap: 8px; flex-wrap: wrap; padding: 20px 0 4px; }}
  .filtro {{
    border: 1px solid var(--border); background: var(--surface); color: var(--text);
    border-radius: 999px; padding: 7px 15px; font-size: 14px; cursor: pointer;
    font-family: inherit; min-height: 36px;
  }}
  .filtro[aria-pressed="true"] {{ background: var(--text); color: var(--bg); border-color: var(--text); }}
  .filtro:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
  ul {{ list-style: none; margin: 16px 0 0; padding: 0; }}
  .doc + .doc {{ margin-top: 8px; }}
  .doc-link {{
    display: grid; gap: 6px; padding: 16px 18px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    text-decoration: none; color: inherit;
  }}
  .doc-link:hover {{ border-color: var(--accent); }}
  .doc-link:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
  time {{ font-size: 13px; color: var(--muted); font-variant-numeric: tabular-nums; }}
  .doc-title {{ font-weight: 600; line-height: 1.35; }}
  .tags {{ display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }}
  .tag {{ font-size: 12px; padding: 3px 9px; border-radius: 999px; font-weight: 600; }}
  .tag-famiglie {{ color: var(--famiglie); background: var(--famiglie-bg); }}
  .tag-alunni {{ color: var(--alunni); background: var(--alunni-bg); }}
  .tag-altro {{ color: var(--altro); background: var(--altro-bg); font-weight: 500; }}
  .vuoto {{ color: var(--muted); padding: 32px 0; text-align: center; }}
  footer {{ margin-top: 40px; color: var(--muted); font-size: 13px; }}
  footer a {{ color: inherit; }}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Circolari — Famiglie e Alunni</h1>
    <p class="sub">IC Locatelli-Quasimodo · {len(docs)} documenti · aggiornato {html.escape(aggiornato)}</p>
  </header>

  <div class="filtri" role="group" aria-label="Filtra per categoria">
    <button class="filtro" data-f="tutti" aria-pressed="true">Tutti</button>
    <button class="filtro" data-f="Famiglie" aria-pressed="false">Famiglie</button>
    <button class="filtro" data-f="Alunni" aria-pressed="false">Alunni</button>
  </div>

  <ul id="elenco">
{voci}
  </ul>

  <footer>
    Fonte: <a href="{BASE_URL}" target="_blank" rel="noopener">albo comunicati su Spaggiari</a>.
    Pagina rigenerata automaticamente cinque volte al giorno.
  </footer>
</div>

<script>
  const bottoni = document.querySelectorAll('.filtro');
  const voci = document.querySelectorAll('.doc');
  bottoni.forEach(b => b.addEventListener('click', () => {{
    bottoni.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const f = b.dataset.f;
    voci.forEach(v => {{
      v.hidden = f !== 'tutti' && !v.dataset.cats.split(' ').includes(f);
    }});
  }}));
</script>
</body>
</html>
"""


# --- main -----------------------------------------------------------------

def run_test():
    """Manda una notifica di prova con la circolare piu' recente.

    Non tocca l'archivio ne' la pagina: serve solo a verificare che token,
    chat id e permessi del bot siano a posto, senza aspettare che la scuola
    pubblichi qualcosa.
    """
    if not os.environ.get("TELEGRAM_TOKEN") or not telegram_targets():
        print("TELEGRAM_TOKEN e TELEGRAM_CHAT_ID non sono impostati: niente da provare.")
        print("In locale: TELEGRAM_TOKEN=... TELEGRAM_CHAT_ID=... python3 check.py --test")
        return 1

    documenti = load_archive()["documenti"] or collect()
    if not documenti:
        print("Nessun documento disponibile per la prova.")
        return 1

    item = documenti[0]
    destinatari = telegram_targets()
    print(f"invio di prova a {len(destinatari)} destinatario/i")
    print(f"   {item['data']}  {item['titolo'][:70]}")

    if notify(item, prova=True):
        print("Fatto: controlla Telegram. L'archivio non e' stato toccato.")
        return 0
    print("Nessun invio riuscito. Controlla i messaggi di errore qui sopra.")
    return 1


def heartbeat(archivio, forzato=False):
    """Messaggio settimanale del lunedi': "sono vivo".

    Serve a coprire l'unico guasto silenzioso rimasto: se la scuola cambiasse
    gli id delle categorie, lo script continuerebbe a girare senza errori ma
    non troverebbe mai piu' niente. Il conteggio dei documenti nel messaggio
    rende visibile quel caso: se non cresce mai durante l'anno scolastico,
    qualcosa non va.

    Parte al primo run del lunedi'; `ultimo_battito` evita i doppioni negli
    altri quattro controlli della giornata.
    """
    oggi = datetime.now(ROME)
    if not forzato:
        if oggi.weekday() != 0:                       # 0 = lunedi'
            return
        if archivio.get("ultimo_battito") == oggi.strftime("%Y-%m-%d"):
            return

    token = os.environ.get("TELEGRAM_TOKEN")
    chats = telegram_targets()
    if not token or not chats:
        return

    docs = archivio["documenti"]
    ultimo = docs[0] if docs else None
    quando = archivio.get("ultimo_controllo") or "\u2014"
    testo = (
        "\U0001F7E2 <b>Il monitor e' attivo</b>\n\n"
        f"Ultimo controllo: {html.escape(quando)}\n"
        f"Documenti in archivio: <b>{len(docs)}</b>\n"
    )
    if ultimo:
        testo += (
            f"Ultima circolare: {html.escape(ultimo['data'])}\n"
            f"<i>{html.escape(ultimo['titolo'][:90])}</i>\n"
        )
    testo += (
        '\n<a href="https://lucar00.github.io/circolari/">Apri l\'elenco completo</a>\n\n'
        "<i>Messaggio automatico del lunedi'. Se un lunedi' non arriva, "
        "il monitor si e' fermato.</i>"
    )

    # list() prima di any(): any() corto-circuita al primo successo e i
    # destinatari successivi resterebbero senza messaggio.
    esiti = [send_to(token, chat, testo) for chat in chats]
    if any(esiti):
        if not forzato:
            archivio["ultimo_battito"] = oggi.strftime("%Y-%m-%d")
        print(f"   battito settimanale inviato a {sum(esiti)}/{len(esiti)} destinatari")


def da_ritentare(archivio, escludi):
    """Documenti gia' archiviati la cui notifica non e' mai andata a buon fine.

    Senza questo, un'interruzione di Telegram farebbe perdere la notifica per
    sempre: il documento risulterebbe comunque "visto" al giro successivo.
    `escludi` tiene fuori i documenti nuovi di questo giro, che sono gia' in
    coda e verrebbero altrimenti tentati due volte. Il limite ai 30 piu'
    recenti evita code infinite.
    """
    return [d for d in archivio["documenti"][:30]
            if not d.get("notificato", True) and d["id"] not in escludi]


def main():
    if "--test" in sys.argv:
        return run_test()

    if "--heartbeat" in sys.argv:
        archivio = load_archive()
        if not archivio["documenti"]:
            print("Archivio vuoto: niente da riassumere.")
            return 1
        heartbeat(archivio, forzato=True)
        return 0

    full = "--full" in sys.argv
    silent = "--no-notify" in sys.argv

    archivio = load_archive()
    visti = {d["id"]: d for d in archivio["documenti"]}
    primo_giro = not visti

    trovati = collect(full=full)
    nuovi = [d for d in trovati if d["id"] not in visti]

    print(f"letti {len(trovati)} documenti Famiglie/Alunni, {len(nuovi)} nuovi")

    # I documenti gia' presenti mantengono il loro stato di notifica.
    for item in trovati:
        if item["id"] in visti:
            item["notificato"] = visti[item["id"]].get("notificato", True)
        else:
            item["notificato"] = silent or primo_giro
        visti[item["id"]] = item

    archivio["documenti"] = sorted(visti.values(), key=sort_key, reverse=True)

    id_nuovi = {d["id"] for d in nuovi}
    arretrati = [] if (silent or primo_giro) else da_ritentare(archivio, id_nuovi)
    if arretrati:
        print(f"{len(arretrati)} notifiche rimaste indietro, le ritento")

    for item in sorted(nuovi, key=sort_key) + arretrati:
        if item.get("notificato"):
            continue
        print(f" + {item['data']}  {item['titolo'][:70]}")
        item["notificato"] = notify(item)

    if primo_giro and nuovi:
        print("   (primo popolamento dell'archivio: nessuna notifica inviata)")

    archivio["ultimo_controllo"] = datetime.now(ROME).strftime("%d/%m/%Y alle %H:%M")
    if not (silent or primo_giro):
        heartbeat(archivio)
    save_archive(archivio)

    with open(PAGE, "w", encoding="utf-8") as fh:
        fh.write(render(archivio))

    print(f"archivio: {len(archivio['documenti'])} documenti \u2014 pagina rigenerata")
    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
