/**
 * MissionControls.tsx
 * 
 * Enhanced mission planning controls with pattern selection, sensor config,
 * and real-time mission monitoring.
 */

import { useState } from 'react';
import {
    Crosshair,
    Play,
    Pause,
    Square,
    RotateCcw,
    Gauge,
    Layers,
    Camera,
    Grid3X3,
    Hexagon,
    RefreshCw,
    Home,
    SkipForward,
    Zap,
    Thermometer,
    Radio,
    Eye
} from 'lucide-react';
import { useDroneStore, useMissionStore, useSimulationStore, useUIStore } from '@/store';
import { useFlightPlanner } from '@/hooks/useFlightPlanner';
import { useSimulation } from '@/hooks/useSimulation';
import { calculateGridSpacing, getPatternDisplayName } from '@/lib/FlightPathGenerator';
import type { SurveyPattern, SensorType } from '@/types';

const PATTERNS: { value: SurveyPattern; label: string; icon: typeof Grid3X3 }[] = [
    { value: 'SNAKE', label: 'Snake', icon: Layers },
    { value: 'CROSSHATCH', label: 'Crosshatch', icon: Grid3X3 },
    { value: 'PERIMETER', label: 'Perimeter', icon: Hexagon },
];

const SENSORS: { value: SensorType; label: string; icon: typeof Camera; color: string }[] = [
    { value: 'RGB', label: 'RGB', icon: Camera, color: '#00FF66' },
    { value: 'THERMAL', label: 'Thermal', icon: Thermometer, color: '#FF6600' },
    { value: 'LIDAR', label: 'LiDAR', icon: Radio, color: '#00FFFF' },
    { value: 'MULTISPECTRAL', label: 'Multi-Spec', icon: Eye, color: '#FF00FF' },
];

export default function MissionControls() {
    const { missionConfig, setMissionConfig, drawnPolygon, generatedPath, setPattern, setSensors } = useMissionStore();
    const { selectedDroneId, drones, selectDrone } = useDroneStore();
    const { simulation } = useSimulationStore();
    const { isDrawingMode, setDrawingMode } = useUIStore();
    const { regeneratePath } = useFlightPlanner();
    const { startMission, togglePause, abortMission, returnToHome, skipWaypoint, setSpeed } = useSimulation();

    const [showAdvanced, setShowAdvanced] = useState(false);

    const selectedDrone = drones.find(d => d.id === selectedDroneId);
    const availableDrones = drones.filter(d => d.status === 'IDLE' && d.battery > 20);

    const spacing = calculateGridSpacing(
        missionConfig.altitude_m,
        missionConfig.overlap_percent,
        missionConfig.camera_fov_deg
    );

    const handleStartMission = () => {
        if (!selectedDroneId) {
            alert('Please select a drone first');
            return;
        }
        if (!generatedPath || generatedPath.length < 2) {
            alert('Please draw a survey area first');
            return;
        }
        startMission();
    };

    const handleReset = () => {
        abortMission();
        setDrawingMode(false);
    };

    const toggleSensor = (sensor: SensorType) => {
        const current = missionConfig.sensors || ['RGB'];
        if (current.includes(sensor)) {
            if (current.length > 1) {
                setSensors(current.filter(s => s !== sensor));
            }
        } else {
            setSensors([...current, sensor]);
        }
    };

    return (
        <div className="w-[380px] flex-shrink-0 glass-panel border-l-2 border-[rgba(0,255,255,0.3)] h-full overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b-2 border-[rgba(0,255,255,0.2)] bg-gradient-to-r from-[rgba(0,255,255,0.1)] to-transparent">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FFFF] to-[#FF00FF] flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.5)]">
                        <Crosshair className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display text-white tracking-widest">MISSION</h2>
                        <p className="text-[10px] text-[#00FFFF] font-display uppercase tracking-[0.2em]">Planning Console</p>
                    </div>
                </div>
            </div>

            <div className="p-5 space-y-6">
                {/* Draw Area Button */}
                <button
                    onClick={() => setDrawingMode(!isDrawingMode)}
                    className={`w-full py-4 rounded-xl font-display text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isDrawingMode
                            ? 'bg-gradient-to-r from-[#FF00FF] to-[#FF00FF]/50 text-white border-2 border-[#FF00FF] shadow-[0_0_30px_rgba(255,0,255,0.5)]'
                            : 'bg-gradient-to-r from-[rgba(0,255,255,0.2)] to-[rgba(0,255,255,0.1)] text-[#00FFFF] border-2 border-[#00FFFF] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]'
                        }`}
                >
                    <Hexagon className="w-5 h-5" />
                    {isDrawingMode ? 'Drawing Mode Active' : 'Draw Survey Area'}
                </button>

                {/* Pattern Selection */}
                <div>
                    <label className="text-sm text-[#B8A8D0] mb-3 flex items-center gap-2 font-display tracking-wider uppercase">
                        <Grid3X3 className="w-4 h-4 text-[#00FFFF]" />
                        Survey Pattern
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {PATTERNS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => {
                                    setPattern(value);
                                    if (drawnPolygon) regeneratePath();
                                }}
                                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${missionConfig.pattern === value
                                        ? 'border-[#FF00FF] bg-[rgba(255,0,255,0.2)] text-[#FF00FF] shadow-[0_0_15px_rgba(255,0,255,0.3)]'
                                        : 'border-[rgba(255,255,255,0.15)] text-[#B8A8D0] hover:border-[rgba(255,0,255,0.4)]'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[10px] font-display tracking-wider">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sensor Selection */}
                <div>
                    <label className="text-sm text-[#B8A8D0] mb-3 flex items-center gap-2 font-display tracking-wider uppercase">
                        <Camera className="w-4 h-4 text-[#00FF66]" />
                        Data Sensors
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {SENSORS.map(({ value, label, icon: Icon, color }) => (
                            <button
                                key={value}
                                onClick={() => toggleSensor(value)}
                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${missionConfig.sensors?.includes(value)
                                        ? `border-[${color}] bg-[${color}20] shadow-[0_0_15px_${color}40]`
                                        : 'border-[rgba(255,255,255,0.15)] text-[#B8A8D0] hover:border-[rgba(255,255,255,0.3)]'
                                    }`}
                                style={{
                                    borderColor: missionConfig.sensors?.includes(value) ? color : undefined,
                                    backgroundColor: missionConfig.sensors?.includes(value) ? `${color}20` : undefined,
                                    color: missionConfig.sensors?.includes(value) ? color : undefined,
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                <span className="text-xs font-display tracking-wider">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Altitude Slider */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-[#B8A8D0] flex items-center gap-2 font-display tracking-wider uppercase">
                            <Gauge className="w-4 h-4 text-[#FFFF00]" />
                            Altitude
                        </label>
                        <span className="text-xl font-display font-bold text-[#FFFF00] bg-[rgba(255,255,0,0.15)] px-3 py-1 rounded-lg border border-[#FFFF00]">
                            {missionConfig.altitude_m}m
                        </span>
                    </div>
                    <input
                        type="range"
                        min="20"
                        max="120"
                        value={missionConfig.altitude_m}
                        onChange={(e) => {
                            setMissionConfig({ altitude_m: parseInt(e.target.value) });
                            if (drawnPolygon) regeneratePath();
                        }}
                        className="w-full"
                    />
                    <div className="flex justify-between text-[10px] text-[#B8A8D0] mt-2 font-mono">
                        <span>20m</span>
                        <span>Ground: {Math.round(spacing)}m</span>
                        <span>120m</span>
                    </div>
                </div>

                {/* Overlap Slider */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm text-[#B8A8D0] flex items-center gap-2 font-display tracking-wider uppercase">
                            <Layers className="w-4 h-4 text-[#00FF66]" />
                            Overlap
                        </label>
                        <span className="text-xl font-display font-bold text-[#00FF66] bg-[rgba(0,255,102,0.15)] px-3 py-1 rounded-lg border border-[#00FF66]">
                            {missionConfig.overlap_percent}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="30"
                        max="90"
                        value={missionConfig.overlap_percent}
                        onChange={(e) => {
                            setMissionConfig({ overlap_percent: parseInt(e.target.value) });
                            if (drawnPolygon) regeneratePath();
                        }}
                        className="w-full"
                    />
                </div>

                {/* Drone Selection */}
                <div>
                    <label className="text-sm text-[#B8A8D0] mb-3 flex items-center gap-2 font-display tracking-wider uppercase">
                        <Zap className="w-4 h-4 text-[#FF00FF]" />
                        Assign Drone
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableDrones.length === 0 ? (
                            <div className="text-center py-4 text-[#6B5B8A] text-sm">No drones available</div>
                        ) : (
                            availableDrones.map((drone) => (
                                <button
                                    key={drone.id}
                                    onClick={() => selectDrone(drone.id)}
                                    className={`w-full p-3 rounded-xl border-2 transition-all flex items-center justify-between ${selectedDroneId === drone.id
                                            ? 'border-[#FF00FF] bg-[rgba(255,0,255,0.15)] shadow-[0_0_20px_rgba(255,0,255,0.3)]'
                                            : 'border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,0,255,0.4)]'
                                        }`}
                                >
                                    <span className="font-display text-white tracking-wider">{drone.name}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm font-mono ${drone.battery > 50 ? 'text-[#00FF66]' : 'text-[#FFFF00]'}`}>
                                            {drone.battery}%
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Mission Controls */}
                {!simulation.isRunning ? (
                    <button
                        onClick={handleStartMission}
                        disabled={!selectedDroneId || !generatedPath}
                        className={`w-full py-4 rounded-xl font-display text-base uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${selectedDroneId && generatedPath
                                ? 'bg-gradient-to-r from-[#00FF66] to-[#00FF66]/50 text-[#0a0014] border-2 border-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.5)] hover:shadow-[0_0_40px_rgba(0,255,102,0.7)]'
                                : 'bg-[rgba(255,255,255,0.1)] text-[#6B5B8A] border-2 border-[rgba(255,255,255,0.1)] cursor-not-allowed'
                            }`}
                    >
                        <Play className="w-5 h-5" />
                        Start Mission
                    </button>
                ) : (
                    <div className="space-y-3">
                        {/* Primary Controls */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={togglePause}
                                className={`py-3 rounded-xl font-display text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 ${simulation.isPaused
                                        ? 'bg-[rgba(0,255,102,0.2)] border-[#00FF66] text-[#00FF66]'
                                        : 'bg-[rgba(255,255,0,0.2)] border-[#FFFF00] text-[#FFFF00]'
                                    }`}
                            >
                                {simulation.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                {simulation.isPaused ? 'Resume' : 'Pause'}
                            </button>
                            <button
                                onClick={abortMission}
                                className="py-3 rounded-xl font-display text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 bg-[rgba(255,0,102,0.2)] border-[#FF0066] text-[#FF0066] hover:shadow-[0_0_20px_rgba(255,0,102,0.4)]"
                            >
                                <Square className="w-4 h-4" />
                                Abort
                            </button>
                        </div>

                        {/* Secondary Controls */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={returnToHome}
                                className="py-3 rounded-xl font-display text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 bg-[rgba(255,102,0,0.2)] border-[#FF6600] text-[#FF6600] hover:shadow-[0_0_20px_rgba(255,102,0,0.4)]"
                            >
                                <Home className="w-4 h-4" />
                                RTH
                            </button>
                            <button
                                onClick={skipWaypoint}
                                className="py-3 rounded-xl font-display text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 bg-[rgba(0,255,255,0.2)] border-[#00FFFF] text-[#00FFFF] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                            >
                                <SkipForward className="w-4 h-4" />
                                Skip WP
                            </button>
                        </div>

                        {/* Speed Control */}
                        <div className="flex items-center gap-2 justify-center">
                            <span className="text-xs text-[#B8A8D0] font-display uppercase">Speed:</span>
                            {[1, 2, 5, 10].map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setSpeed(speed)}
                                    className={`px-3 py-1 rounded-lg text-sm font-mono transition-all ${simulation.speed === speed
                                            ? 'bg-[#FF00FF] text-white shadow-[0_0_15px_rgba(255,0,255,0.5)]'
                                            : 'bg-[rgba(255,255,255,0.1)] text-[#B8A8D0] hover:bg-[rgba(255,0,255,0.2)]'
                                        }`}
                                >
                                    {speed}x
                                </button>
                            ))}
                        </div>

                        {/* Live Stats */}
                        <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl p-4 border border-[rgba(0,255,255,0.2)]">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-display font-bold text-[#00FFFF]">
                                        {Math.round(simulation.progress * 100)}%
                                    </div>
                                    <div className="text-[10px] text-[#B8A8D0] uppercase font-display">Progress</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-display font-bold text-[#00FF66]">
                                        {simulation.currentWaypointIndex + 1}
                                    </div>
                                    <div className="text-[10px] text-[#B8A8D0] uppercase font-display">Waypoint</div>
                                </div>
                            </div>
                            <div className="mt-3 h-2 bg-[rgba(0,255,255,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-[#00FF66] transition-all duration-300 rounded-full"
                                    style={{ width: `${simulation.progress * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Button */}
                {(drawnPolygon || generatedPath) && !simulation.isRunning && (
                    <button
                        onClick={handleReset}
                        className="w-full py-3 rounded-xl font-display text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-2 border-[rgba(255,255,255,0.2)] text-[#B8A8D0] hover:border-[rgba(255,255,255,0.4)]"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Clear & Reset
                    </button>
                )}
            </div>
        </div>
    );
}
