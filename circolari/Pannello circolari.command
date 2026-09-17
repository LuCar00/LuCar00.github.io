#!/bin/bash
# Doppio clic per aprire il pannello. Si chiude chiudendo questa finestra.
cd "$(dirname "$0")" || exit 1
exec /usr/bin/python3 _src/app.py
