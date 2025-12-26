/**
 * Fleet.tsx
 * 
 * Fleet management page with NEON CYBERPUNK styling.
 */

import { useDroneStore } from '@/store';
import {
    Battery,
    Signal,
    MapPin,
    Gauge,
    Radio,
    Plane,
    Zap,
    Activity,
    RefreshCw,
    Wifi,
    Cpu
} from 'lucide-react';

export default function Fleet() {
    const { drones } = useDroneStore();

    const activeDrones = drones.filter((d) => d.status === 'FLYING');
    const idleDrones = drones.filter((d) => d.status === 'IDLE');
    const chargingDrones = drones.filter((d) => d.status === 'CHARGING');
    const offlineDrones = drones.filter((d) => d.status === 'OFFLINE');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'FLYING': return 'text-[#00FFFF] bg-[rgba(0,255,255,0.15)] border-[#00FFFF]';
            case 'IDLE': return 'text-[#00FF66] bg-[rgba(0,255,102,0.15)] border-[#00FF66]';
            case 'CHARGING': return 'text-[#FFFF00] bg-[rgba(255,255,0,0.15)] border-[#FFFF00]';
            case 'RETURNING': return 'text-[#FF6600] bg-[rgba(255,102,0,0.15)] border-[#FF6600]';
            default: return 'text-[#B8A8D0] bg-[rgba(184,168,208,0.15)] border-[#B8A8D0]';
        }
    };

    const getBatteryColor = (level: number) => {
        if (level > 60) return 'bg-gradient-to-r from-[#00FF66] to-[#00FFFF]';
        if (level > 30) return 'bg-gradient-to-r from-[#FFFF00] to-[#FF6600]';
        return 'bg-gradient-to-r from-[#FF0066] to-[#FF3366]';
    };

    return (
        <main className="flex-1 overflow-auto p-8" style={{ background: 'linear-gradient(135deg, #0a0014 0%, #1a0030 50%, #0a0014 100%)' }}>
            {/* Header */}
            <div className="mb-10 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-display text-white flex items-center gap-5 tracking-widest">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFFF] via-[#FF00FF] to-[#00FF66] flex items-center justify-center shadow-[0_0_50px_rgba(0,255,255,0.5)] animate-float relative">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/30" />
                                <Radio className="w-8 h-8 text-white relative z-10" />
                            </div>
                            <span className="text-glow-cyan">FLEET COMMAND</span>
                        </h1>
                        <p className="text-base text-[#00FFFF] mt-3 font-display tracking-[0.3em] uppercase">
                            Real-time Monitoring • {drones.length} units online
                        </p>
                    </div>
                    <button className="hud-button flex items-center gap-3 text-base">
                        <RefreshCw className="w-5 h-5" />
                        SYNC FLEET
                    </button>
                </div>
            </div>

            {/* Stats Cards - Neon Style */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#00FFFF] shadow-[0_0_30px_rgba(0,255,255,0.3)] group hover:shadow-[0_0_50px_rgba(0,255,255,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FFFF]/30 to-[#00FFFF]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all duration-300 border border-[#00FFFF]">
                            <Activity className="w-8 h-8 text-[#00FFFF]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#00FFFF] font-display">{activeDrones.length}</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Active</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#00FF66] shadow-[0_0_30px_rgba(0,255,102,0.3)] group hover:shadow-[0_0_50px_rgba(0,255,102,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00FF66]/30 to-[#00FF66]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] transition-all duration-300 border border-[#00FF66]">
                            <Plane className="w-8 h-8 text-[#00FF66]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#00FF66] font-display">{idleDrones.length}</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Ready</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#FFFF00] shadow-[0_0_30px_rgba(255,255,0,0.3)] group hover:shadow-[0_0_50px_rgba(255,255,0,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFFF00]/30 to-[#FFFF00]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,255,0,0.5)] transition-all duration-300 border border-[#FFFF00]">
                            <Zap className="w-8 h-8 text-[#FFFF00]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#FFFF00] font-display">{chargingDrones.length}</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Charging</div>
                        </div>
                    </div>
                </div>
                <div className="stat-card glass-panel p-6 rounded-2xl border-2 border-[#FF0066] shadow-[0_0_30px_rgba(255,0,102,0.3)] group hover:shadow-[0_0_50px_rgba(255,0,102,0.5)]">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF0066]/30 to-[#FF0066]/10 flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(255,0,102,0.5)] transition-all duration-300 border border-[#FF0066]">
                            <Wifi className="w-8 h-8 text-[#FF0066]" />
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-[#FF0066] font-display">{offlineDrones.length}</div>
                            <div className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Offline</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Drone Grid */}
            <div className="grid grid-cols-2 gap-6">
                {drones.map((drone, index) => (
                    <div
                        key={drone.id}
                        className="card-hover glass-panel p-7 border-2 border-[rgba(255,0,255,0.3)] rounded-2xl animate-fade-in hover:border-[#FF00FF]"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        {/* Corner decorations */}
                        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#FF00FF] rounded-tl-2xl" />
                        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#00FFFF] rounded-tr-2xl" />
                        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#00FFFF] rounded-bl-2xl" />
                        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#FF00FF] rounded-br-2xl" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6 relative">
                            <div className="flex items-center gap-5">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1a0030] to-[#0a0014] flex items-center justify-center border-2 border-[rgba(255,0,255,0.3)] ${drone.status === 'FLYING' ? 'animate-pulse-cyan shadow-[0_0_30px_rgba(0,255,255,0.4)]' : ''}`}>
                                    <Plane className="w-8 h-8 text-[#FF00FF]" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-display text-white tracking-wider">{drone.name}</h3>
                                    <p className="text-sm text-[#B8A8D0] font-mono tracking-wide">{drone.model}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${drone.status === 'IDLE' ? 'bg-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.8)]' : drone.status === 'CHARGING' ? 'bg-[#FFFF00] animate-pulse shadow-[0_0_10px_rgba(255,255,0,0.8)]' : drone.status === 'FLYING' ? 'bg-[#00FFFF] animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.8)]' : 'bg-[#B8A8D0]'}`} />
                                <span className={`px-4 py-2 rounded-xl text-sm font-display border-2 tracking-wider ${getStatusColor(drone.status)}`}>
                                    {drone.status}
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-5 mb-6">
                            {/* Battery */}
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-2xl p-5 border border-[rgba(255,0,255,0.2)]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[#B8A8D0] flex items-center gap-2 uppercase font-display tracking-wider">
                                        <Battery className="w-5 h-5" /> Battery
                                    </span>
                                    <span className={`text-xl font-display font-bold ${drone.battery > 60 ? 'text-[#00FF66]' : drone.battery > 30 ? 'text-[#FFFF00]' : 'text-[#FF0066]'}`}>
                                        {drone.battery}%
                                    </span>
                                </div>
                                <div className="h-3 bg-[rgba(255,0,255,0.1)] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getBatteryColor(drone.battery)} transition-all duration-700 ease-out rounded-full shadow-[0_0_10px]`}
                                        style={{ width: `${drone.battery}%` }}
                                    />
                                </div>
                            </div>

                            {/* Signal */}
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-2xl p-5 border border-[rgba(0,255,255,0.2)]">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm text-[#B8A8D0] flex items-center gap-2 uppercase font-display tracking-wider">
                                        <Signal className="w-5 h-5" /> Signal
                                    </span>
                                    <span className="text-xl font-display font-bold text-[#00FFFF]">{drone.signal}%</span>
                                </div>
                                <div className="h-3 bg-[rgba(0,255,255,0.1)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(0,255,255,0.5)]"
                                        style={{ width: `${drone.signal}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl p-4 text-center border border-[rgba(255,0,255,0.15)] hover:border-[#FF00FF] hover:shadow-[0_0_20px_rgba(255,0,255,0.3)] transition-all">
                                <MapPin className="w-6 h-6 text-[#FF00FF] mx-auto mb-2" />
                                <div className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider mb-1">Position</div>
                                <div className="text-sm font-mono text-white truncate">
                                    {drone.position.lat.toFixed(3)}°, {drone.position.lng.toFixed(3)}°
                                </div>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl p-4 text-center border border-[rgba(0,255,102,0.15)] hover:border-[#00FF66] hover:shadow-[0_0_20px_rgba(0,255,102,0.3)] transition-all">
                                <Gauge className="w-6 h-6 text-[#00FF66] mx-auto mb-2" />
                                <div className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider mb-1">Max Speed</div>
                                <div className="text-sm font-mono text-white">{drone.speed_kmh} km/h</div>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-xl p-4 text-center border border-[rgba(0,255,255,0.15)] hover:border-[#00FFFF] hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
                                <Radio className="w-6 h-6 text-[#00FFFF] mx-auto mb-2" />
                                <div className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider mb-1">Range</div>
                                <div className="text-sm font-mono text-white">{drone.max_range_km} km</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
