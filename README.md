# FieldKit — Offline Data Collector

A fully offline-capable Progressive Web App (PWA) for collecting field data in remote areas.

## Features

### 📴 Offline-first
- Works 100% without internet using Service Worker + LocalStorage
- All data stays on device until you choose to sync
- Visual online/offline indicator in real time

### 📊 Data collection formats
- **Photos** — camera capture or gallery upload
- **Audio** — voice memos with real-time recording
- **Numeric** — structured measurements with labels and units
- **Checklists** — inspection lists with pass/fail states
- **Sketches** — freehand drawings on canvas
- **Barcodes / QR** — scan or manual entry
- **GPS** — automatic coordinate capture with accuracy
- **Free text notes** — with priority rating

### 👥 Multi-user support
- Switch between team users on the same device
- Each record tagged with the collecting user
- Add/manage team members in the Team tab

### 🔄 Sync & upload
- Syncs to any HTTP REST endpoint when online
- Supports API key / Bearer token auth
- Export to JSON or CSV for offline file transfer
- Sync log shows per-record status

---

## Deployment

### Option A: Static file hosting (recommended)
Upload all 3 files to any static host:
```
index.html
sw.js
manifest.json
```

Works on: **GitHub Pages, Netlify, Vercel, AWS S3+CloudFront, any web server**

### Option B: Local hosting (USB stick / LAN)
Run locally with Python:
```bash
cd fieldkit/
python3 -m http.server 8080
# Open: http://localhost:8080
```

Or with Node.js:
```bash
npx serve .
```

### Option C: Android/iOS install (PWA)
1. Open the URL in Chrome (Android) or Safari (iOS)
2. Tap "Add to Home Screen"
3. App installs like a native app, works fully offline

---

## Central sync server (backend)

FieldKit POSTs records as JSON to your endpoint:

```json
{
  "id": "r_1234567890",
  "title": "Site A water sample",
  "category": "Water Quality",
  "user": "John Doe",
  "priority": "4",
  "gps": { "lat": "14.59950", "lon": "120.98420", "acc": "±8m" },
  "notes": "Turbidity high, odor detected",
  "attachments": [
    { "type": "numeric", "data": [{"label":"pH","value":"6.8","unit":""}] },
    { "type": "photo", "data": "data:image/jpeg;base64,..." }
  ],
  "ts": 1700000000000,
  "syncStatus": "pending",
  "deviceId": "dev_abc123"
}
```

### Minimal Node.js receiver:
```javascript
const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));

app.post('/api/upload', (req, res) => {
  const record = req.body;
  // Save to DB: MongoDB, PostgreSQL, SQLite, etc.
  console.log('Received:', record.title, 'from', record.user);
  res.json({ ok: true, id: record.id });
});

app.listen(3000);
```

### Google Sheets (no-code):
Use **Make.com** or **n8n** webhook → Google Sheets row for a zero-code central database.

---

## Field tips

1. **Enable GPS** before going into the field to pre-warm location services
2. **Add users** in the Team tab before deploying — users switch on-device, no login required
3. **Export CSV** as a backup before attempting sync in low-signal areas
4. Sync automatically runs when internet is detected (banner appears on Dashboard)
5. Records stored in browser LocalStorage — do NOT clear browser data until synced

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| App shell | Vanilla HTML/CSS/JS (zero dependencies) |
| Offline | Service Worker + Cache API |
| Storage | LocalStorage (works in all browsers) |
| Media | MediaRecorder API (audio), Canvas API (sketch), FileReader (photos) |
| GPS | Geolocation API |
| PWA | Web App Manifest |
| Sync | Fetch API to any REST endpoint |
| Export | Blob + download link |
