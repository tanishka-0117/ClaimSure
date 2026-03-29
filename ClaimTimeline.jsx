import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ClaimTimeline({ worker, claim }) {
  if (!claim) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground">No recent claims.</p>
      </div>
    );
  }

  const steps = [
    {
      id: 'detected',
      label: 'Event Detected',
      description: claim.weatherCondition,
      time: claim.created_date,
      completed: true
    },
    {
      id: 'analyzing',
      label: 'CPS Analysis',
      description: `Score: ${claim.cpsScore}/100`,
      time: '',
      completed: true
    },
    {
      id: 'decision',
      label: claim.status === 'AUTO_APPROVED' ? 'Payout Approved' : (claim.status === 'PENDING' ? 'Manual Review' : 'Claim Rejected'),
      description: claim.status === 'AUTO_APPROVED' ? `₹${claim.payoutAmount} processed` : 'Pending further verification',
      time: '',
      completed: claim.status !== 'PENDING',
      isCurrent: claim.status === 'PENDING',
      error: claim.status === 'REJECTED'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-4">Claim Timeline • {claim.claimId}</h3>
      <div className="relative pl-4 space-y-6 before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-border">
        {steps.map((step, idx) => {
          let Icon = Clock;
          let iconColor = 'text-muted-foreground bg-card border-border';

          if (step.error) {
            Icon = XCircle;
            iconColor = 'text-red-500 bg-red-500/10 border-red-500/20';
          } else if (step.completed) {
            Icon = CheckCircle2;
            iconColor = 'text-green-500 bg-green-500/10 border-green-500/20';
          } else if (step.isCurrent) {
            Icon = AlertTriangle;
            iconColor = 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
          }

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <div className={`absolute -left-[27px] w-6 h-6 rounded-full border flex items-center justify-center ${iconColor}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="pl-4">
                <p className="text-sm font-medium">{step.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                {step.time && <p className="text-[10px] text-muted-foreground mt-1">{new Date(step.time).toLocaleTimeString()}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
