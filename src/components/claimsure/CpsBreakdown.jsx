import { motion } from 'framer-motion';
import { Wifi, Smartphone, MousePointer, Home } from 'lucide-react';

const SIGNALS = [
  { key: 'ipMatch', icon: Wifi, label: 'IP vs GPS Match', max: 30 },
  { key: 'mockLocation', icon: Smartphone, label: 'Mock Location', max: 25 },
  { key: 'appActivity', icon: MousePointer, label: 'In-App Activity', max: 25 },
  { key: 'cityHistory', icon: Home, label: 'City History', max: 20 },
];

export default function CpsBreakdown({ signals }) {
  if (!signals) return null;

  const scoreMap = {
    ipMatch: signals.signal_ipScore || 0,
    mockLocation: signals.signal_mockScore || 0,
    appActivity: signals.signal_activityScore || 0,
    cityHistory: signals.signal_cityScore || 0,
  };

  return (
    <div className="space-y-2.5">
      {SIGNALS.map(signal => {
        const score = scoreMap[signal.key] || 0;
        const percentage = (score / signal.max) * 100;
        const Icon = signal.icon;

        return (
          <div key={signal.key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{signal.label}</span>
              </div>
              <span className="text-xs font-mono font-semibold">
                {score}/{signal.max}
              </span>
            </div>
            <div className="h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  percentage >= 80 ? 'bg-green-500' :
                  percentage >= 40 ? 'bg-cyan-500' : 'bg-red-500'
                }`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
