/**
 * Layout.tsx
 * 
 * Shared layout component with navigation header and footer.
 * DRAMATIC NEON CYBERPUNK DESIGN
 */

import { NavLink, Outlet } from 'react-router-dom';
import { Plane, Settings, LayoutDashboard, Radio, Target, Zap, BarChart3, Sun, Moon } from 'lucide-react';
import AlertModal from './AlertModal';
import { useEffect, useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';

export default function Layout() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `px-5 py-3 rounded-xl font-display text-base transition-all duration-300 flex items-center gap-3 uppercase tracking-wider ${isActive
            ? 'bg-gradient-to-r from-[#FF00FF]/30 to-[#00FFFF]/20 text-[#FF00FF] border-2 border-[#FF00FF] shadow-[0_0_30px_rgba(255,0,255,0.4)]'
            : 'text-[#B8A8D0] hover:text-[#FF00FF] hover:bg-[rgba(255,0,255,0.1)] border-2 border-transparent hover:border-[rgba(255,0,255,0.3)]'
        }`;

    return (
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-themed">
            {/* Top Navigation - Neon Header */}
            <header className="h-20 flex-shrink-0 glass-panel border-b-2 border-[rgba(255,0,255,0.3)] flex items-center justify-between px-6 z-20">
                {/* Logo - Animated Neon */}
                <NavLink to="/" className="flex items-center gap-4 hover:scale-105 transition-transform duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF00FF] via-[#FF66FF] to-[#00FFFF] flex items-center justify-center shadow-[0_0_40px_rgba(255,0,255,0.6)] group-hover:shadow-[0_0_60px_rgba(255,0,255,0.8)] transition-all duration-300 animate-float relative">
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/30" />
                        <Plane className="w-6 h-6 text-white relative z-10 drop-shadow-lg" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-widest font-display text-glow-magenta">DSMS</h1>
                        <p className="text-[9px] text-[#00FFFF] font-display uppercase tracking-[0.2em]">
                            Drone Survey
                        </p>
                    </div>
                </NavLink>

                {/* Center - Navigation */}
                <nav className="flex items-center gap-4">
                    <NavLink to="/" className={navLinkClass} end>
                        <LayoutDashboard className="w-8 h-8" />
                        Dashboard
                    </NavLink>
                    <NavLink to="/fleet" className={navLinkClass}>
                        <Radio className="w-8 h-8" />
                        Fleet
                    </NavLink>
                    <NavLink to="/missions" className={navLinkClass}>
                        <Target className="w-8 h-8" />
                        Missions
                    </NavLink>
                    <NavLink to="/analytics" className={navLinkClass}>
                        <BarChart3 className="w-8 h-8" />
                        Analytics
                    </NavLink>
                    <NavLink to="/settings" className={navLinkClass}>
                        <Settings className="w-8 h-8" />
                        Settings
                    </NavLink>
                </nav>

                {/* Right - Status Panel & Theme Toggle */}
                <div className="flex items-center gap-4">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${theme === 'dark'
                                ? 'border-[#FFFF00] bg-gradient-to-r from-[rgba(255,255,0,0.15)] to-transparent shadow-[0_0_20px_rgba(255,255,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,0,0.5)]'
                                : 'border-[#333333] bg-[#1a1a2e] shadow-lg hover:bg-[#2a2a3e]'
                            }`}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-6 h-6 text-[#FFFF00]" />
                        ) : (
                            <Moon className="w-6 h-6 text-white" />
                        )}
                    </button>

                    {/* Online Status */}
                    <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 border-[#00FF66] bg-gradient-to-r from-[rgba(0,255,102,0.15)] to-transparent shadow-[0_0_20px_rgba(0,255,102,0.3)]">
                        <div className="w-3 h-3 rounded-full bg-[#00FF66] animate-pulse shadow-[0_0_15px_rgba(0,255,102,0.8)]" />
                        <span className="text-sm text-[#00FF66] font-display tracking-widest uppercase">Online</span>
                        <Zap className="w-4 h-4 text-[#00FF66]" />
                    </div>
                    <div className="text-lg text-[#00FFFF] font-mono bg-[rgba(0,255,255,0.1)] px-4 py-2 rounded-xl border border-[rgba(0,255,255,0.3)] shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                        {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                    </div>
                </div>
            </header>

            {/* Page Content */}
            <Outlet />

            {/* Footer Status Bar - Neon Styled */}
            <footer className="h-10 flex-shrink-0 glass-panel border-t-2 border-[rgba(255,0,255,0.3)] flex items-center justify-between px-6 text-xs font-mono z-20">
                <div className="flex items-center gap-6 text-[#B8A8D0]">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00FF66] shadow-[0_0_10px_rgba(0,255,102,0.8)] animate-pulse" />
                        <span className="text-[#00FF66]">CONNECTED</span>
                    </span>
                    <span className="text-[#6B5B8A]">│</span>
                    <span>MAPLIBRE <span className="text-[#FF00FF]">v5.15</span></span>
                    <span className="text-[#6B5B8A]">│</span>
                    <span>TURF.JS <span className="text-[#00FFFF]">v7.3</span></span>
                    <span className="text-[#6B5B8A]">│</span>
                    <span>REACT <span className="text-[#00FF66]">v19</span></span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-[#FF00FF] font-display tracking-widest text-glow-magenta">DSMS NEON</span>
                    <span className="text-[#00FFFF] font-bold animate-pulse">v3.0</span>
                </div>
            </footer>

            {/* Alert Modal */}
            <AlertModal />
        </div>
    );
}
