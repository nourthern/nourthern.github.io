#!/bin/sh
cd "$(dirname "$0")"
open "http://localhost:8765/index.html" 2>/dev/null || true
python3 -m http.server 8765
