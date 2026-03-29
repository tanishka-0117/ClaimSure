import { useState } from 'react';
import { Shield, Zap, Star, Check, Clock, Calendar, CalendarDays, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COVERAGE_TYPES = [
    {
        id: 'shift',
        label: 'Per Shift',
        icon: Clock,
        description: 'Pay only when you work',
    },
    {
        id: 'daily',
        label: 'Daily Pass',
        icon: Calendar,
        description: 'Full day coverage',
    },
    {
        id: 'monthly',
        label: 'Monthly',
        icon: CalendarDays,
        description: 'Best value',
        badge: 'Save 40%',
    },
];

const PLANS = [
    {
        id: 'basic',
        name: 'Basic Shield',
        icon: Shield,
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/20',
        payout: 500,
        pricing: { shift: 15, daily: 49, monthly: 99 },
        features: ['Extreme weather only', '₹500 payout', '1 claim/day'],
    },
    {
        id: 'pro',
        name: 'Pro Shield',
        icon: Zap,
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        payout: 1500,
        pricing: { shift: 35, daily: 119, monthly: 199 },
        features: ['Moderate + Extreme', '₹1,500 payout', '3 claims/day', 'Fast-track approval'],
        popular: true,
    },
    {
        id: 'premium',
        name: 'Premium',
        icon: Star,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        payout: 3000,
        pricing: { shift: 69, daily: 199, monthly: 349 },
        features: ['All triggers', '₹3,000 payout', 'Unlimited claims', 'Instant auto-approve'],
    },
];

// Risk multiplier based on weather severity
function getDynamicMultiplier(weather, city) {
    const highRiskCities = ['Mumbai', 'Chennai'];
    const cityRisk = highRiskCities.includes(city) ? 1.15 : 1.0;
    const weatherRisk = weather?.severe ? 1.2 : 1.0;
    return cityRisk * weatherRisk;
}

export default function SmartCoveragePlans({ currentPlan = 'basic', weather, city }) {
    const [selected, setSelected] = useState(currentPlan);
    const [coverageType, setCoverageType] = useState('monthly');
    const [showPlans, setShowPlans] = useState(false);

    const active = PLANS.find(p => p.id === selected) || PLANS[0];
    const ActiveIcon = active.icon;
    const multiplier = getDynamicMultiplier(weather, city);
    const isDynamic = multiplier > 1.0;

    const getPrice = (plan) => {
        const base = plan.pricing[coverageType];
        const adjusted = Math.round(base * multiplier);
        return adjusted;
    };

    const suffix = { shift: '/shift', daily: '/day', monthly: '/mo' };

    return (
        <>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Coverage</h4>
                    <button
                        onClick={() => setShowPlans(!showPlans)}
                        className="text-xs text-primary hover:underline"
                    >
                        {showPlans ? 'Collapse' : 'Manage Plan'}
                    </button>
                </div>

                {/* Active Plan Summary */}
                <div className={`flex items-center gap-3 p-3 rounded-xl ${active.bg} border ${active.border}`}>
                    <ActiveIcon className={`w-5 h-5 ${active.color}`} />
                    <div className="flex-1">
                        <p className="text-sm font-semibold">{active.name}</p>
                        <p className="text-xs text-muted-foreground">
                            ₹{getPrice(active)}{suffix[coverageType]} · Payout up to ₹{active.payout.toLocaleString()}
                        </p>
                    </div>
                    {isDynamic && (
                        <div className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-semibold">
                            <TrendingUp className="w-2.5 h-2.5" />
                            Risk Zone
                        </div>
                    )}
                </div>

                {/* Dynamic Pricing Notice */}
                {isDynamic && (
                    <p className="text-[10px] text-cyan-400/80 mt-2 flex items-center gap-1">
                        <TrendingUp className="w-2.5 h-2.5" />
                        Pricing adjusted for {weather?.severe ? 'severe weather conditions' : `high-risk zone: ${city}`}
                    </p>
                )}
            </div>
        </div>

        {/* macOS-like pop animation modal */}
        <AnimatePresence>
            {showPlans && (
                <>
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPlans(false)}
                    />

                    <motion.div
                        className="fixed inset-0 z-50 grid place-items-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.84, y: 26, opacity: 0 }}
                            animate={{ scale: [0.84, 1.03, 1], y: [26, -4, 0], opacity: 1 }}
                            exit={{ scale: 0.96, y: 14, opacity: 0 }}
                            transition={{ duration: 0.34, ease: 'easeOut' }}
                            className="w-full max-w-2xl rounded-2xl border border-border bg-card shadow-[0_30px_80px_rgba(0,0,0,0.5)]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between border-b border-border p-4">
                                <div>
                                    <p className="text-sm font-semibold">Manage Coverage Plan</p>
                                    <p className="text-xs text-muted-foreground">Choose period and plan with dynamic risk pricing</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowPlans(false)}
                                    className="grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="p-4 space-y-4">
                                {/* Coverage Type Selector */}
                                <div>
                                    <p className="text-xs text-muted-foreground mb-2 font-medium">Coverage Period</p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {COVERAGE_TYPES.map(type => {
                                            const TypeIcon = type.icon;
                                            const isActive = coverageType === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setCoverageType(type.id)}
                                                    className={`relative flex flex-col items-center gap-1 p-2.5 rounded-lg border text-center transition-all ${isActive
                                                            ? 'border-primary/40 bg-primary/10 text-primary'
                                                            : 'border-border hover:border-primary/20 text-muted-foreground'
                                                        }`}
                                                >
                                                    {type.badge && (
                                                        <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-green-500 text-white px-1 py-0.5 rounded-full font-bold leading-none">
                                                            {type.badge}
                                                        </span>
                                                    )}
                                                    <TypeIcon className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-semibold">{type.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Plan Cards */}
                                <div className="space-y-2">
                                    <p className="text-xs text-muted-foreground font-medium">Choose Plan</p>
                                    {PLANS.map(plan => {
                                        const PlanIcon = plan.icon;
                                        const isSelected = selected === plan.id;
                                        const price = getPrice(plan);
                                        return (
                                            <button
                                                key={plan.id}
                                                onClick={() => { setSelected(plan.id); setShowPlans(false); }}
                                                className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected
                                                        ? `${plan.bg} ${plan.border}`
                                                        : 'border-border hover:border-primary/20 hover:bg-secondary/50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <PlanIcon className={`w-4 h-4 ${plan.color}`} />
                                                        <span className="text-sm font-semibold">{plan.name}</span>
                                                        {plan.popular && (
                                                            <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">Popular</span>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold">₹{price}</span>
                                                        <span className="text-[10px] text-muted-foreground">{suffix[coverageType]}</span>
                                                    </div>
                                                </div>
                                                <ul className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                                                    {plan.features.map(f => (
                                                        <li key={f} className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Check className="w-2.5 h-2.5 text-green-400 flex-shrink-0" />
                                                            {f}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
        </>
    );
}
