import { useState, useEffect } from 'react';
import { BatteryLow, Lock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LowBatteryGuard({ onLowBattery }) {
    const [battery, setBattery] = useState(null); // 0-100
    const [isCharging, setIsCharging] = useState(false);
    const [locked, setLocked] = useState(false);

    useEffect(() => {
        if (!navigator.getBattery) {
            // Simulate for demo: battery at 8%
            setBattery(8);
            setIsCharging(false);
            return;
        }
        navigator.getBattery().then(b => {
            const update = () => {
                const level = Math.round(b.level * 100);
                setBattery(level);
                setIsCharging(b.charging);
                if (level <= 10 && !b.charging) {
                    setLocked(true);
                    onLowBattery?.(true);
                } else {
                    setLocked(false);
                    onLowBattery?.(false);
                }
            };
            update();
            b.addEventListener('levelchange', update);
            b.addEventListener('chargingchange', update);
        });
    }, []);

    if (battery === null || battery > 15) return null;

    const isLow = battery <= 10 && !isCharging;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl border p-4 space-y-2 ${isLow
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-cyan-500/10 border-cyan-500/30'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <BatteryLow className={`w-4 h-4 ${isLow ? 'text-red-400' : 'text-cyan-400'}`} />
                    <span className={`text-sm font-semibold ${isLow ? 'text-red-400' : 'text-cyan-400'}`}>
                        {isLow ? `Low Battery — ${battery}%` : `Battery at ${battery}%`}
                    </span>
                </div>

                {isLow && (
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-red-400 flex-shrink-0" />
                            <span>CPS snapshot locked — your claim eligibility is preserved</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Shield className="w-3 h-3 text-green-400 flex-shrink-0" />
                            <span>Auto-approve fallback active — heavy tracking paused</span>
                        </div>
                    </div>
                )}

                {!isLow && battery <= 15 && (
                    <p className="text-xs text-muted-foreground">
                        Charge soon. Protection mode will activate below 10%.
                    </p>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
