# Visit Wolaita

The official interactive tourism guide to Wolaita Zone, Southern Ethiopia.

## Overview

Visit Wolaita is a full-stack interactive tourism platform built with Node.js/Express and vanilla HTML/CSS/JS.

## Features

- Live Leaflet Map with satellite, topo, and road layers + Google Earth 3D flyover
- Kawo AI Concierge travel persona planner
- 360 Panorama Explorer with ambient audio
- Trail Elevation Hub with GPS profiles
- Gifaataa Cultural Calendar (UNESCO)
- Trip Cost Calculator (USD/ETB)
- Enset Food Lab
- Local Guides section


## Architecture & Technology Stack

- **Backend**: Node.js v20+ with Express, compression, rate-limiting, and JSON persistence
- **Frontend**: Vanilla ES6+ JavaScript, custom CSS design system with CSS custom properties
- **Maps & GIS**: Leaflet.js with OpenStreetMap/CartoDB tiles and Google Earth 3D flyover integration
- **PWA**: Service Worker caching, offline fallback mode, Web App Manifest

## Getting Started

`ash
npm install
npm run dev   # development
npm start     # production
`Server runs at http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/destinations | All landmarks |
| GET | /api/destinations/:id | Single landmark |
| GET | /api/itineraries | Itinerary packages |
| GET | /api/experiences | Experiences |
| GET | /api/guides | Local guides |
| POST | /api/enquiry | Travel enquiry |
| POST | /api/concierge | AI trip planner |
| GET | /api/weather | Sodo microclimate |
| GET | /api/health | Server health |


## Automated Testing

Run the built-in smoke tests to verify server routes, landmark data integrity, and package manifest:

```bash
npm test
```

## License

2026 Visit Wolaita Tourism Initiative. All rights reserved.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | HTTP server port |
| HOST | 0.0.0.0 | Server bind address |
| NODE_ENV | development | Runtime environment mode |
