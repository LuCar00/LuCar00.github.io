#!/usr/bin/env python3
"""
Disegna l'icona del pannello e la impacchetta in .icns.

Scrive il PNG a mano (zlib + struct): non ci sono librerie grafiche a
disposizione e non ne vogliamo. Il ridimensionamento e il pacchetto .icns li
fanno sips e iconutil, che su macOS ci sono gia'.

  python3 fai-icona.py [cartella-di-destinazione]
"""

import os
import struct
import subprocess
import sys
import zlib

LATO = 1024
SFONDO = (0x24, 0x21, 0x1d)      # bruno scuro caldo
CARTA = (0xf5, 0xf0, 0xe8)       # crema
SEGNO = (0x9a, 0x2a, 0x1f)       # rosso, le righe del foglio
CAMPIONI = 3                     # supercampionamento per i bordi


def scrivi_png(percorso, larghezza, altezza, righe):
    grezzo = b"".join(b"\x00" + bytes(righe[y]) for y in range(altezza))

    def pezzo(tipo, dati):
        corpo = tipo + dati
        return (struct.pack(">I", len(dati)) + corpo
                + struct.pack(">I", zlib.crc32(corpo) & 0xffffffff))

    testata = struct.pack(">IIBBBBB", larghezza, altezza, 8, 6, 0, 0, 0)
    with open(percorso, "wb") as fh:
        fh.write(b"\x89PNG\r\n\x1a\n")
        fh.write(pezzo(b"IHDR", testata))
        fh.write(pezzo(b"IDAT", zlib.compress(grezzo, 9)))
        fh.write(pezzo(b"IEND", b""))


def dentro_rettangolo(x, y, sx, sy, dx, dy, raggio):
    """Distanza con segno da un rettangolo con gli angoli arrotondati."""
    cx = min(max(x, sx + raggio), dx - raggio)
    cy = min(max(y, sy + raggio), dy - raggio)
    if cx == x and cy == y:
        return -1.0
    return ((x - cx) ** 2 + (y - cy) ** 2) ** 0.5 - raggio


def disegna():
    m = LATO * 0.09                      # margine: le icone macOS non toccano il bordo
    fx0, fy0, fx1, fy1 = m, m, LATO - m, LATO - m
    raggio_sfondo = LATO * 0.21

    dw, dh = LATO * 0.34, LATO * 0.44
    dx0, dy0 = (LATO - dw) / 2, (LATO - dh) / 2 - LATO * 0.01
    dx1, dy1 = dx0 + dw, dy0 + dh
    raggio_doc = LATO * 0.035

    righe_y = [dy0 + dh * q for q in (0.30, 0.48, 0.66)]
    riga_h = LATO * 0.022
    riga_x0, riga_x1 = dx0 + dw * 0.17, dx1 - dw * 0.17

    buffer = []
    passo = 1.0 / CAMPIONI
    for py in range(LATO):
        riga = bytearray()
        for px in range(LATO):
            r = g = b = a = 0.0
            for sy in range(CAMPIONI):
                for sx in range(CAMPIONI):
                    x = px + (sx + 0.5) * passo
                    y = py + (sy + 0.5) * passo
                    if dentro_rettangolo(x, y, fx0, fy0, fx1, fy1, raggio_sfondo) > 0:
                        continue                      # fuori dall'icona
                    colore = SFONDO
                    if dentro_rettangolo(x, y, dx0, dy0, dx1, dy1, raggio_doc) <= 0:
                        colore = CARTA
                        for ry in righe_y:
                            if ry <= y <= ry + riga_h and riga_x0 <= x <= riga_x1:
                                colore = SEGNO
                                break
                    r += colore[0]; g += colore[1]; b += colore[2]; a += 255
            n = CAMPIONI * CAMPIONI
            if a == 0:
                riga += bytes((0, 0, 0, 0))
            else:
                # i canali colore sono gia' premoltiplicati sul numero di
                # campioni coperti, quindi si dividono per quelli, non per n
                coperti = a / 255.0
                riga += bytes((round(r / coperti), round(g / coperti),
                               round(b / coperti), round(a / n)))
        buffer.append(riga)
    return buffer


def main():
    destinazione = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(
        os.path.abspath(__file__))
    png = os.path.join(destinazione, "icona.png")
    print("disegno…", flush=True)
    scrivi_png(png, LATO, LATO, disegna())

    iconset = os.path.join(destinazione, "icona.iconset")
    os.makedirs(iconset, exist_ok=True)
    for lato in (16, 32, 64, 128, 256, 512, 1024):
        for nome in (f"icon_{lato}x{lato}.png", f"icon_{lato//2}x{lato//2}@2x.png"):
            if nome.startswith("icon_8x8"):
                continue
            subprocess.run(["sips", "-z", str(lato), str(lato), png,
                            "--out", os.path.join(iconset, nome)],
                           capture_output=True, check=True)
    icns = os.path.join(destinazione, "icona.icns")
    subprocess.run(["iconutil", "-c", "icns", iconset, "-o", icns], check=True)
    subprocess.run(["rm", "-rf", iconset], check=True)
    print("fatto:", icns)


if __name__ == "__main__":
    main()
