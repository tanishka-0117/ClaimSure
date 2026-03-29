import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, XCircle, MapPin } from 'lucide-react';
import moment from 'moment';

const STATUS_CONFIG = {
  AUTO_APPROVED: { icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Auto Approved' },
  SOFT_VERIFY: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Soft Verify' },
  FLAGGED: { icon: AlertTriangle, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Flagged' },
  DENIED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Denied' },
};

export default function ClaimCard({ claim }) {
  const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.FLAGGED;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-xl p-3.5 space-y-2.5"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div>
            <p className="text-sm font-semibold">{claim.workerName}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {claim.city}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>

      {/* CPS Score Bar */}
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">CPS Score</span>
          <span className="text-xs font-mono font-semibold">{claim.cpsScore}/100</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${claim.cpsScore}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              claim.cpsScore >= 75 ? 'bg-cyan-500' :
              claim.cpsScore >= 50 ? 'bg-blue-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Signals */}
      <div className="grid grid-cols-4 gap-1.5">
        <SignalDot label="IP" active={claim.signal_ipMatch} score={claim.signal_ipScore} />
        <SignalDot label="Mock" active={claim.signal_mockLocation} score={claim.signal_mockScore} />
        <SignalDot label="Active" active={claim.signal_appActivity} score={claim.signal_activityScore} />
        <SignalDot label="City" active={claim.signal_cityHistory} score={claim.signal_cityScore} />
      </div>

      {/* Ring Alert Badge */}
      {claim.ringAlert && (
        <div className="flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-md">
          <AlertTriangle className="w-3 h-3" />
          Ring Alert — Cluster detected
        </div>
      )}

      {/* Timestamp */}
      <p className="text-[10px] text-muted-foreground">
        {moment(claim.created_date).fromNow()}
      </p>
    </motion.div>
  );
}

function SignalDot({ label, active, score }) {
  return (
    <div className={`text-center p-1.5 rounded-md ${active ? 'bg-cyan-500/10' : 'bg-red-500/10'}`}>
      <p className={`text-[10px] font-semibold ${active ? 'text-cyan-400' : 'text-red-400'}`}>
        {score || 0}
      </p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}
