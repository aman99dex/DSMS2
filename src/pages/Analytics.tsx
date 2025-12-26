/**
 * Analytics.tsx
 * 
 * Organization-wide analytics and reporting dashboard with NEON CYBERPUNK styling.
 */

import { useMemo } from 'react';
import { useDroneStore, useMissionStore, useOrgStatsStore } from '@/store';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Target,
    Plane,
    MapPin,
    Camera,
    Battery,
    CheckCircle,
    XCircle,
    Zap,
    Activity,
    Globe,
    Calendar
} from 'lucide-react';

export default function Analytics() {
    const { drones } = useDroneStore();
    const { missions } = useMissionStore();
    const { stats } = useOrgStatsStore();

    // Calculate additional metrics
    const metrics = useMemo(() => {
        const completedMissions = missions.filter(m => m.status === 'COMPLETED');
        const totalDistance = completedMissions.reduce((acc, m) => acc + m.estimated_distance_km, 0);
        const totalArea = completedMissions.reduce((acc, m) => acc + (m.area_sq_km || 0), 0);
        const totalPhotos = completedMissions.reduce((acc, m) => acc + (m.actual_photos || 0), 0);
        const avgDuration = completedMissions.length > 0
            ? completedMissions.reduce((acc, m) => acc + m.estimated_duration_min, 0) / completedMissions.length
            : 0;
        const totalFlightHours = drones.reduce((acc, d) => acc + d.totalFlightHours, 0);

        return {
            totalDistance: Math.round(totalDistance * 10) / 10,
            totalArea: Math.round(totalArea * 100) / 100,
            totalPhotos,
            avgDuration: Math.round(avgDuration),
            totalFlightHours: Math.round(totalFlightHours * 10) / 10,
            successRate: missions.length > 0
                ? Math.round((completedMissions.length / missions.length) * 100)
                : 0,
        };
    }, [missions, drones]);

    // Fleet utilization data
    const fleetData = useMemo(() => {
        return drones.map(drone => ({
            id: drone.id,
            name: drone.name,
            missions: drone.totalMissions,
            hours: drone.totalFlightHours,
            utilization: Math.min(100, Math.round((drone.totalFlightHours / 500) * 100)), // Assume 500hrs max
            battery: drone.battery,
            status: drone.status,
        }));
    }, [drones]);

    return (
        <main className="analytics-page flex-1 overflow-auto p-8" style={{ background: 'linear-gradient(135deg, #0a0014 0%, #1a0030 50%, #0a0014 100%)' }}>
            {/* Header */}
            <div className="mb-10 animate-fade-in">
                <h1 className="text-4xl font-display text-white flex items-center gap-5 tracking-widest">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF00FF] via-[#00FFFF] to-[#00FF66] flex items-center justify-center shadow-[0_0_50px_rgba(255,0,255,0.5)] animate-float relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/30" />
                        <BarChart3 className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <span className="text-glow-magenta">ANALYTICS HQ</span>
                </h1>
                <p className="text-base text-[#FF00FF] mt-3 font-display tracking-[0.3em] uppercase">
                    Organization Performance • Fleet Insights • Mission Intelligence
                </p>
            </div>

            {/* Primary Stats Grid */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#00FFFF] shadow-[0_0_30px_rgba(0,255,255,0.3)] group hover:shadow-[0_0_50px_rgba(0,255,255,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFFF]/30 to-[#00FFFF]/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-[#00FFFF]">
                            <Target className="w-8 h-8 text-[#00FFFF]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#00FFFF] font-display">{missions.length}</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Total Missions</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.3)] group hover:shadow-[0_0_50px_rgba(0,255,102,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF66]/30 to-[#00FF66]/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-[#00FF66]">
                            <Clock className="w-8 h-8 text-[#00FF66]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#00FF66] font-display">{metrics.totalFlightHours}h</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Flight Hours</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#FFFF00] shadow-[0_0_30px_rgba(255,255,0,0.3)] group hover:shadow-[0_0_50px_rgba(255,255,0,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFFF00]/30 to-[#FFFF00]/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-[#FFFF00]">
                            <Globe className="w-8 h-8 text-[#FFFF00]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#FFFF00] font-display">{metrics.totalArea} km²</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Area Covered</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#FF00FF] shadow-[0_0_30px_rgba(255,0,255,0.3)] group hover:shadow-[0_0_50px_rgba(255,0,255,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF00FF]/30 to-[#FF00FF]/10 flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-[#FF00FF]">
                            <TrendingUp className="w-8 h-8 text-[#FF00FF]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#FF00FF] font-display">{metrics.successRate}%</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Success Rate</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-8 mb-10">
                {/* Mission Breakdown */}
                <div className="glass-panel border-2 border-[rgba(0,255,255,0.3)] rounded-2xl overflow-hidden">
                    <div className="p-6 border-b-2 border-[rgba(0,255,255,0.2)] bg-gradient-to-r from-[rgba(0,255,255,0.1)] to-transparent">
                        <h2 className="text-xl font-display text-white flex items-center gap-4 tracking-widest">
                            <Activity className="w-6 h-6 text-[#00FFFF]" />
                            MISSION BREAKDOWN
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Completed */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[#B8A8D0] flex items-center gap-2 font-display tracking-wider">
                                    <CheckCircle className="w-4 h-4 text-[#00FF66]" />
                                    Completed
                                </span>
                                <span className="text-xl font-display font-bold text-[#00FF66]">
                                    {missions.filter(m => m.status === 'COMPLETED').length}
                                </span>
                            </div>
                            <div className="h-3 bg-[rgba(0,255,102,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00FF66] to-[#00FFFF] rounded-full transition-all"
                                    style={{ width: `${missions.length ? (missions.filter(m => m.status === 'COMPLETED').length / missions.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                        {/* Aborted */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-[#B8A8D0] flex items-center gap-2 font-display tracking-wider">
                                    <XCircle className="w-4 h-4 text-[#FF0066]" />
                                    Aborted
                                </span>
                                <span className="text-xl font-display font-bold text-[#FF0066]">
                                    {missions.filter(m => m.status === 'ABORTED').length}
                                </span>
                            </div>
                            <div className="h-3 bg-[rgba(255,0,102,0.1)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#FF0066] to-[#FF6600] rounded-full transition-all"
                                    style={{ width: `${missions.length ? (missions.filter(m => m.status === 'ABORTED').length / missions.length) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-[rgba(0,255,255,0.1)]">
                            <div className="text-center p-4 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(0,255,255,0.2)]">
                                <Camera className="w-6 h-6 text-[#00FFFF] mx-auto mb-2" />
                                <div className="text-2xl font-display font-bold text-white">{metrics.totalPhotos.toLocaleString()}</div>
                                <div className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider">Photos Taken</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(255,0,255,0.2)]">
                                <MapPin className="w-6 h-6 text-[#FF00FF] mx-auto mb-2" />
                                <div className="text-2xl font-display font-bold text-white">{metrics.totalDistance} km</div>
                                <div className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider">Distance Flown</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fleet Performance */}
                <div className="glass-panel border-2 border-[rgba(0,255,102,0.3)] rounded-2xl overflow-hidden">
                    <div className="p-6 border-b-2 border-[rgba(0,255,102,0.2)] bg-gradient-to-r from-[rgba(0,255,102,0.1)] to-transparent">
                        <h2 className="text-xl font-display text-white flex items-center gap-4 tracking-widest">
                            <Plane className="w-6 h-6 text-[#00FF66]" />
                            FLEET PERFORMANCE
                        </h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
                        {fleetData.map((drone, index) => (
                            <div
                                key={drone.id}
                                className="p-4 bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl border border-[rgba(255,0,255,0.2)] hover:border-[#FF00FF] transition-all animate-fade-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="font-display text-white tracking-wider">{drone.name}</span>
                                    <span className={`text-sm font-mono ${drone.status === 'IDLE' ? 'text-[#00FF66]' : drone.status === 'FLYING' ? 'text-[#00FFFF]' : 'text-[#FFFF00]'}`}>
                                        {drone.status}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <div className="text-lg font-display font-bold text-[#00FFFF]">{drone.missions}</div>
                                        <div className="text-[9px] text-[#B8A8D0] uppercase">Missions</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-display font-bold text-[#00FF66]">{drone.hours}h</div>
                                        <div className="text-[9px] text-[#B8A8D0] uppercase">Flight Hrs</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-display font-bold text-[#FF00FF]">{drone.utilization}%</div>
                                        <div className="text-[9px] text-[#B8A8D0] uppercase">Utilized</div>
                                    </div>
                                </div>
                                <div className="mt-3 h-2 bg-[rgba(255,0,255,0.1)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#FF00FF] to-[#00FFFF] rounded-full"
                                        style={{ width: `${drone.utilization}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Missions Table */}
            <div className="glass-panel border-2 border-[rgba(255,0,255,0.3)] rounded-2xl overflow-hidden">
                <div className="p-6 border-b-2 border-[rgba(255,0,255,0.2)] bg-gradient-to-r from-[rgba(255,0,255,0.1)] to-transparent flex items-center justify-between">
                    <h2 className="text-xl font-display text-white flex items-center gap-4 tracking-widest">
                        <Calendar className="w-6 h-6 text-[#FF00FF]" />
                        RECENT MISSIONS
                    </h2>
                    <span className="text-sm text-[#B8A8D0] font-mono">Showing last {Math.min(5, missions.length)} missions</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-[rgba(255,0,255,0.1)]">
                                <th className="text-left p-4 text-sm text-[#B8A8D0] font-display tracking-wider uppercase">Mission</th>
                                <th className="text-left p-4 text-sm text-[#B8A8D0] font-display tracking-wider uppercase">Status</th>
                                <th className="text-right p-4 text-sm text-[#B8A8D0] font-display tracking-wider uppercase">Duration</th>
                                <th className="text-right p-4 text-sm text-[#B8A8D0] font-display tracking-wider uppercase">Distance</th>
                                <th className="text-right p-4 text-sm text-[#B8A8D0] font-display tracking-wider uppercase">Area</th>
                                <th className="text-right p-4 text-sm text-[#B8A8D0] font-display tracking-wider uppercase">Coverage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {missions.slice(0, 5).map((mission, index) => (
                                <tr
                                    key={mission.id}
                                    className="border-b border-[rgba(255,0,255,0.05)] hover:bg-[rgba(255,0,255,0.05)] transition-colors animate-fade-in"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <td className="p-4">
                                        <div className="font-display text-white tracking-wider">{mission.name}</div>
                                        <div className="text-xs text-[#6B5B8A] font-mono">{mission.id}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-lg text-xs font-display tracking-wider border
                                            ${mission.status === 'COMPLETED' ? 'border-[#00FF66] text-[#00FF66] bg-[rgba(0,255,102,0.1)]' : ''}
                                            ${mission.status === 'ABORTED' ? 'border-[#FF0066] text-[#FF0066] bg-[rgba(255,0,102,0.1)]' : ''}
                                            ${mission.status === 'IN_PROGRESS' ? 'border-[#00FFFF] text-[#00FFFF] bg-[rgba(0,255,255,0.1)]' : ''}
                                        `}>
                                            {mission.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-[#00FFFF]">{mission.estimated_duration_min} min</td>
                                    <td className="p-4 text-right font-mono text-[#00FF66]">{mission.estimated_distance_km.toFixed(1)} km</td>
                                    <td className="p-4 text-right font-mono text-[#FFFF00]">{(mission.area_sq_km || 0).toFixed(2)} km²</td>
                                    <td className="p-4 text-right font-mono text-[#FF00FF]">{mission.coverage_percent || 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
