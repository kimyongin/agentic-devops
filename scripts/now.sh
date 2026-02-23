#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"

if command -v python &>/dev/null; then
    python "$DIR/now.py"
elif command -v python3 &>/dev/null; then
    python3 "$DIR/now.py"
elif command -v node &>/dev/null; then
    node "$DIR/now.js"
else
    echo "Error: python or node required" >&2
    exit 1
fi
