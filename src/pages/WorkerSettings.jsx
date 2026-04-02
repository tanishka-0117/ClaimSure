import { useState } from 'react';
import { Bell, Globe2, Shield, Volume2 } from 'lucide-react';
import WorkerSideNav from '@/components/claimsure/WorkerSideNav';
import AppHeader from '@/components/claimsure/AppHeader';
import { base44 } from '@/api/base44Client';
import { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

export default function WorkerSettings() {
  const { user: authUser } = useAuth();
  const ACTIVE_WORKER_KEY = 'claimsure.activeWorkerId';
  const [worker, setWorker] = useState(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [riskMode, setRiskMode] = useState('balanced');

  useEffect(() => {
    const loadWorker = async () => {
      const workers = await base44.entities.Worker.list();
      const current = authUser ? workers.find(w => w.name.toLowerCase() === authUser.name.toLowerCase()) : null;
      setWorker(current || workers[0]);
    };
    loadWorker();
  }, [authUser]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#08090a] font-inter text-[#f0f0f2]">

      <AppHeader 
        user={worker}
        title="Worker Settings"
        showSync={false}
      />


      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <WorkerSideNav />
        </div>

        <main className="flex-1 overflow-y-auto p-3 scrollbar-custom sm:p-5">
          <section className="grid gap-3 md:grid-cols-2">

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg">
                <Bell className="h-4 w-4 text-[#06b6d4]" />
                Alerts
              </h2>
              <button
                type="button"
                onClick={() => setAlertsEnabled((v) => !v)}
                className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-wider ${
                  alertsEnabled
                    ? 'border-[#164e63] bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'border-[#252830] bg-[#141618] text-[#5a5d6a]'
                }`}
              >
                {alertsEnabled ? 'Enabled' : 'Disabled'}
              </button>
              <p className="mt-2 text-xs text-[#5a5d6a]">Receive instant weather-trigger notifications and payout updates.</p>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg">
                <Volume2 className="h-4 w-4 text-[#06b6d4]" />
                Voice Guidance
              </h2>
              <button
                type="button"
                onClick={() => setVoiceEnabled((v) => !v)}
                className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-wider ${
                  voiceEnabled
                    ? 'border-[#164e63] bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'border-[#252830] bg-[#141618] text-[#5a5d6a]'
                }`}
              >
                Voice {voiceEnabled ? 'On' : 'Off'}
              </button>
              <p className="mt-2 text-xs text-[#5a5d6a]">Toggle spoken confirmation for shift and claim events.</p>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg">
                <Shield className="h-4 w-4 text-[#06b6d4]" />
                Risk Profile
              </h2>
              <div className="flex gap-2">
                {['safe', 'balanced', 'aggressive'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setRiskMode(mode)}
                    className={`rounded-md border px-2.5 py-1.5 text-[10px] uppercase tracking-wider ${
                      riskMode === mode
                        ? 'border-[#164e63] bg-[#06b6d4]/10 text-[#06b6d4]'
                        : 'border-[#252830] bg-[#141618] text-[#5a5d6a]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[#5a5d6a]">Current risk mode: <span className="uppercase text-[#a0a3b0]">{riskMode}</span>.</p>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg">
                <Globe2 className="h-4 w-4 text-[#06b6d4]" />
                Region
              </h2>
              <p className="text-xs text-[#a0a3b0]">Mumbai, Maharashtra</p>
              <p className="mt-2 text-xs text-[#5a5d6a]">Location controls are synced from your active worker profile and cannot be changed here.</p>
            </article>
          </section>
        </main>
      </div>

      <div className="md:hidden">
        <WorkerSideNav />
      </div>
    </div>
  );
}

