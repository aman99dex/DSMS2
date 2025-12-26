/**
 * AlertModal.tsx
 * 
 * Critical alert modal with glitched text effect.
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useUIStore } from '@/store';

export default function AlertModal() {
    const { isAlertModalOpen, alertMessage, hideAlert } = useUIStore();
    const [glitchActive, setGlitchActive] = useState(false);

    // Trigger glitch effect on open
    useEffect(() => {
        if (isAlertModalOpen) {
            setGlitchActive(true);
            const timer = setTimeout(() => setGlitchActive(false), 500);
            return () => clearTimeout(timer);
        }
    }, [isAlertModalOpen]);

    if (!isAlertModalOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[rgba(5,10,14,0.9)] backdrop-blur-sm"
                onClick={hideAlert}
            />

            {/* Modal */}
            <div className={`
        relative w-full max-w-md mx-4 p-6 rounded-lg
        bg-[#0A1014] border-2 border-[#FF003C]
        glow-red
        ${glitchActive ? 'animate-glitch' : ''}
      `}>
                {/* Scanline effect */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg opacity-20">
                    <div
                        className="absolute w-full h-1 bg-[#FF003C]"
                        style={{
                            animation: 'scanline 2s linear infinite',
                        }}
                    />
                </div>

                {/* Close button */}
                <button
                    onClick={hideAlert}
                    className="absolute top-4 right-4 w-8 h-8 rounded-lg border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#8892A0] hover:text-[#FF003C] hover:border-[#FF003C] transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Content */}
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[rgba(255,0,60,0.2)] flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-[#FF003C]" />
                    </div>
                    <div>
                        <h3 className={`
              text-lg font-mono font-bold text-[#FF003C] uppercase tracking-wider mb-2
              ${glitchActive ? 'animate-glitch' : ''}
            `}>
                            ⚠ CRITICAL ALERT
                        </h3>
                        <div className="text-sm text-[#F0F4F8] font-mono whitespace-pre-line">
                            {alertMessage}
                        </div>
                    </div>
                </div>

                {/* Action button */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={hideAlert}
                        className="hud-button danger"
                    >
                        Acknowledge
                    </button>
                </div>

                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FF003C] rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FF003C] rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FF003C] rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FF003C] rounded-br-lg" />
            </div>
        </div>
    );
}
