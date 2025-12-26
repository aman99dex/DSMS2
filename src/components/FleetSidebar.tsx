/**
 * FleetSidebar.tsx
 * 
 * Collapsible sidebar with NEON CYBERPUNK effect showing fleet roster.
 */

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Radio, Plane, Zap, Cpu } from 'lucide-react';
import { useDroneStore } from '@/store';
import DroneCard from './DroneCard';

export default function FleetSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { drones } = useDroneStore();

    const activeDrones = drones.filter((d) => d.status === 'FLYING');
    const readyDrones = drones.filter((d) => d.status === 'IDLE' && d.battery > 20);
    const chargingDrones = drones.filter((d) => d.status === 'CHARGING' || d.battery <= 20);

    return (
        <div
            className={`
                flex-shrink-0 h-full glass-panel transition-all duration-400 border-r-2 border-[rgba(255,0,255,0.3)]
                ${isCollapsed ? 'w-20' : 'w-[340px]'}
            `}
        >
            {/* Header */}
            <div className="p-5 border-b-2 border-[rgba(255,0,255,0.2)]">
                <div className="flex items-center justify-between">
                    {!isCollapsed && (
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF00FF] to-[#00FFFF] flex items-center justify-center shadow-[0_0_30px_rgba(255,0,255,0.5)] animate-pulse-magenta">
                                <Radio className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-display text-white tracking-widest text-glow-magenta">FLEET</h2>
                                <p className="text-[10px] text-[#00FFFF] font-display uppercase tracking-[0.2em]">Command Roster</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-10 h-10 rounded-xl border-2 border-[rgba(255,0,255,0.4)] flex items-center justify-center text-[#B8A8D0] hover:text-[#FF00FF] hover:border-[#FF00FF] hover:shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all duration-300 bg-[rgba(255,0,255,0.1)]"
                    >
                        {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {!isCollapsed && (
                <>
                    {/* Quick Stats - Neon Cards */}
                    <div className="grid grid-cols-3 gap-3 p-5 border-b-2 border-[rgba(255,0,255,0.2)]">
                        <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#1a0030] rounded-xl border-2 border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)] transition-all">
                            <div className="text-2xl font-bold text-[#00FFFF] font-display">{activeDrones.length}</div>
                            <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">Active</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#1a0030] rounded-xl border-2 border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.3)] hover:shadow-[0_0_30px_rgba(0,255,102,0.5)] transition-all">
                            <div className="text-2xl font-bold text-[#00FF66] font-display">{readyDrones.length}</div>
                            <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">Ready</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-[#0a0014] to-[#1a0030] rounded-xl border-2 border-[#FFFF00] shadow-[0_0_20px_rgba(255,255,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,0,0.5)] transition-all">
                            <div className="text-2xl font-bold text-[#FFFF00] font-display">{chargingDrones.length}</div>
                            <div className="text-[9px] text-[#B8A8D0] uppercase font-display tracking-wider">Charging</div>
                        </div>
                    </div>

                    {/* Drone List */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {drones.map((drone) => (
                            <DroneCard key={drone.id} drone={drone} />
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t-2 border-[rgba(255,0,255,0.2)] bg-gradient-to-t from-[rgba(255,0,255,0.1)] to-transparent">
                        <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-[#B8A8D0]">
                                <Plane className="w-4 h-4 text-[#FF00FF]" />
                                <span className="font-display tracking-wider">{drones.length} UNITS</span>
                            </span>
                            <span className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-[#00FF66]" />
                                <span className="font-display text-[#00FF66] tracking-wider">SYNCED</span>
                            </span>
                        </div>
                    </div>
                </>
            )}

            {/* Collapsed state icons */}
            {isCollapsed && (
                <div className="flex flex-col items-center gap-5 p-4 mt-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF00FF] to-[#00FFFF] flex items-center justify-center shadow-[0_0_25px_rgba(255,0,255,0.5)]">
                        <Radio className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-center p-3 bg-[rgba(0,255,255,0.1)] rounded-xl border border-[#00FFFF]">
                        <div className="text-xl font-bold text-[#00FFFF] font-display">{activeDrones.length}</div>
                        <div className="text-[8px] text-[#B8A8D0] uppercase">ACTIVE</div>
                    </div>
                    <div className="text-center p-3 bg-[rgba(0,255,102,0.1)] rounded-xl border border-[#00FF66]">
                        <div className="text-xl font-bold text-[#00FF66] font-display">{readyDrones.length}</div>
                        <div className="text-[8px] text-[#B8A8D0] uppercase">READY</div>
                    </div>
                </div>
            )}
        </div>
    );
}
