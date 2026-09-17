# Monitor circolari — IC Locatelli-Quasimodo

Controlla cinque volte al giorno l'albo comunicati della scuola su Spaggiari e
segnala ogni nuovo documento classificato **Famiglie** e/o **Alunni**.

- Pagina consultabile: <https://lucar00.github.io/circolari/>
- Fonte: <https://web.spaggiari.eu/sdg2/Comunicati/MIME0093>

## Come funziona

1. GitHub Actions esegue `_src/check.py` (vedi `.github/workflows/circolari.yml`).
2. Lo script legge le prime 3 pagine dell'elenco. I dati arrivano gia' strutturati:
   la pagina Spaggiari e' un'app Inertia e incorpora il JSON dei documenti
   nell'attributo `data-page` dell'HTML, quindi non serve ne' login ne' scraping.
3. Tiene i documenti con categoria 30001 (Alunni) o 30003 (Famiglie).
4. Confronta con `_src/archivio.json`. Per ogni documento mai visto manda una
   notifica Telegram con titolo, data e link diretto al PDF.
5. Rigenera `index.html` e ricommitta archivio + pagina.

## Configurazione Telegram

Servono due secret nel repo (Settings → Secrets and variables → Actions):

| Secret | Dove si prende |
|---|---|
| `TELEGRAM_TOKEN` | Il token che [@BotFather](https://t.me/BotFather) restituisce dopo `/newbot` |
| `TELEGRAM_CHAT_ID` | Il proprio id: scrivere un messaggio al bot, poi aprire `https://api.telegram.org/bot<TOKEN>/getUpdates` e leggere `result[0].message.chat.id` |

`TELEGRAM_CHAT_ID` accetta **piu' destinatari separati da virgola**, per esempio
`123456789,-1001234567890` per ricevere la notifica in privato e insieme
pubblicarla su un canale. E' solo un secret: cambiarlo in qualsiasi momento
basta a spostare le notifiche altrove, senza toccare il codice.

Per pubblicare su un **canale**: creare il canale, aggiungere il bot come
amministratore con permesso di pubblicare, scrivere un messaggio nel canale e
rileggere `getUpdates` — l'id del canale compare come `channel_post.chat.id`
ed e' un numero negativo che inizia per `-100`.

Senza i due secret lo script continua a funzionare: aggiorna la pagina e salta
solo l'invio della notifica.

## Uso manuale

```bash
python3 _src/check.py              # run normale, 3 pagine
python3 _src/check.py --full       # rilegge tutto l'archivio (25 pagine)
python3 _src/check.py --no-notify  # non manda niente su Telegram
python3 _src/check.py --test       # notifica di prova, non tocca nulla
```

## Verificare che le notifiche arrivino

Dopo aver messo i secret, senza aspettare che la scuola pubblichi qualcosa:
**Actions → Monitor circolari scuola → Run workflow**, spuntare *"Manda una
notifica di prova"* e avviare. Manda su Telegram la circolare piu' recente
gia' in archivio, marcata come prova, e non modifica ne' archivio ne' pagina.

Senza la spunta, lo stesso pulsante fa un controllo normale fuori orario.

Nessuna dipendenza: solo la standard library di Python 3.

## Manutenzione

Se la scuola cambia piattaforma o Spaggiari cambia struttura, lo script si ferma
con `payload Inertia non trovato` invece di salvare dati vuoti. Gli id delle
categorie sono in cima a `check.py`, nella costante `WATCHED`.
