import { useState } from 'react';
import { Shield, Zap, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic Shield',
    price: '₹99/mo',
    payout: '₹500',
    icon: Shield,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    features: ['Extreme weather triggers', '₹500 per event', '1 claim/day', 'Standard CPS check'],
  },
  {
    id: 'pro',
    name: 'Pro Shield',
    price: '₹199/mo',
    payout: '₹1,500',
    icon: Zap,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    features: ['Moderate + Extreme triggers', '₹1,500 per event', '3 claims/day', 'Fast-track approval'],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹349/mo',
    payout: '₹3,000',
    icon: Star,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    features: ['All weather triggers', '₹3,000 per event', 'Unlimited claims', 'Instant auto-approve'],
  },
];

export default function PolicyCard({ currentPlan = 'basic' }) {
  const [selected, setSelected] = useState(currentPlan);
  const [showPlans, setShowPlans] = useState(false);

  const active = PLANS.find(p => p.id === selected) || PLANS[0];
  const ActiveIcon = active.icon;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Current Plan */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Policy</h4>
          <button
            onClick={() => setShowPlans(!showPlans)}
            className="text-xs text-primary hover:underline"
          >
            {showPlans ? 'Hide' : 'Upgrade'}
          </button>
        </div>
        <div className={`flex items-center gap-3 p-3 rounded-xl ${active.bg} border ${active.border}`}>
          <ActiveIcon className={`w-5 h-5 ${active.color}`} />
          <div className="flex-1">
            <p className="text-sm font-semibold">{active.name}</p>
            <p className="text-xs text-muted-foreground">Payout: {active.payout} · {active.price}</p>
          </div>
          <span className={`text-xs font-semibold ${active.color} px-2 py-0.5 rounded-full ${active.bg}`}>
            Active
          </span>
        </div>
      </div>

      {/* Plan Selector */}
      <AnimatePresence>
        {showPlans && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border p-4 space-y-2">
              {PLANS.map(plan => {
                const PlanIcon = plan.icon;
                const isSelected = selected === plan.id;
                return (
                  <button
                    key={plan.id}
                    onClick={() => { setSelected(plan.id); setShowPlans(false); }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? `${plan.bg} ${plan.border}`
                        : 'border-border hover:border-primary/20 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <PlanIcon className={`w-4 h-4 ${plan.color}`} />
                        <span className="text-sm font-semibold">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">Popular</span>
                        )}
                      </div>
                      <span className="text-sm font-bold">{plan.price}</span>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
