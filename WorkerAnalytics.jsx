import { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart2, Shield, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import moment from 'moment';
import WorkerSideNav from '@/components/claimsure/WorkerSideNav';
import AppHeader from '@/components/claimsure/AppHeader';

export default function WorkerAnalytics() {
  const ACTIVE_WORKER_KEY = 'claimsure.activeWorkerId';
  const [claims, setClaims] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const [claimData, workerData] = await Promise.all([
        base44.entities.Claim.list('-created_date', 200),
        base44.entities.Worker.list(),
      ]);
      setClaims(claimData);
      setWorkers(workerData);

      if (workerData.length > 0) {
        const storedWorkerId = localStorage.getItem(ACTIVE_WORKER_KEY);
        const fallback = String(workerData[0].id);
        const validStored = storedWorkerId && workerData.some((w) => String(w.id) === storedWorkerId);
        setSelectedWorkerId(validStored ? storedWorkerId : fallback);
      }
      setIsLoading(false);
    };

    load();
  }, []);

  const selectedWorker = useMemo(
    () => workers.find((w) => String(w.id) === selectedWorkerId) || null,
    [workers, selectedWorkerId]
  );

  const workerClaims = useMemo(() => {
    if (!selectedWorker) return [];
    return claims.filter((c) => c.workerId === selectedWorker.workerId);
  }, [claims, selectedWorker]);

  const totalPayout = workerClaims
    .filter((c) => c.status === 'AUTO_APPROVED')
    .reduce((sum, c) => sum + (c.payoutAmount || 0), 0);

  const avgCPS = workerClaims.length
    ? Math.round(workerClaims.reduce((sum, c) => sum + (c.cpsScore || 0), 0) / workerClaims.length)
    : 0;

  const approvalRate = workerClaims.length
    ? Math.round((workerClaims.filter((c) => c.status === 'AUTO_APPROVED').length / workerClaims.length) * 100)
    : 0;

  const statusData = [
    { name: 'Approved', value: workerClaims.filter((c) => c.status === 'AUTO_APPROVED').length, color: '#06b6d4' },
    { name: 'Soft Verify', value: workerClaims.filter((c) => c.status === 'SOFT_VERIFY').length, color: '#3b82f6' },
    { name: 'Flagged', value: workerClaims.filter((c) => c.status === 'FLAGGED').length, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = moment().subtract(6 - i, 'days');
    const dayClaims = workerClaims.filter((c) => moment(c.created_date).isSame(day, 'day'));

    return {
      date: day.format('MMM D'),
      total: dayClaims.length,
      approved: dayClaims.filter((c) => c.status === 'AUTO_APPROVED').length,
    };
  });

  const cityData = useMemo(() => {
    const byCity = new Map();
    workerClaims.forEach((claim) => {
      const city = claim.city || 'Unknown';
      byCity.set(city, (byCity.get(city) || 0) + 1);
    });
    return [...byCity.entries()].map(([city, count]) => ({ city, count }));
  }, [workerClaims]);

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08090a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e2025] border-t-[#06b6d4]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#08090a] font-inter text-[#f0f0f2]">
      <AppHeader 
        user={selectedWorker}
        title="Worker Analytics"
        showSync={false}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <WorkerSideNav />
        </div>

        <main className="flex-1 overflow-y-auto p-3 scrollbar-custom sm:p-5">

          <section className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
            <h1 className="text-2xl leading-none">{selectedWorker?.name || 'Worker'} Analytics</h1>
            <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-[#5a5d6a]">
              personalized view locked to active worker
            </p>
          </section>

          <section className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
            <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.09em] text-[#5a5d6a]">total claims</p>
              <p className="mt-2 text-3xl leading-none text-[#f0f0f2]">{workerClaims.length}</p>
            </div>
            <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.09em] text-[#5a5d6a]">total payout</p>
              <p className="mt-2 text-3xl leading-none text-[#06b6d4]">₹{totalPayout}</p>
            </div>
            <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.09em] text-[#5a5d6a]">avg cps</p>
              <p className="mt-2 text-3xl leading-none text-[#f0f0f2]">{avgCPS}</p>
            </div>
            <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.09em] text-[#5a5d6a]">approval rate</p>
              <p className="mt-2 text-3xl leading-none text-[#06b6d4]">{approvalRate}%</p>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <article className="xl:col-span-2 rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#06b6d4]" />
                <p className="text-sm">Claims Trend (7 Days)</p>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={last7Days}>
                  <defs>
                    <linearGradient id="workerTotalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2025" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#5a5d6a' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#5a5d6a' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141618',
                      border: '1px solid #252830',
                      borderRadius: '8px',
                      color: '#f0f0f2',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#06b6d4" fill="url(#workerTotalGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="approved" stroke="#3b82f6" fill="none" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#06b6d4]" />
                <p className="text-sm">Status Split</p>
              </div>

              {statusData.length === 0 ? (
                <div className="grid h-[220px] place-items-center text-xs text-[#5a5d6a]">No claims yet</div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#141618',
                        border: '1px solid #252830',
                        borderRadius: '8px',
                        color: '#f0f0f2',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </article>
          </section>

          <section className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
            <div className="mb-3 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-[#06b6d4]" />
              <p className="text-sm">City Distribution for Selected Worker</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2025" />
                <XAxis dataKey="city" tick={{ fontSize: 10, fill: '#5a5d6a' }} />
                <YAxis tick={{ fontSize: 10, fill: '#5a5d6a' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#141618',
                    border: '1px solid #252830',
                    borderRadius: '8px',
                    color: '#f0f0f2',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {workerClaims.length === 0 && (
            <section className="rounded-xl border border-[#252830] bg-[#141618] p-4 text-sm text-[#a0a3b0]">
              No claim records found for this worker yet. Select this worker in dashboard and trigger weather events to generate analytics.
            </section>
          )}
        </main>
      </div>

      <div className="md:hidden">
        <WorkerSideNav />
      </div>
    </div>
  );
}

