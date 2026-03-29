import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield, TrendingUp, BarChart2, PieChart, Activity } from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';
import moment from 'moment';
import AdminSideNav from '../components/claimsure/AdminSideNav';
import AppHeader from '../components/claimsure/AppHeader';
import { useAuth } from '@/lib/AuthContext';

const COLORS = ['#06b6d4', '#3b82f6', '#6366f1', '#ef4444', '#0891b2'];

export default function Analytics() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, w] = await Promise.all([
        base44.entities.Claim.list('-created_date', 100),
        base44.entities.Worker.list(),
      ]);
      setClaims(c);
      setWorkers(w);
      setIsLoading(false);
    })();
  }, []);

  // Claims by status
  const statusData = [
    { name: 'Auto Approved', value: claims.filter(c => c.status === 'AUTO_APPROVED').length, color: '#06b6d4' },
    { name: 'Soft Verify', value: claims.filter(c => c.status === 'SOFT_VERIFY').length, color: '#3b82f6' },
    { name: 'Flagged', value: claims.filter(c => c.status === 'FLAGGED').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Claims by city
  const cities = [...new Set(claims.map(c => c.city))];
  const cityData = cities.map(city => ({
    city: city?.substring(0, 8),
    claims: claims.filter(c => c.city === city).length,
    approved: claims.filter(c => c.city === city && c.status === 'AUTO_APPROVED').length,
    flagged: claims.filter(c => c.city === city && c.status === 'FLAGGED').length,
  }));

  // CPS score distribution (buckets of 10)
  const cpsBuckets = Array.from({ length: 10 }, (_, i) => {
    const min = i * 10;
    const max = min + 10;
    return {
      range: `${min}-${max}`,
      count: claims.filter(c => c.cpsScore >= min && c.cpsScore < max).length,
    };
  });

  // Claims over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = moment().subtract(6 - i, 'days');
    const dayClaims = claims.filter(c => moment(c.created_date).isSame(day, 'day'));
    return {
      date: day.format('MMM D'),
      total: dayClaims.length,
      approved: dayClaims.filter(c => c.status === 'AUTO_APPROVED').length,
      payout: dayClaims.filter(c => c.status === 'AUTO_APPROVED').length * 500,
    };
  });

  // CPS signal averages
  const radarData = [
    { signal: 'IP Match', value: claims.length ? Math.round(claims.reduce((s, c) => s + (c.signal_ipScore || 0), 0) / claims.length) : 0, max: 30 },
    { signal: 'No Mock', value: claims.length ? Math.round(claims.reduce((s, c) => s + (c.signal_mockScore || 0), 0) / claims.length) : 0, max: 25 },
    { signal: 'Active', value: claims.length ? Math.round(claims.reduce((s, c) => s + (c.signal_activityScore || 0), 0) / claims.length) : 0, max: 25 },
    { signal: 'City Match', value: claims.length ? Math.round(claims.reduce((s, c) => s + (c.signal_cityScore || 0), 0) / claims.length) : 0, max: 20 },
  ];

  const totalPayout = claims.filter(c => c.status === 'AUTO_APPROVED').length * 500;
  const avgCPS = claims.length ? Math.round(claims.reduce((s, c) => s + (c.cpsScore || 0), 0) / claims.length) : 0;
  const fraudRate = claims.length ? Math.round((claims.filter(c => c.status === 'FLAGGED').length / claims.length) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-xs shadow-xl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#08090a] font-inter text-[#f0f0f2]">
      <AppHeader 
        user={user}
        title="Admin Analytics"
        showSync={true}
        syncStatus="global online"
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <AdminSideNav />
        </div>

        <main className="flex-1 overflow-y-auto p-3 scrollbar-custom sm:p-5">

          <section className="mb-4 rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg border border-[#0891b2]/30 bg-[#06b6d4]/10 text-lg text-[#06b6d4]">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-[30px] leading-none text-[#f0f0f2]">Admin Analytics</h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#5a5d6a]">organization-wide insights across workers and claims</p>
              </div>
            </div>
          </section>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total Claims', value: claims.length, icon: BarChart2, color: 'text-cyan-400', delta: '+' + claims.length },
            { label: 'Total Payouts', value: `₹${totalPayout.toLocaleString()}`, icon: TrendingUp, color: 'text-cyan-300', delta: claims.filter(c => c.status === 'AUTO_APPROVED').length + ' events' },
            { label: 'Avg CPS Score', value: avgCPS, icon: Activity, color: 'text-blue-300', delta: avgCPS >= 75 ? 'Healthy' : avgCPS >= 50 ? 'Moderate' : 'Risky' },
            { label: 'Fraud Rate', value: `${fraudRate}%`, icon: PieChart, color: 'text-red-400', delta: claims.filter(c => c.status === 'FLAGGED').length + ' flagged' },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <span className="text-xs text-[#5a5d6a]">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold font-mono">{kpi.value}</p>
              <p className="mt-1 text-xs text-[#5a5d6a]">{kpi.delta}</p>
            </div>
          ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4 md:col-span-2">
                <h3 className="mb-4 text-sm font-semibold">Claims & Payouts - Last 7 Days</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="total" name="Total" stroke="#06b6d4" fill="url(#gradTotal)" strokeWidth={2} />
                <Area type="monotone" dataKey="approved" name="Approved" stroke="#3b82f6" fill="url(#gradApproved)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
                <h3 className="mb-4 text-sm font-semibold">Claim Status Breakdown</h3>
            {statusData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-xs text-[#5a5d6a]">No claims yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </RechartsPie>
              </ResponsiveContainer>
            )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4 md:col-span-2">
                <h3 className="mb-4 text-sm font-semibold">Claims by City</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                <XAxis dataKey="city" tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="approved" name="Approved" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="flagged" name="Flagged" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
                <h3 className="mb-4 text-sm font-semibold">Avg Signal Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(222 30% 18%)" />
                <PolarAngleAxis dataKey="signal" tick={{ fontSize: 9, fill: '#6b7280' }} />
                <Radar name="Score" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h3 className="mb-4 text-sm font-semibold">CPS Score Distribution</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={cpsBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
              <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#6b7280' }} />
              <YAxis tick={{ fontSize: 9, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Claims" radius={[3, 3, 0, 0]}>
                {cpsBuckets.map((entry, i) => (
                  <Cell key={i} fill={i >= 7 ? '#06b6d4' : i >= 5 ? '#3b82f6' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
              <div className="mt-2 flex gap-4 text-xs text-[#5a5d6a]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> High Risk (0–49)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" /> Moderate (50–69)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Approved (70–100)</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      <div className="md:hidden">
        <AdminSideNav />
      </div>
    </div>
  );
}

