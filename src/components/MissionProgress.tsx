/**
 * MissionProgress.tsx
 * 
 * Real-time mission progress panel with live stats for the Dashboard.
 */

import { useSimulationStore, useDroneStore, useMissionStore } from '@/store';
import {
    Navigation,
    Clock,
    MapPin,
    Zap,
    Camera,
    Gauge,
    TrendingUp
} from 'lucide-react';

export default function MissionProgress() {
    const { simulation } = useSimulationStore();
    const { selectedDroneId, drones } = useDroneStore();
    const { generatedPath, missionConfig } = useMissionStore();

    const selectedDrone = drones.find(d => d.id === selectedDroneId);

    if (!simulation.isRunning) return null;

    const waypointsRemaining = generatedPath ? generatedPath.length - simulation.currentWaypointIndex - 1 : 0;
    const progressPercent = Math.round(simulation.progress * 100);
    const elapsedMinutes = Math.floor(simulation.elapsedTime / 60);
    const elapsedSeconds = Math.floor(simulation.elapsedTime % 60);

    // Estimate remaining time based on progress
    const estimatedTotalTime = simulation.progress > 0
        ? simulation.elapsedTime / simulation.progress
        : 0;
    const remainingTime = estimatedTotalTime - simulation.elapsedTime;
    const remainingMinutes = Math.floor(remainingTime / 60);
    const remainingSeconds = Math.floor(remainingTime % 60);

    return (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-fade-in">
            <div className="glass-panel border-2 border-[#00FFFF] rounded-2xl p-5 shadow-[0_0_40px_rgba(0,255,255,0.4)] min-w-[500px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-[#00FFFF] animate-pulse shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
                        <span className="font-display text-[#00FFFF] uppercase tracking-[0.3em] text-sm">Live Mission</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Navigation className="w-4 h-4 text-[#FF00FF]" />
                        <span className="font-mono text-white">{selectedDrone?.name || 'Drone'}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-lg text-xs font-display ${simulation.isPaused ? 'bg-[rgba(255,255,0,0.2)] text-[#FFFF00]' : 'bg-[rgba(0,255,102,0.2)] text-[#00FF66]'}`}>
                            {simulation.isPaused ? 'PAUSED' : 'ACTIVE'}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="h-4 bg-[rgba(0,255,255,0.1)] rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-[#00FF66] rounded-full transition-all duration-300 relative"
                            style={{ width: `${progressPercent}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-display text-white tracking-widest">
                            {progressPercent}% COMPLETE
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(0,255,255,0.2)]">
                        <Clock className="w-5 h-5 text-[#00FFFF] mx-auto mb-1" />
                        <div className="text-lg font-display font-bold text-white">
                            {String(elapsedMinutes).padStart(2, '0')}:{String(elapsedSeconds).padStart(2, '0')}
                        </div>
                        <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">Elapsed</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(0,255,102,0.2)]">
                        <TrendingUp className="w-5 h-5 text-[#00FF66] mx-auto mb-1" />
                        <div className="text-lg font-display font-bold text-white">
                            {remainingMinutes > 0 ? `${remainingMinutes}:${String(remainingSeconds).padStart(2, '0')}` : '--:--'}
                        </div>
                        <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">ETA</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(255,0,255,0.2)]">
                        <MapPin className="w-5 h-5 text-[#FF00FF] mx-auto mb-1" />
                        <div className="text-lg font-display font-bold text-white">
                            {simulation.currentWaypointIndex + 1}/{generatedPath?.length || 0}
                        </div>
                        <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">Waypoint</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(255,255,0,0.2)]">
                        <Gauge className="w-5 h-5 text-[#FFFF00] mx-auto mb-1" />
                        <div className="text-lg font-display font-bold text-white">
                            {simulation.speed}x
                        </div>
                        <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">Speed</div>
                    </div>
                </div>

                {/* Coordinates */}
                <div className="mt-4 pt-3 border-t border-[rgba(0,255,255,0.15)] flex items-center justify-between text-xs font-mono text-[#B8A8D0]">
                    <span>
                        Position: {simulation.dronePosition[1]?.toFixed(5) || '0'}°, {simulation.dronePosition[0]?.toFixed(5) || '0'}°
                    </span>
                    <span>
                        Bearing: {Math.round(simulation.droneBearing || 0)}°
                    </span>
                    <span>
                        Alt: {missionConfig.altitude_m}m
                    </span>
                </div>
            </div>
        </div>
    );
}
