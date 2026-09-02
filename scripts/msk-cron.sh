#!/bin/bash
#
# Wrapper für die Cron-Jobs von msk-paste.
#
# ── Warum es das gibt ───────────────────────────────────────────────────────
#
# Anders als beim Shortener lief der Cleanup hier durchgehend, zuletzt am
# 02.09.2026, und hat auch schon abgelaufene Pastes gelöscht. Es wird also
# nichts repariert. Umgestellt wird die **Form** des Aufrufs, weil sie die
# Schwäche hat, die anderswo bereits Schaden angerichtet hat.
#
# Die bisherige Crontab-Zeile war:
#
#   cd /opt/msk-paste && /usr/bin/npx tsx scripts/cleanup.ts >> LOG 2>&1
#
# Zwei Dinge daran:
#
# Die Umleitung hängt nur am **letzten** Kommando der Kette. Scheitert das `cd`
# oder das Laden der Umgebung, geht der Fehler nicht ins Log, sondern in die
# Cron-Mail, und die Logdatei sieht unverändert aus statt kaputt. Genau so
# lagen bei msk-shop am 29.08.2026 drei Jobs drei Tage still, ohne dass
# irgendwo etwas Auffälliges stand.
#
# Und `npx` greift zum Netz, wenn das Paket lokal fehlt. Heute liegt `tsx`
# unter `node_modules/.bin`, weil der Deploy es mit `npm install --no-save`
# holt. Fehlt es einmal, soll der Job laut und sofort scheitern und nicht
# stillschweigend etwas aus der Registry nachladen.
#
# ── Wie der Alarm funktioniert ──────────────────────────────────────────────
#
# Die ursprünglichen Kanäle von Cron werden auf 3 und 4 gerettet, bevor stdout
# ins Log umgebogen wird. Läuft der Job durch, schreibt der Wrapper nichts auf
# Kanal 3, Cron sieht keine Ausgabe und verschickt keine Mail. Erst ein
# Fehlschlag erzeugt eine Zusammenfassung, und die wird zur Mail an das
# `MAILTO` der Crontab.
#
# Eine Mail bedeutet damit, dass etwas kaputt ist. Ein täglicher Bericht, den
# niemand liest, deckt einen Stillstand genauso wenig auf wie gar keine Mail.
#
# ── Aufruf ──────────────────────────────────────────────────────────────────
#
#   /opt/msk-paste/scripts/msk-cron.sh cleanup
#
# Läuft als root aus der Crontab. Die Datei liegt im Repo und wird mit jedem
# Deploy aktualisiert. Baugleich mit msk-shortener/scripts/msk-cron.sh; wer
# eine ändert, sieht bitte in die andere.

set -uo pipefail

BASE=/opt/msk-paste
NODE_BIN=/usr/bin/node
TSX="$BASE/node_modules/.bin/tsx"

# Allow-list statt freier Skriptname. Der Wrapper läuft als root aus der
# Crontab; ein durchgereichter Pfad wäre eine Einladung, und ein Tippfehler
# würde sonst als "kann Datei nicht finden" enden statt als klarer Fehler.
case "${1:-}" in
  cleanup) JOB="$1" ;;
  *)
    echo "Aufruf: $0 {cleanup}" >&2
    exit 64   # EX_USAGE
    ;;
esac

LOG="/var/log/msk-paste-${JOB}.log"

# Originale Kanäle sichern, BEVOR umgeleitet wird. Auf 3 landet später nur der
# Fehlerfall, und genau daraus macht Cron die Mail.
exec 3>&1 4>&2
exec >> "$LOG" 2>&1

started=$(date -Is)
echo "=== $started  start $JOB (pid $$)"

fail() {
  local rc="$1" msg="$2"
  echo "=== $(date -Is)  ENDE $JOB FEHLGESCHLAGEN rc=$rc: $msg"
  {
    echo "Cron-Job '$JOB' auf $(hostname -f) fehlgeschlagen."
    echo "Beginn:    $started"
    echo "Ende:      $(date -Is)"
    echo "Exit-Code: $rc"
    echo "Grund:     $msg"
    echo "Log:       $LOG"
    echo
    echo "--- letzte 40 Zeilen ---"
    tail -n 40 "$LOG"
  } >&3
  exit "$rc"
}

# ── Voraussetzungen ─────────────────────────────────────────────────────────
#
# cleanup.ts lädt seine .env selbst über `process.cwd()`, deshalb muss der
# Wrapper ins Anwendungsverzeichnis wechseln. Ein fehlgeschlagenes `cd` ist
# genau der Fall, der in der alten Kette keine Spur hinterlassen hätte.
cd "$BASE" || fail 72 "$BASE nicht erreichbar"        # EX_OSFILE

if [ ! -r "$BASE/.env" ]; then
  fail 78 "$BASE/.env ist nicht lesbar"               # EX_CONFIG
fi

# tsx kommt aus `npm install --no-save tsx` im Deploy und liegt deshalb nicht
# in der Lockfile. Fehlt es, ist der Deploy unvollständig, und das soll laut
# gesagt werden statt in einem npx-Netzabruf zu enden.
if [ ! -x "$TSX" ]; then
  fail 72 "$TSX fehlt (Deploy unvollstaendig?)"
fi

SCRIPT="$BASE/scripts/${JOB}.ts"
if [ ! -f "$SCRIPT" ]; then
  fail 72 "$SCRIPT fehlt"
fi

# ── Job ausführen ───────────────────────────────────────────────────────────
"$NODE_BIN" "$TSX" "$SCRIPT"
rc=$?

if [ "$rc" -ne 0 ]; then
  fail "$rc" "das Skript endete mit einem Fehler"
fi

echo "=== $(date -Is)  ende $JOB rc=0"
exit 0
