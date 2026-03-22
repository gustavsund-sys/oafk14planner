# Östra Squad - Product Requirements Document

## Original Problem Statement
Build an iPhone-optimized web app for football team "Östra Almby" (App name: Östra Squad) with:
- Football pitch with free drag-and-drop placement of players
- Collapsible substitutes bench
- Team colors (green, black, white)
- Match info overlay (opponent, date, time, location, scoreboard)
- Formation saving/sharing via shortcodes
- Global player management system (add/edit/remove players with images)

## User Personas
- **Primary**: Football coaches who need to plan formations and share them
- **Secondary**: Team players who want to see their positions

## Core Requirements
- [x] Football pitch with markings (center circle, penalty areas, goals)
- [x] Drag and drop players from bench to pitch (iOS touch-optimized)
- [x] Free movement of players on the pitch
- [x] Player images with visible numbers
- [x] Collapsible substitutes bench (grid layout)
- [x] Settings to choose target number of players (5, 7, 9, 11)
- [x] Mobile-first design (iPhone optimized)
- [x] Team colors: Green, black, white
- [x] Match info overlay on pitch
- [x] Save/load formations via shortcodes (OSTRA-XXXX)
- [x] Global player management (CRUD via MongoDB)
- [x] PWA/Fullscreen mode support (Add to Home Screen)

## What's Been Implemented

### January 2026
- ✅ Full football pitch with CSS-based markings
- ✅ @dnd-kit drag-and-drop system with iOS touch optimizations
- ✅ 24 players with real photos from screenshots
- ✅ Player counter showing X/Y with warning when over target
- ✅ Settings dialog to change target player count
- ✅ Collapsible substitutes bench (grid layout)
- ✅ Dark theme with team colors (green, black, white)

### March 2026
- ✅ Match Info Dialog - add opponent, date, time, location overlay on pitch
- ✅ Scoreboard display on pitch (home/away scores)
- ✅ Formation Save/Load system with short codes (OSTRA-XXXX)
- ✅ Import formations from other devices via shortcode
- ✅ Player Editor UI (add/edit/delete players)
- ✅ **Global Player Database** - Player roster stored in MongoDB
  - All users see the same player list
  - Add new players with name, number, and optional image
  - Edit existing player details
  - Delete players from roster
  - Auto-generated avatar images for players without photos
- ✅ **PWA/Fullscreen Support** - App kan köras i helskärmsläge
  - iOS "Lägg till på hemskärmen" stöd
  - Web App Manifest för PWA-installation
  - Safe-area-insets för iPhone notch/home indicator
  - `display: standalone` för fullskärmsupplevelse
  - **Installera app-knapp** med instruktioner för användare
  - Flytande installationsprompt som visas automatiskt

## Tech Stack
- **Frontend**: React with @dnd-kit/core for drag-and-drop
- **Styling**: Tailwind CSS + Custom CSS + Shadcn/UI components
- **Icons**: Phosphor Icons
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (Motor async driver)

## API Endpoints
- `GET /api/players` - Get all players (auto-seeds 24 players if empty)
- `POST /api/players` - Add new player
- `PUT /api/players/{id}` - Update player
- `DELETE /api/players/{id}` - Delete player
- `POST /api/squads/share` - Save formation and get shortcode
- `GET /api/squads/{code}` - Load formation by shortcode

## Database Schema
```
players: {
  id: int,
  name: string,
  number: int,
  image: string (URL or base64)
}

shared_squads: {
  code: string (e.g., "OSTRA-PRKZ"),
  name: string,
  playersOnPitch: array,
  playersOnSubs: array,
  matchInfo: object,
  createdAt: datetime
}
```

## Completed Features
- ✅ Drag and drop functionality (iOS optimized)
- ✅ Football pitch display
- ✅ Player bench (collapsible grid)
- ✅ Match info overlay
- ✅ Save/load formations via shortcodes
- ✅ Global player management (MongoDB)

## Future Enhancements (P2-P3)
- [ ] Multiple formation presets (4-4-2, 4-3-3, etc.)
- [ ] Color-coded player positions
- [ ] Export formation as image
- [ ] PWA support for offline usage
- [ ] Animation when placing players

## Test Reports
- `/app/test_reports/iteration_1.json`
- `/app/test_reports/iteration_2.json` - Player CRUD API tests (100% pass)
