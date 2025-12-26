/**
 * Settings.tsx
 * 
 * Application settings and configuration page with NEON CYBERPUNK styling.
 */

import { useState } from 'react';
import { useMissionStore } from '@/store';
import {
    Settings as SettingsIcon,
    Map,
    Sliders,
    Info,
    Monitor,
    Globe,
    Camera,
    Gauge,
    Palette,
    Cpu,
    Zap
} from 'lucide-react';

export default function Settings() {
    const { missionConfig, setMissionConfig } = useMissionStore();
    const [mapStyle, setMapStyle] = useState('satellite');

    return (
        <main className="flex-1 overflow-auto p-8" style={{ background: 'linear-gradient(135deg, #0a0014 0%, #1a0030 50%, #0a0014 100%)' }}>
            {/* Header */}
            <div className="mb-10 animate-fade-in">
                <h1 className="text-4xl font-display text-white flex items-center gap-5 tracking-widest">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF00FF] via-[#00FFFF] to-[#FF00FF] flex items-center justify-center shadow-[0_0_50px_rgba(255,0,255,0.5)] animate-float relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/30" />
                        <SettingsIcon className="w-8 h-8 text-white relative z-10" />
                    </div>
                    <span className="text-glow-magenta">SETTINGS</span>
                </h1>
                <p className="text-base text-[#FF00FF] mt-3 font-display tracking-[0.3em] uppercase">
                    Configure application preferences
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Mission Defaults */}
                <div className="card-hover glass-panel border-2 border-[rgba(0,255,255,0.3)] rounded-2xl overflow-hidden animate-fade-in hover:border-[#00FFFF]">
                    <div className="p-6 border-b-2 border-[rgba(0,255,255,0.2)] bg-gradient-to-r from-[rgba(0,255,255,0.15)] to-transparent flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FFFF]/30 to-[#00FFFF]/10 flex items-center justify-center border border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                            <Sliders className="w-6 h-6 text-[#00FFFF]" />
                        </div>
                        <h2 className="text-xl font-display text-white tracking-widest">MISSION DEFAULTS</h2>
                    </div>
                    <div className="p-6 space-y-8">
                        {/* Altitude */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm text-[#B8A8D0] flex items-center gap-3 font-display tracking-wider uppercase">
                                    <Gauge className="w-5 h-5 text-[#00FFFF]" />
                                    Default Altitude
                                </label>
                                <span className="text-xl font-display font-bold text-[#00FFFF] bg-[rgba(0,255,255,0.15)] px-4 py-2 rounded-xl border border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                                    {missionConfig.altitude_m}m
                                </span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="120"
                                value={missionConfig.altitude_m}
                                onChange={(e) => setMissionConfig({ altitude_m: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-[#B8A8D0] mt-3 font-mono">
                                <span>20m</span>
                                <span>70m</span>
                                <span>120m</span>
                            </div>
                        </div>

                        {/* Overlap */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm text-[#B8A8D0] flex items-center gap-3 font-display tracking-wider uppercase">
                                    <Camera className="w-5 h-5 text-[#00FF66]" />
                                    Default Overlap
                                </label>
                                <span className="text-xl font-display font-bold text-[#00FF66] bg-[rgba(0,255,102,0.15)] px-4 py-2 rounded-xl border border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.3)]">
                                    {missionConfig.overlap_percent}%
                                </span>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="90"
                                value={missionConfig.overlap_percent}
                                onChange={(e) => setMissionConfig({ overlap_percent: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-[#B8A8D0] mt-3 font-mono">
                                <span>30%</span>
                                <span>60%</span>
                                <span>90%</span>
                            </div>
                        </div>

                        {/* Camera FOV */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm text-[#B8A8D0] flex items-center gap-3 font-display tracking-wider uppercase">
                                    <Camera className="w-5 h-5 text-[#FFFF00]" />
                                    Camera FOV
                                </label>
                                <span className="text-xl font-display font-bold text-[#FFFF00] bg-[rgba(255,255,0,0.15)] px-4 py-2 rounded-xl border border-[#FFFF00] shadow-[0_0_15px_rgba(255,255,0,0.3)]">
                                    {missionConfig.camera_fov_deg}°
                                </span>
                            </div>
                            <input
                                type="range"
                                min="60"
                                max="120"
                                value={missionConfig.camera_fov_deg}
                                onChange={(e) => setMissionConfig({ camera_fov_deg: parseInt(e.target.value) })}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs text-[#B8A8D0] mt-3 font-mono">
                                <span>60°</span>
                                <span>90°</span>
                                <span>120°</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Settings */}
                <div className="card-hover glass-panel border-2 border-[rgba(0,255,102,0.3)] rounded-2xl overflow-hidden animate-fade-in hover:border-[#00FF66]" style={{ animationDelay: '0.1s' }}>
                    <div className="p-6 border-b-2 border-[rgba(0,255,102,0.2)] bg-gradient-to-r from-[rgba(0,255,102,0.15)] to-transparent flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00FF66]/30 to-[#00FF66]/10 flex items-center justify-center border border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                            <Map className="w-6 h-6 text-[#00FF66]" />
                        </div>
                        <h2 className="text-xl font-display text-white tracking-widest">MAP SETTINGS</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="text-sm text-[#B8A8D0] mb-4 flex items-center gap-3 font-display tracking-wider uppercase">
                                <Palette className="w-5 h-5" />
                                Map Style
                            </label>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {['satellite', 'dark', 'light', 'streets'].map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setMapStyle(style)}
                                        className={`btn-glow p-5 rounded-xl border-2 text-base font-display capitalize transition-all tracking-wider ${mapStyle === style
                                            ? 'border-[#FF00FF] bg-gradient-to-br from-[rgba(255,0,255,0.25)] to-[rgba(255,0,255,0.1)] text-[#FF00FF] shadow-[0_0_25px_rgba(255,0,255,0.4)]'
                                            : 'border-[rgba(255,255,255,0.15)] text-[#B8A8D0] hover:border-[rgba(255,0,255,0.4)] hover:text-white'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t-2 border-[rgba(0,255,102,0.2)]">
                            <label className="text-sm text-[#B8A8D0] mb-4 flex items-center gap-3 font-display tracking-wider uppercase">
                                <Globe className="w-5 h-5" />
                                Globe Projection
                            </label>
                            <div className="flex items-center gap-4 mt-4">
                                <button className="btn-glow flex-1 p-5 rounded-xl border-2 border-[#00FFFF] bg-gradient-to-br from-[rgba(0,255,255,0.25)] to-[rgba(0,255,255,0.1)] text-[#00FFFF] text-base font-display tracking-widest shadow-[0_0_25px_rgba(0,255,255,0.4)]">
                                    GLOBE
                                </button>
                                <button className="btn-glow flex-1 p-5 rounded-xl border-2 border-[rgba(255,255,255,0.15)] text-[#B8A8D0] text-base font-display tracking-widest hover:border-[rgba(0,255,255,0.4)]">
                                    FLAT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* System Info */}
                <div className="card-hover glass-panel border-2 border-[rgba(255,0,255,0.3)] rounded-2xl col-span-2 overflow-hidden animate-fade-in hover:border-[#FF00FF]" style={{ animationDelay: '0.2s' }}>
                    <div className="p-6 border-b-2 border-[rgba(255,0,255,0.2)] bg-gradient-to-r from-[rgba(255,0,255,0.15)] to-transparent flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF00FF]/30 to-[#FF00FF]/10 flex items-center justify-center border border-[#FF00FF] shadow-[0_0_20px_rgba(255,0,255,0.3)]">
                            <Info className="w-6 h-6 text-[#FF00FF]" />
                        </div>
                        <h2 className="text-xl font-display text-white tracking-widest">SYSTEM INFORMATION</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-4 gap-6">
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-2xl p-6 border-2 border-[rgba(0,255,255,0.2)] hover:border-[#00FFFF] hover:shadow-[0_0_30px_rgba(0,255,255,0.3)] transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Cpu className="w-6 h-6 text-[#00FFFF] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Version</span>
                                </div>
                                <div className="text-3xl font-display font-bold text-white">3.0.0</div>
                                <div className="text-sm text-[#FF00FF] mt-2 font-display tracking-wider">Neon Edition</div>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-2xl p-6 border-2 border-[rgba(0,255,102,0.2)] hover:border-[#00FF66] hover:shadow-[0_0_30px_rgba(0,255,102,0.3)] transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Globe className="w-6 h-6 text-[#00FF66] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">MapLibre</span>
                                </div>
                                <div className="text-3xl font-display font-bold text-white">v5.15</div>
                                <div className="text-sm text-[#00FF66] mt-2 font-display tracking-wider">GL JS</div>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-2xl p-6 border-2 border-[rgba(255,255,0,0.2)] hover:border-[#FFFF00] hover:shadow-[0_0_30px_rgba(255,255,0,0.3)] transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Map className="w-6 h-6 text-[#FFFF00] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">Turf.js</span>
                                </div>
                                <div className="text-3xl font-display font-bold text-white">v7.3</div>
                                <div className="text-sm text-[#FFFF00] mt-2 font-display tracking-wider">Geospatial</div>
                            </div>
                            <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] rounded-2xl p-6 border-2 border-[rgba(255,0,255,0.2)] hover:border-[#FF00FF] hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] transition-all group">
                                <div className="flex items-center gap-3 mb-4">
                                    <Monitor className="w-6 h-6 text-[#FF00FF] group-hover:scale-110 transition-transform" />
                                    <span className="text-sm text-[#B8A8D0] uppercase font-display tracking-widest">React</span>
                                </div>
                                <div className="text-3xl font-display font-bold text-white">v19.2</div>
                                <div className="text-sm text-[#00FFFF] mt-2 font-display tracking-wider">Framework</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
