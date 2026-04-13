# CLAUDE.md

## Project: andyamat

Baby shower RSVP app with interactive canvas-based game invitations. Guests receive personalized links, play through a 7-scene game (two themes), and RSVP. Admin dashboard for managing invitations and tracking responses.

**Event:** May 2, 2026, 2:30 PM, Emy's Place, Miami FL 33165

**Live:** https://andyamat.com

**VPS:** 144.91.75.151 (shared with Rathole tunnel server for maestro hub)

## Stack

- **Frontend:** Angular 18 (standalone components), TypeScript 5.5, SCSS, HTML5 Canvas
- **Backend:** C++17, Drogon web framework
- **Database:** PostgreSQL (pgcrypto for auth)
- **Deploy:** VPS at 144.91.75.151, nginx reverse proxy, Let's Encrypt SSL, systemd

## Directory Structure

```
andyamat/
├── frontend/              # Angular 18 SPA
│   ├── src/app/
│   │   ├── shared/base-game.engine.ts    # Abstract game engine (shared by both themes)
│   │   ├── game/                         # "A Boy Story" retro pixel theme
│   │   ├── toy-game/                     # "Toy Story" sprite theme (default)
│   │   │   ├── drawing/                  # Character sprites (woody, buzz, rex, etc.)
│   │   │   └── audio/toy-audio.ts
│   │   ├── admin/                        # Admin dashboard (RSVP list, create invites)
│   │   ├── login/                        # Admin login
│   │   ├── api.service.ts                # HTTP client
│   │   ├── auth.service.ts / auth.guard.ts
│   │   └── app.routes.ts
│   └── public/            # Static assets (character PNGs, OG images)
├── controllers/           # Drogon API handlers
│   ├── InviteController.cc/h
│   └── AuthController.cc/h
├── filters/
│   └── AdminFilter.cc/h   # Auth middleware
├── sql/schema.sql         # Database DDL + seed admin user
├── main.cc                # Drogon entry point (SPA fallback via setCustom404Page)
├── config.json            # Drogon config (listeners, DB, sessions)
├── CMakeLists.txt
├── deploy.sh              # Build frontend + backend, install to /opt/andyamat, restart
└── setup-vps.sh           # One-time VPS setup (PostgreSQL, systemd, nginx)
```

## Routes

| Path | Component |
|------|-----------|
| `/toystory/invite/:id` | ToyGameComponent (default theme) |
| `/retro/invite/:id` | GameComponent (pixel retro theme) |
| `/invite/:id` | Redirects to toystory |
| `/admin` | AdminComponent (auth-guarded) |
| `/login` | LoginComponent |

## API Endpoints

```
GET    /api/invites/{id}         # Get invitation
POST   /api/invites              # Create invitation (admin)
GET    /api/admin/invites        # List all invitations (admin)
POST   /api/invites/{id}/view    # Record page view
POST   /api/rsvp                 # Submit RSVP
POST   /api/rsvp/email           # Store guest email
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Check auth status
```

## Database

PostgreSQL database `andyamat` (user: `andyamat`).

Tables: `invitations`, `rsvps`, `invite_views`, `admin_users`

Default admin: `admin` / `changeme`

Schema: `sql/schema.sql`

## Build & Dev

### Frontend

```bash
cd frontend
npm ci
npm start              # Dev server on localhost:4200
npm run build          # Production build
```

### Backend

```bash
mkdir -p build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make -j$(nproc)
./andyamat             # Runs on port 8080 (dev)
```

### Deploy to VPS

```bash
./deploy.sh            # Builds both, copies to /opt/andyamat, restarts service
```

Production patches applied by deploy.sh:
- DB host: `192.168.2.15` -> `127.0.0.1`
- Port: `8080` -> `8081`
- DB password: `""` -> `"andyamat"`

### First-time VPS Setup

```bash
./setup-vps.sh         # Creates DB, systemd service, nginx config
# Then manually: DNS A record + certbot for SSL
```

## Config

`config.json` -- Drogon configuration:
- Dev: port 8080, DB at 192.168.2.15, no password
- Prod: port 8081, DB at 127.0.0.1, password "andyamat"

Sessions enabled (cookie-based, 1 hour timeout).

## Architecture Notes

- Both game themes extend `BaseGameEngine` -- abstract Angular directive with shared canvas lifecycle, animation loop, scene state machine, typewriter text, tap handling
- All game UI rendered to HTML5 Canvas (no DOM elements in gameplay)
- SPA routing: Drogon serves `index.html` for all non-API, non-static paths via `setCustom404Page`
- Web Audio API for synthesized sound effects (retro) and musical fanfares (toy story)
- Event details and Amazon registry URL hardcoded in game components
