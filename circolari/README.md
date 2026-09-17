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

Un terzo secret, **facoltativo**, separa i due tipi di messaggio:

| Secret | Chi lo riceve |
|---|---|
| `TELEGRAM_CHAT_ID` | Le nuove circolari. Di norma il canale condiviso con gli altri genitori. |
| `TELEGRAM_HEARTBEAT_ID` | Il battito del lunedi'. Di norma solo la chat personale: nel canale sarebbe rumore. |

Se `TELEGRAM_HEARTBEAT_ID` non e' impostato, il battito va agli stessi
destinatari delle circolari. Entrambi accettano **piu' id separati da virgola**.

Sono solo secret: cambiarli basta a spostare i messaggi altrove, senza toccare
il codice.

### Pubblicare su un canale

1. Telegram → nuovo canale, privato (non compare nelle ricerche).
2. Info canale → Amministratori → aggiungi il bot, lasciando attivo
   **Pubblica messaggi**. Senza quel permesso il bot non puo' scrivere.
3. Scrivere un messaggio qualsiasi nel canale.
4. Riaprire `https://api.telegram.org/bot<TOKEN>/getUpdates` e cercare
   `"channel_post"`: l'id del canale e' un numero negativo che inizia per
   `-100`. Se ci sono piu' voci, guardare **l'ultima**.
5. Mettere quell'id in `TELEGRAM_CHAT_ID` e il proprio in
   `TELEGRAM_HEARTBEAT_ID`.

Il bot non puo' scrivere a una persona che non ha prima premuto *Avvia* sul
bot: per condividere con altri genitori il canale e' l'unica strada comoda.

Senza i due secret lo script continua a funzionare: aggiorna la pagina e salta
solo l'invio della notifica.

## Pannello

Doppio clic su **Circolari** sulla Scrivania (oppure su
`Pannello circolari.command`, che fa lo stesso da dentro la cartella):
apre una paginetta nel browser
per gestire token e id, lanciare le prove, leggere il log e sfogliare
l'archivio, senza passare dal Terminale.

Gira solo su `127.0.0.1`, con una chiave di sessione diversa a ogni avvio:
senza quella chiave nemmeno un'altra pagina aperta nel browser puo' parlarci.
I valori gia' salvati non vengono mai rimandati al browser, solo le ultime
cifre. Si spegne dal bottone **Chiudi il pannello**. Un secondo doppio clic non
avvia un secondo server: riapre quello gia' acceso.

L'app sulla Scrivania e' un guscio di poche righe che punta a questa
cartella. Se la cartella del progetto cambia posto, o se l'app finisce nel
cestino, si rifa' con `bash _src/fai-app.sh`; l'icona con
`python3 _src/fai-icona.py`.

## Uso manuale

```bash
python3 _src/check.py              # run normale, 3 pagine
python3 _src/check.py --full       # rilegge tutto l'archivio (25 pagine)
python3 _src/check.py --no-notify  # non manda niente su Telegram
python3 _src/check.py --test       # notifica di prova, non tocca nulla
python3 _src/check.py --heartbeat # manda subito il riepilogo settimanale
```

## Battito settimanale

Ogni **lunedi'**, al primo dei cinque controlli, arriva su Telegram un
riepilogo: data dell'ultimo controllo, numero di documenti in archivio e
ultima circolare vista. Se un lunedi' non arriva, il monitor si e' fermato.

Copre l'unico guasto che resterebbe altrimenti invisibile: se la scuola
cambiasse gli id delle categorie, lo script girerebbe senza errori ma non
troverebbe mai piu' nulla. Il conteggio dei documenti nel messaggio rende
evidente quel caso, perche' smetterebbe di crescere durante l'anno.

Il campo `ultimo_battito` in `archivio.json` evita che il messaggio si ripeta
negli altri quattro controlli del lunedi'.

## Verificare che le notifiche arrivino

**Actions → Monitor circolari scuola → Run workflow**, poi scegliere dal menu:

| Scelta | Cosa fa |
|---|---|
| `controllo` | Controllo normale fuori orario. Nessun messaggio se non c'e' niente di nuovo. |
| `prova-circolare` | Manda la circolare piu' recente, marcata come prova, a **tutti** i recapiti configurati (canale compreso: e' il modo di verificare che il bot possa postarci). |
| `prova-riepilogo` | Manda subito il riepilogo del lunedi', a chi lo riceve di norma. |

Nessuna delle due prove modifica archivio o pagina.

Nessuna dipendenza: solo la standard library di Python 3.

## Manutenzione

Se la scuola cambia piattaforma o Spaggiari cambia struttura, lo script si ferma
con `payload Inertia non trovato` invece di salvare dati vuoti. Gli id delle
categorie sono in cima a `check.py`, nella costante `WATCHED`.
