import { useState } from 'react';
import { Navigation, MapPin, AlertTriangle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SAFE_ZONES = {
    Mumbai: [
        { zone: 'Bandra West', distance: '3.2 km', risk: 'Low', tip: 'Covered elevated roads' },
        { zone: 'Andheri East', distance: '5.1 km', risk: 'Low', tip: 'Metro-accessible, sheltered' },
        { zone: 'Kurla Station', distance: '4.8 km', risk: 'Medium', tip: 'Indoor hub, partial shelter' },
    ],
    Delhi: [
        { zone: 'Connaught Place', distance: '2.4 km', risk: 'Low', tip: 'Underground passages available' },
        { zone: 'Lajpat Nagar', distance: '6.0 km', risk: 'Low', tip: 'Covered market area' },
        { zone: 'Saket', distance: '7.2 km', risk: 'Low', tip: 'Mall complexes for shelter' },
    ],
    Bengaluru: [
        { zone: 'Koramangala', distance: '2.0 km', risk: 'Low', tip: 'Higher elevation, drains well' },
        { zone: 'Indiranagar', distance: '3.5 km', risk: 'Low', tip: 'Wide roads, less waterlogging' },
        { zone: 'Whitefield', distance: '8.1 km', risk: 'Medium', tip: 'Tech parks offer indoor rest' },
    ],
    Chennai: [
        { zone: 'T. Nagar', distance: '2.8 km', risk: 'Low', tip: 'Commercial district, sheltered' },
        { zone: 'Adyar', distance: '4.3 km', risk: 'Low', tip: 'Inland, less coastal exposure' },
        { zone: 'Velachery', distance: '6.5 km', risk: 'Medium', tip: 'Raised areas, good roads' },
    ],
};

const riskColor = {
    Low: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    Medium: { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

export default function SafeZoneRerouter({ weather, city }) {
    const [expanded, setExpanded] = useState(false);
    const [notified, setNotified] = useState(false);

    if (!weather?.severe) return null;

    const zones = SAFE_ZONES[city] || SAFE_ZONES['Mumbai'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/70 to-card/30 backdrop-blur-sm overflow-hidden"
        >
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-4"
            >
                <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-foreground">Safe Zone Rerouting</span>
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                        SEVERE WEATHER
                    </span>
                </div>
                {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3">
                            <div className="flex items-start gap-2 text-xs text-cyan-400/80 bg-cyan-500/10 p-2.5 rounded-lg">
                                <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span>{weather.name} detected in {city}. Consider moving to a safer delivery zone.</span>
                            </div>

                            <div className="space-y-2">
                                {zones.map((z, i) => {
                                    const rc = riskColor[z.risk] || riskColor.Medium;
                                    return (
                                        <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border ${rc.bg} ${rc.border}`}>
                                            <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${rc.text}`} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold">{z.zone}</p>
                                                <p className="text-[10px] text-muted-foreground">{z.tip}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className={`text-[10px] font-semibold ${rc.text}`}>{z.risk} Risk</p>
                                                <p className="text-[10px] text-muted-foreground">{z.distance}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setNotified(true)}
                                disabled={notified}
                                className={`w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg border transition-all ${notified
                                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                        : 'bg-secondary border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                                    }`}
                            >
                                {notified ? (
                                    <><CheckCircle className="w-3 h-3" /> Platform Notified</>
                                ) : (
                                    <><Navigation className="w-3 h-3" /> Alert Gig Platform</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
