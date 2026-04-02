import { useState } from 'react';
import { Bell, CloudLightning, Shield, Users } from 'lucide-react';
import AdminSideNav from '@/components/claimsure/AdminSideNav';
import AppHeader from '@/components/claimsure/AppHeader';
import { useAuth } from '@/lib/AuthContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [autoTriggerEnabled, setAutoTriggerEnabled] = useState(true);
  const [fraudMode, setFraudMode] = useState('strict');

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#08090a] font-inter text-[#f0f0f2]">


      <AppHeader 
        user={user}
        title="Admin Settings"
        showSync={true}
        syncStatus="global online"
      />


      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <AdminSideNav />
        </div>

        <main className="flex-1 overflow-y-auto p-3 scrollbar-custom sm:p-5">
          <section className="grid gap-3 md:grid-cols-2">

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg"><Bell className="h-4 w-4 text-[#06b6d4]" /> Alerts</h2>
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
              <p className="mt-2 text-xs text-[#5a5d6a]">Global admin notifications for ring alerts and payout anomalies.</p>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg"><CloudLightning className="h-4 w-4 text-[#06b6d4]" /> Weather Automation</h2>
              <button
                type="button"
                onClick={() => setAutoTriggerEnabled((v) => !v)}
                className={`rounded-md border px-3 py-1.5 text-xs uppercase tracking-wider ${
                  autoTriggerEnabled
                    ? 'border-[#164e63] bg-[#06b6d4]/10 text-[#06b6d4]'
                    : 'border-[#252830] bg-[#141618] text-[#5a5d6a]'
                }`}
              >
                Auto Trigger {autoTriggerEnabled ? 'On' : 'Off'}
              </button>
              <p className="mt-2 text-xs text-[#5a5d6a]">Enable automatic severe-weather event simulation for testing.</p>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg"><Shield className="h-4 w-4 text-[#06b6d4]" /> Fraud Rules</h2>
              <div className="flex gap-2">
                {['relaxed', 'balanced', 'strict'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFraudMode(mode)}
                    className={`rounded-md border px-2.5 py-1.5 text-[10px] uppercase tracking-wider ${
                      fraudMode === mode
                        ? 'border-[#164e63] bg-[#06b6d4]/10 text-[#06b6d4]'
                        : 'border-[#252830] bg-[#141618] text-[#5a5d6a]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-[#5a5d6a]">Current mode: <span className="uppercase text-[#a0a3b0]">{fraudMode}</span>.</p>
            </article>

            <article className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
              <h2 className="mb-3 flex items-center gap-2 text-lg"><Users className="h-4 w-4 text-[#06b6d4]" /> Worker Policy</h2>
              <p className="text-xs text-[#a0a3b0]">Live worker sync enabled</p>
              <p className="mt-2 text-xs text-[#5a5d6a]">Policy updates apply to all connected workers on next data refresh cycle.</p>
            </article>
          </section>
        </main>
      </div>

      <div className="md:hidden">
        <AdminSideNav />
      </div>
    </div>
  );
}

