# Music Sources (High Level)

Goal
- Allow external streaming tracks to be used by the minimal, premium music player.

Shape (illustrative)
- An ordered list of tracks; each with a URL and friendly title. Duration and cover are optional.

Example (JSON)
```
[
  { "url": "https://cdn.example.com/ambient/nocturne.mp3", "title": "Nocturne in Glass", "duration": 184 },
  { "url": "https://cdn.example.com/ambient/aurora.mp3",   "title": "Aurora Drift" },
  { "url": "https://cdn.example.com/ambient/pearl.mp3",     "title": "Pearl Horizon", "cover": "https://cdn.example.com/covers/pearl.jpg" }
]
```

Notes
- Metadata is displayed when available (title, index/total, duration). If duration is unknown, the UI degrades gracefully.
- Streaming should be progressive and resilient to network hiccups; the UI stays responsive.
- The track list should be declarative/configurable (e.g., a JSON file or environment configuration) without code changes.
- The player remembers last track and volume and does not auto‑start without a user gesture.
