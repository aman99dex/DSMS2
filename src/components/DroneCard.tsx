/**
 * DroneCard.tsx
 * 
 * Individual drone status card with NEON CYBERPUNK styling.
 * Dramatic visual effects with magenta/cyan theme.
 */

import { Battery, Signal, Radio, Zap } from 'lucide-react';
import type { Drone } from '@/types';
import { useDroneStore } from '@/store';

interface DroneCardProps {
    drone: Drone;
}

export default function DroneCard({ drone }: DroneCardProps) {
    const { selectedDroneId, selectDrone } = useDroneStore();
    const isSelected = selectedDroneId === drone.id;
    const isLowBattery = drone.battery < 20;
    const isFlying = drone.status === 'FLYING';

    const statusColors: Record<string, string> = {
        IDLE: 'bg-[#00FF66]',
        FLYING: 'bg-[#00FFFF]',
        RETURNING: 'bg-[#FF6600]',
        CHARGING: 'bg-[#FFFF00]',
        OFFLINE: 'bg-[#FF0066]',
    };

    const statusLabels: Record<string, string> = {
        IDLE: 'READY',
        FLYING: 'ACTIVE',
        RETURNING: 'RTH',
        CHARGING: 'CHARGING',
        OFFLINE: 'OFFLINE',
    };

    return (
        <button
            onClick={() => selectDrone(isSelected ? null : drone.id)}
            className={`
                w-full p-5 rounded-2xl text-left transition-all duration-400 relative overflow-hidden
                ${isSelected
                    ? 'border-2 border-[#FF00FF] bg-gradient-to-br from-[rgba(255,0,255,0.2)] to-[rgba(0,255,255,0.1)] shadow-[0_0_40px_rgba(255,0,255,0.4)]'
                    : 'border border-[rgba(255,0,255,0.2)] bg-gradient-to-br from-[#1a0030] to-[#120020] hover:border-[#FF00FF] hover:shadow-[0_0_30px_rgba(255,0,255,0.3)]'}
                ${isFlying ? 'animate-pulse-cyan' : ''}
                ${isLowBattery && !isFlying ? 'border-[#FF0066] shadow-[0_0_20px_rgba(255,0,102,0.3)]' : ''}
                transform hover:translate-y-[-4px] hover:scale-[1.02]
            `}
        >
            {/* Animated corner accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FF00FF] rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00FFFF] rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00FFFF] rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FF00FF] rounded-br-2xl" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${statusColors[drone.status]} shadow-[0_0_12px] ${isFlying ? 'animate-pulse' : ''}`}
                        style={{ boxShadow: `0 0 12px ${statusColors[drone.status].replace('bg-[', '').replace(']', '')}` }} />
                    <span className="font-display text-base text-white tracking-wider">{drone.name}</span>
                </div>
                <span className={`
                    px-3 py-1.5 rounded-lg text-[10px] font-display uppercase tracking-widest border
                    ${drone.status === 'FLYING' ? 'bg-[rgba(0,255,255,0.2)] text-[#00FFFF] border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.3)]' : ''}
                    ${drone.status === 'IDLE' ? 'bg-[rgba(0,255,102,0.2)] text-[#00FF66] border-[#00FF66]' : ''}
                    ${drone.status === 'CHARGING' ? 'bg-[rgba(255,255,0,0.2)] text-[#FFFF00] border-[#FFFF00]' : ''}
                    ${drone.status === 'OFFLINE' ? 'bg-[rgba(255,0,102,0.2)] text-[#FF0066] border-[#FF0066]' : ''}
                `}>
                    {statusLabels[drone.status]}
                </span>
            </div>

            {/* Model */}
            <p className="text-[#B8A8D0] text-xs mb-4 font-mono">{drone.model}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                {/* Battery */}
                <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] p-3 rounded-xl border border-[rgba(255,0,255,0.15)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Battery className={`w-4 h-4 ${isLowBattery ? 'text-[#FF0066]' : 'text-[#B8A8D0]'}`} />
                        <span className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider">Battery</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-[rgba(255,0,255,0.1)] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isLowBattery
                                        ? 'bg-gradient-to-r from-[#FF0066] to-[#FF3366]'
                                        : drone.battery > 60
                                            ? 'bg-gradient-to-r from-[#00FF66] to-[#00FFFF]'
                                            : 'bg-gradient-to-r from-[#FFFF00] to-[#FF6600]'
                                    }`}
                                style={{ width: `${drone.battery}%` }}
                            />
                        </div>
                        <span className={`font-mono text-xs font-bold ${isLowBattery ? 'text-[#FF0066]' : 'text-white'}`}>
                            {Math.round(drone.battery)}%
                        </span>
                    </div>
                </div>

                {/* Signal */}
                <div className="bg-gradient-to-br from-[#0a0014] to-[#120020] p-3 rounded-xl border border-[rgba(0,255,255,0.15)]">
                    <div className="flex items-center gap-2 mb-2">
                        <Signal className="w-4 h-4 text-[#B8A8D0]" />
                        <span className="text-[10px] text-[#B8A8D0] uppercase font-display tracking-wider">Signal</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 bg-[rgba(0,255,255,0.1)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] rounded-full transition-all duration-500"
                                style={{ width: `${drone.signal}%` }}
                            />
                        </div>
                        <span className="font-mono text-xs text-white font-bold">{drone.signal}%</span>
                    </div>
                </div>
            </div>

            {/* Range indicator */}
            <div className="mt-4 pt-3 border-t border-[rgba(255,0,255,0.15)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#FFFF00]" />
                    <span className="text-xs text-[#B8A8D0] font-mono">{drone.speed_kmh} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-[#00FFFF]" />
                    <span className="text-xs text-[#B8A8D0] font-mono">{drone.max_range_km} km range</span>
                </div>
            </div>
        </button>
    );
}
