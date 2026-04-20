#!/usr/bin/env bash
# Корень проекта = эта папка (landings). Внутри — landing1, landing2, …
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8080}"
echo "http://127.0.0.1:${PORT}/  — хаб, /landing1/ и т.д."
python3 -m http.server "$PORT"
