# Östra Squad - Product Requirements Document

## Original Problem Statement
Build a mobile-first web app called "Östra Squad" for football team Östra Almby that:
- Displays a football pitch with two goals
- Allows users to drag players from a bench onto the pitch
- Players can be moved freely anywhere on the pitch
- Shows player numbers on the player icons
- Displays substitutes on the side bench
- Works great on iPhone via the web

## User Personas
- **Primary**: Football coaches who need to plan formations
- **Secondary**: Team players who want to see their positions

## Core Requirements
- [x] Football pitch with markings (center circle, penalty areas, goals)
- [x] Drag and drop players from bench to pitch
- [x] Free movement of players on the pitch
- [x] Player images with visible numbers
- [x] Substitutes bench with horizontal scrolling
- [x] Settings to choose target number of players (5, 7, 9, 11)
- [x] Mobile-first design (iPhone optimized)
- [x] Team colors: Green, black, white

## What's Been Implemented (Jan 2026)
- ✅ Full football pitch with CSS-based markings
- ✅ @dnd-kit drag-and-drop system for touch support
- ✅ 24 players with real photos extracted from screenshots
- ✅ Player counter showing X/Y with warning when over target
- ✅ Settings dialog to change target player count
- ✅ Glassmorphic bench with horizontal scrolling
- ✅ Player tooltips showing name when clicked on pitch
- ✅ Dark theme with team colors (green, black, white)

## Tech Stack
- Frontend: React with @dnd-kit/core for drag-and-drop
- Styling: Tailwind CSS + Custom CSS
- Icons: Phosphor Icons
- No backend required (client-side only)

## Prioritized Backlog

### P0 (Critical) - COMPLETE
- ✅ Drag and drop functionality
- ✅ Football pitch display
- ✅ Player bench

### P1 (High)
- [ ] Save/load formations to localStorage
- [ ] Export formation as image

### P2 (Medium)
- [ ] Multiple formation presets (4-4-2, 4-3-3, etc.)
- [ ] Color-coded player positions
- [ ] Undo/redo functionality

### P3 (Low)
- [ ] Animation when placing players
- [ ] Share formation via link
- [ ] Multiple teams support

## Next Tasks
1. Add localStorage support to save formations
2. Add export-to-image feature
3. Consider PWA support for offline usage
