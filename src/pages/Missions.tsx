/**
 * Missions.tsx
 * 
 * Mission history and analytics page with NEON CYBERPUNK styling.
 */

import { useMissionStore, useDroneStore, useSimulationStore } from '@/store';
import {
    Target,
    Clock,
    CheckCircle,
    XCircle,
    PlayCircle,
    PauseCircle,
    FileText,
    TrendingUp,
    MapPin,
    Plane,
    Route,
    Timer,
    BarChart3,
    Zap
} from 'lucide-react';

export default function Missions() {
    const { missions, missionConfig } = useMissionStore();
    const { drones, selectedDroneId } = useDroneStore();
    const { simulation } = useSimulationStore();

    const selectedDrone = drones.find(d => d.id === selectedDroneId);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-6 h-6 text-[#00FF66]" />;
            case 'IN_PROGRESS': return <PlayCircle className="w-6 h-6 text-[#00FFFF]" />;
            case 'PAUSED': return <PauseCircle className="w-6 h-6 text-[#FFFF00]" />;
            case 'ABORTED': return <XCircle className="w-6 h-6 text-[#FF0066]" />;
            default: return <FileText className="w-6 h-6 text-[#B8A8D0]" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-[#00FF66] bg-[rgba(0,255,102,0.15)] border-[#00FF66]';
            case 'IN_PROGRESS': return 'text-[#00FFFF] bg-[rgba(0,255,255,0.15)] border-[#00FFFF]';
            case 'PAUSED': return 'text-[#FFFF00] bg-[rgba(255,255,0,0.15)] border-[#FFFF00]';
            case 'ABORTED': return 'text-[#FF0066] bg-[rgba(255,0,102,0.15)] border-[#FF0066]';
            default: return 'text-[#B8A8D0] bg-[rgba(184,168,208,0.15)] border-[#B8A8D0]';
        }
    };

    return (
        <main className="missions-page flex-1 overflow-auto p-8" style={{ background: 'linear-gradient(135deg, #0a0014 0%, #1a0030 50%, #0a0014 100%)' }}>
            {/* Header */}
            <div className="mb-10 animate-fade-in">
                <h1 className="text-4xl font-display text-white flex items-center gap-5 tracking-widest">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF66] via-[#00FFFF] to-[#FF00FF] flex items-center justify-center shadow-[0_0_50px_rgba(0,255,102,0.5)] animate-float relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/30" />
                        <Target className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <span className="text-glow-cyan">MISSION CENTER</span>
                </h1>
                <p className="text-base text-[#00FF66] mt-3 font-display tracking-[0.3em] uppercase">
                    Analytics • History • Real-time Monitoring
                </p>
            </div>

            {/* Quick Stats - Neon Cards */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#00FFFF] shadow-[0_0_30px_rgba(0,255,255,0.3)] group hover:shadow-[0_0_50px_rgba(0,255,255,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFFF]/30 to-[#00FFFF]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 border border-[#00FFFF]">
                            <BarChart3 className="w-8 h-8 text-[#00FFFF]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#00FFFF] font-display">{missions.length}</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Total Missions</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.3)] group hover:shadow-[0_0_50px_rgba(0,255,102,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF66]/30 to-[#00FF66]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] transition-all duration-300 border border-[#00FF66]">
                            <CheckCircle className="w-8 h-8 text-[#00FF66]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#00FF66] font-display">
                                {missions.filter(m => m.status === 'COMPLETED').length}
                            </div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Completed</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#FFFF00] shadow-[0_0_30px_rgba(255,255,0,0.3)] group hover:shadow-[0_0_50px_rgba(255,255,0,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFFF00]/30 to-[#FFFF00]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,0,0.5)] transition-all duration-300 border border-[#FFFF00]">
                            <Timer className="w-8 h-8 text-[#FFFF00]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#FFFF00] font-display">
                                {simulation.isRunning ? 1 : 0}
                            </div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">In Progress</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#FF00FF] shadow-[0_0_30px_rgba(255,0,255,0.3)] group hover:shadow-[0_0_50px_rgba(255,0,255,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF00FF]/30 to-[#FF00FF]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,0,255,0.5)] transition-all duration-300 border border-[#FF00FF]">
                            <Route className="w-8 h-8 text-[#FF00FF]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#FF00FF] font-display">{missionConfig.altitude_m}m</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Default Alt</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Mission Panel */}
            {simulation.isRunning && (
                <div className="glass-panel p-8 border-2 border-[#00FFFF] mb-10 rounded-2xl animate-fade-in shadow-[0_0_40px_rgba(0,255,255,0.4)] relative overflow-hidden">
                    {/* Animated border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-[#00FFFF] animate-pulse-cyan" />

                    <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-[#00FFFF] animate-pulse shadow-[0_0_20px_rgba(0,255,255,0.8)]" />
                        <span className="text-lg font-display text-[#00FFFF] uppercase tracking-[0.3em]">Live Mission</span>
                        <Zap className="w-5 h-5 text-[#FFFF00] animate-pulse" />
                    </div>
                    <div className="grid grid-cols-4 gap-8 relative z-10">
                        <div>
                            <div className="text-sm text-[#B8A8D0] uppercase mb-3 font-display tracking-widest">Progress</div>
                            <div className="text-4xl font-bold text-white font-display mb-4">
                                {Math.round(simulation.progress * 100)}%
                            </div>
                            <div className="h-4 bg-[rgba(0,255,255,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00FFFF] via-[#FF00FF] to-[#00FF66] animate-gradient rounded-full transition-all shadow-[0_0_15px_rgba(0,255,255,0.6)]"
                                    style={{ width: `${simulation.progress * 100}%` }}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-[#B8A8D0] uppercase mb-3 font-display tracking-widest">Waypoint</div>
                            <div className="text-4xl font-bold text-white font-display">
                                {simulation.currentWaypointIndex + 1}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-[#B8A8D0] uppercase mb-3 font-display tracking-widest">Speed</div>
                            <div className="text-4xl font-bold text-[#FFFF00] font-display">
                                {simulation.speed}x
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-[#B8A8D0] uppercase mb-3 font-display tracking-widest">Drone</div>
                            <div className="text-2xl font-bold text-white font-display flex items-center gap-3">
                                <Plane className="w-6 h-6 text-[#00FFFF]" />
                                {selectedDrone?.name || 'N/A'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mission History */}
            <div className="glass-panel border-2 border-[rgba(255,0,255,0.3)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b-2 border-[rgba(255,0,255,0.2)] bg-gradient-to-r from-[rgba(255,0,255,0.1)] to-transparent">
                    <h2 className="text-2xl font-display text-white flex items-center gap-4 tracking-widest">
                        <Clock className="w-6 h-6 text-[#FF00FF]" />
                        MISSION HISTORY
                    </h2>
                </div>

                {missions.length === 0 ? (
                    <div className="p-20 text-center">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#1a0030] to-[#0a0014] flex items-center justify-center mx-auto mb-8 border-2 border-[rgba(255,0,255,0.3)] shadow-[0_0_30px_rgba(255,0,255,0.2)]">
                            <Target className="w-12 h-12 text-[#B8A8D0]/50" />
                        </div>
                        <h3 className="text-2xl font-display text-white mb-4 tracking-wider">No Missions Yet</h3>
                        <p className="text-base text-[#B8A8D0] max-w-md mx-auto">
                            Navigate to the Dashboard, draw a survey area on the map, and start your first mission.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-[rgba(255,0,255,0.1)]">
                        {missions.map((mission, index) => (
                            <div
                                key={mission.id}
                                className="p-6 hover:bg-[rgba(255,0,255,0.05)] transition-colors animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1a0030] to-[#0a0014] flex items-center justify-center border border-[rgba(255,0,255,0.3)]">
                                            {getStatusIcon(mission.status)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-display text-white tracking-wider">{mission.name}</h3>
                                            <p className="text-sm text-[#B8A8D0] font-mono">ID: {mission.id}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-[11px] text-[#B8A8D0] uppercase font-display tracking-widest">Distance</div>
                                            <div className="text-lg font-mono text-[#00FFFF]">
                                                {mission.estimated_distance_km.toFixed(2)} km
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[11px] text-[#B8A8D0] uppercase font-display tracking-widest">Duration</div>
                                            <div className="text-lg font-mono text-[#00FF66]">
                                                {mission.estimated_duration_min} min
                                            </div>
                                        </div>
                                        <span className={`px-5 py-2 rounded-xl text-sm font-display border-2 tracking-wider ${getStatusColor(mission.status)}`}>
                                            {mission.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
