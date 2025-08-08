# japan-3d-cartoon-map
It is an interactive map of Japan that Chatgpt 5 made
# Japan — Cartoon 3D Route Planner (Three.js)

A simple, **cartoon-like 3D model of Japan** with oversized landmarks (Mount Fuji, Tokyo Tower, torii gates, Osaka Castle, Nara deer, etc.) and an **interactive route planner** between major cities. Built with Three.js and plain HTML/JS so it runs locally.

> ⚠️ This is a stylized visualization for planning vibes — not a geospatially accurate map. Distances are approximate.

## Features
- 3D islands (Hokkaido, Honshu, Shikoku, Kyushu, Okinawa) in a cute cartoon style.
- Exaggerated landmarks to emphasize popular attractions.
- Click city markers or use the dropdowns to draw a curved route.
- Auto-rotating camera option; drag to orbit, scroll to zoom, right-drag to pan.
- Works with any static server (no build step).

## How to run (VS Code)
1. Open this folder in VS Code.
2. Install the **Live Server** extension by Ritwick Dey (if you don't already have it).
3. Right-click `index.html` → **Open with Live Server**.
4. Your browser will open at `http://127.0.0.1:5500` (or similar). Enjoy!

### Alternative (Python)
```bash
cd Japan3D-Cartoon-Map
python3 -m http.server 8080
# open http://localhost:8080 in a browser
