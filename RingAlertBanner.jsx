import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export default function RingAlertBanner({ alerts }) {
  const [dismissed, setDismissed] = useState([]);

  const activeAlerts = alerts.filter(a => !dismissed.includes(a.city));

  if (activeAlerts.length === 0) return null;

  return (
    <AnimatePresence>
      {activeAlerts.map(alert => (
        <motion.div
          key={alert.city}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-400">
              Ring Alert — {alert.city}
            </p>
            <p className="text-xs text-muted-foreground">
              {alert.count} claims detected within 5 minutes
            </p>
          </div>
          <button
            onClick={() => setDismissed(prev => [...prev, alert.city])}
            className="text-muted-foreground hover:text-foreground p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
