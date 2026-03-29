import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export default function PayoutBanner({ status, amount }) {
  if (!status || status === 'NONE') return null;

  const config = {
    PAID: {
      icon: CheckCircle,
      bg: 'border-green-500/30 bg-gradient-to-r from-green-500/15 via-green-500/10 to-emerald-500/10 shadow-[0_0_0_1px_rgba(34,197,94,0.1)]',
      text: 'text-green-400',
      title: 'ClaimSure has got you covered.',
      subtitle: `Your payout of ₹${amount || 500} is on its way.`,
    },
    PENDING: {
      icon: Clock,
      bg: 'border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-blue-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]',
      text: 'text-cyan-400',
      title: 'Your claim is being processed.',
      subtitle: "We'll notify you within 2 hours.",
    },
    FLAGGED: {
      icon: AlertTriangle,
      bg: 'border-cyan-500/30 bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-blue-500/10 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]',
      text: 'text-cyan-400',
      title: 'Your claim is being processed.',
      subtitle: "We'll notify you within 2 hours.",
    },
  };

  const c = config[status] || config.PENDING;
  const Icon = c.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`mx-4 rounded-xl border px-4 py-3.5 backdrop-blur-sm ${c.bg}`}
      >
        <div className="flex items-start gap-3">
          <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${c.text}`} />
          <div className="space-y-0.5">
            <p className={`text-sm font-semibold tracking-tight ${c.text}`}>{c.title}</p>
            <p className="text-xs text-muted-foreground">{c.subtitle}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
