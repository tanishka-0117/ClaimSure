import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Clock, Shield, MapPin, Wifi, Smartphone, MousePointer, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useState } from 'react';
import moment from 'moment';

const STATUS_CONFIG = {
  AUTO_APPROVED: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Auto Approved' },
  SOFT_VERIFY: { icon: Clock, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Soft Verify' },
  FLAGGED: { icon: AlertTriangle, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Flagged' },
  DENIED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Denied' },
};

export default function ClaimDetailModal({ claim, onClose, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!claim) return null;

  const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.FLAGGED;
  const Icon = config.icon;

  const handleAction = async (newStatus) => {
    setIsUpdating(true);
    await base44.entities.Claim.update(claim.id, { status: newStatus });
    if (newStatus === 'AUTO_APPROVED') {
      const workers = await base44.entities.Worker.filter({ workerId: claim.workerId });
      if (workers.length > 0) {
        await base44.entities.Worker.update(workers[0].id, {
          payoutStatus: 'PAID',
          payoutAmount: 500,
          payoutTimestamp: new Date().toISOString(),
        });
      }
    }
    onUpdate();
    setIsUpdating(false);
    onClose();
  };

  const signals = [
    { label: 'IP vs GPS Match', icon: Wifi, score: claim.signal_ipScore || 0, max: 30, pass: claim.signal_ipMatch },
    { label: 'Mock Location', icon: Smartphone, score: claim.signal_mockScore || 0, max: 25, pass: claim.signal_mockLocation },
    { label: 'In-App Activity', icon: MousePointer, score: claim.signal_activityScore || 0, max: 25, pass: claim.signal_appActivity },
    { label: 'City History', icon: Home, score: claim.signal_cityScore || 0, max: 20, pass: claim.signal_cityHistory },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-border flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <h2 className="font-bold">{claim.workerName}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {claim.city} · {moment(claim.created_date).format('MMM D, HH:mm')}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* CPS Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  CPS Score
                </span>
                <span className={`text-2xl font-black font-mono ${
                  claim.cpsScore >= 75 ? 'text-green-400' :
                  claim.cpsScore >= 50 ? 'text-cyan-400' : 'text-red-400'
                }`}>{claim.cpsScore}<span className="text-base text-muted-foreground font-normal">/100</span></span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${claim.cpsScore}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    claim.cpsScore >= 75 ? 'bg-green-500' :
                    claim.cpsScore >= 50 ? 'bg-cyan-500' : 'bg-red-500'
                  }`}
                />
              </div>
            </div>

            {/* Signal Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signal Breakdown</h4>
              {signals.map(sig => (
                <div key={sig.label} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    sig.pass ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    <sig.icon className={`w-3.5 h-3.5 ${sig.pass ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{sig.label}</span>
                      <span className="font-mono font-semibold">{sig.score}/{sig.max}</span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(sig.score / sig.max) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${sig.pass ? 'bg-green-500' : 'bg-red-500'}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Metadata */}
            <div className="bg-secondary/30 rounded-xl p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Claim ID</span>
                <span className="font-mono">{claim.claimId || claim.id?.substring(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weather</span>
                <span>{claim.weatherCondition || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status</span>
                <span className={`font-semibold ${config.color}`}>{config.label}</span>
              </div>
              {claim.ringAlert && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ring Alert</span>
                  <span className="text-red-400 font-semibold">⚠ Triggered</span>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {(claim.status === 'FLAGGED' || claim.status === 'SOFT_VERIFY') && (
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => handleAction('AUTO_APPROVED')}
                  disabled={isUpdating}
                  className="flex-1 h-9 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve & Pay
                </Button>
                <Button
                  onClick={() => handleAction('DENIED')}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1 h-9 text-xs gap-1.5 border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Deny
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
