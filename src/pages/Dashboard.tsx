/**
 * Dashboard.tsx
 * 
 * Main dashboard page with map, fleet sidebar, mission controls, and live progress.
 */

import { useCallback } from 'react';
import type { Position } from 'geojson';
import MapController from '@/components/MapController';
import FleetSidebar from '@/components/FleetSidebar';
import MissionControls from '@/components/MissionControls';
import MissionProgress from '@/components/MissionProgress';
import { useFlightPlanner } from '@/hooks/useFlightPlanner';

export default function Dashboard() {
    const { handlePolygonDrawn } = useFlightPlanner();

    const onPolygonDrawn = useCallback(
        (coordinates: Position[]) => {
            handlePolygonDrawn(coordinates);
        },
        [handlePolygonDrawn]
    );

    return (
        <main className="flex-1 flex overflow-hidden relative">
            {/* Left - Fleet Sidebar */}
            <FleetSidebar />

            {/* Center - Map */}
            <div className="flex-1 relative">
                <MapController onPolygonDrawn={onPolygonDrawn} />

                {/* Mission Progress Overlay */}
                <MissionProgress />
            </div>

            {/* Right - Mission Controls */}
            <MissionControls />
        </main>
    );
}
