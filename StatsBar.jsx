import { Shield, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export default function StatsBar({ workers, claims }) {
  const activeWorkers = workers.filter(w => w.shiftActive).length;
  const approved = claims.filter(c => c.status === 'AUTO_APPROVED').length;
  const flagged = claims.filter(c => c.status === 'FLAGGED' || c.status === 'SOFT_VERIFY').length;
  const totalPayout = claims
    .filter(c => c.status === 'AUTO_APPROVED')
    .reduce((sum, c) => sum + (c.payoutAmount || 500), 0);

  const stats = [
    { label: 'Active Workers', value: activeWorkers, icon: Users, color: 'text-cyan-400' },
    { label: 'Auto Approved', value: approved, icon: CheckCircle, color: 'text-blue-400' },
    { label: 'Flagged', value: flagged, icon: AlertTriangle, color: 'text-indigo-400' },
    { label: 'Total Payouts', value: `₹${totalPayout.toLocaleString()}`, icon: Shield, color: 'text-cyan-300' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map(stat => (
        <div key={stat.label} className="group relative overflow-hidden rounded-2xl border border-[#1e2025] bg-[#0f1012] p-6 shadow-xl transition-all duration-500 hover:border-[#06b6d4]/30">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl bg-black/40 shadow-inner ring-1 ring-white/5`}>
               <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#5a5d6a]">{stat.label}</span>
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight text-[#f0f0f2]">{stat.value}</p>
          <div className={`absolute -bottom-8 -right-8 h-20 w-20 rounded-full blur-3xl opacity-10 group-hover:opacity-30 transition-all duration-700 ${stat.color.replace('text-', 'bg-')}`} />
        </div>
      ))}
    </div>


  );
}
