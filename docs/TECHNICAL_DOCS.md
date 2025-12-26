# Technical Documentation (DSMS)

## 1. Architecture Overview

### Tech Stack
-   **Framework**: React 19 + Vite 6
-   **Language**: TypeScript 5.7
-   **Styling**: Tailwind CSS v4 + Vanilla CSS Variables (Cyberpunk Design System)
-   **State Management**: React Context (`ThemeContext`) + Local Component State (migration to Zustand planned for global state)
-   **Maps**: MapLibre GL JS + Turf.js for geospatial calculations
-   **Routing**: React Router v7

### Directory Structure
```
src/
├── components/     # Reusable UI components (Layout, MissionControls, etc.)
├── hooks/          # Custom hooks (useFlightPlanner, useSimulation)
├── lib/            # Core logic and utilities (FlightPathGenerator, PathValidator)
├── pages/          # Route page components (Dashboard, Fleet, Missions, etc.)
├── types/          # TypeScript interface definitions
├── App.tsx         # Main application entry and routing
├── main.tsx        # React DOM root render
└── index.css       # Global styles and Design System variables
```

## 2. Core Systems

### Theme System
The application uses a **Hardcoded Dark Mode** system.
-   **Implementation**: `ThemeContext.tsx`
-   **Behavior**: Enforces `data-theme="dark"` on the `<html>` element. Light mode has been deprecated and removed.
-   **Variables**: CSS variables in `index.css` define the palette (Neon Magenta, Electric Cyan, Deep Space Backgrounds).

### Flight Path Generation
The core algorithm resides in `src/lib/FlightPathGenerator.ts`.
1.  **Input**: User-defined polygon (GeoJSON Feature).
2.  **Processing**:
    -   Calculates the bounding box.
    -   Determines the "Principal Axis" (longest edge) to align flight lines.
    -   Generates parallel scan lines based on sensor footprint (altitude/FOV).
    -   Clips lines to the polygon using ray-casting.
3.  **Patterning**: Connects valid flight lines in a "Snake" (boustrophedon) pattern.

### Simulation Engine
Located in `src/hooks/useSimulation.ts`.
-   **Physics**: Simulates drone movement at realistic speeds (10m/s - 25m/s).
-   **Interpolation**: Uses linear interpolation between waypoints to update `currentPosition` at 60fps (via `requestAnimationFrame`).
-   **State**: Tracks battery drain based on distance/time and speed.

## 3. Key Components

### `Layout.tsx`
The shell of the application.
-   **Responsibility**: Renders the persistent Header (Navigation, Status) and Footer.
-   **Styling**: Uses "Glassmorphism" panels with animated neon borders.

### `MissionControls.tsx`
The HUD interface for mission planning.
-   **Features**:
    -   Pattern selection (Snake, Crosshatch).
    -   Altitude/Overlap sliders.
    -   Mission Start/Abort controls.
    -   Live Telemetry display (Speed, Battery, GPS).

### `Map.tsx` / Dashboard
-   **Library**: MapLibre GL JS.
-   **Layers**:
    -   `satellite`: Base imagery.
    -   `survey-area`: User-drawn polygon fill/stroke.
    -   `flight-path`: Generated mission waypoints line.
    -   `drone-icon`: pulsed marker for current drone position.

## 4. Design System (Cyberpunk)
Styles are defined in `src/index.css`.
-   **Colors**:
    -   Primary: `#FF00FF` (Magenta)
    -   Secondary: `#00FFFF` (Cyan)
    -   Background: `#0a0014` (Deep Space)
-   **Effects**:
    -   `.glass-panel`: Translucent backgrounds with blur.
    -   `.text-glow-*`: Text shadowing for neon effect.
    -   `.animate-pulse-*`: Breathing glow animations.

## 5. Deployment
-   **Build**: `npm run build` produces a static artifact in `dist/`.
-   **Preview**: `npm run preview` to test the production build locally.
