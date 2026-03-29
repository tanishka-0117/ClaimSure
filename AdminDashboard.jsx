import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Shield } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import StatsBar from '../components/claimsure/StatsBar';
import RingAlertBanner from '../components/claimsure/RingAlertBanner';
import ClaimCard from '../components/claimsure/ClaimCard';
import FraudSimulator from '../components/claimsure/FraudSimulator';
import ClaimDetailModal from '../components/claimsure/ClaimDetailModal';
import WeatherTicker from '../components/claimsure/WeatherTicker';
import WorkerMap from '../components/claimsure/WorkerMap';
import AdminSideNav from '../components/claimsure/AdminSideNav';
import AppHeader from '../components/claimsure/AppHeader';
import { SEED_WORKERS } from '../lib/seedData';
import { triggerSevereWeather } from '../lib/weatherEngine';
import { calculateCPS, determineClaimStatus, checkRingAlert } from '../lib/cpsEngine';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [ringAlerts, setRingAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Real-time subscription
  useEffect(() => {
    const unsubWorkers = base44.entities.Worker.subscribe((event) => {
      if (event.type === 'create') {
        setWorkers(prev => [...prev, event.data]);
      } else if (event.type === 'update') {
        setWorkers(prev => prev.map(w => w.id === event.id ? event.data : w));
      } else if (event.type === 'delete') {
        setWorkers(prev => prev.filter(w => w.id !== event.id));
      }
    });

    const unsubClaims = base44.entities.Claim.subscribe((event) => {
      if (event.type === 'create') {
        setClaims(prev => [event.data, ...prev]);
        // Check ring alerts
        setClaims(prev => {
          checkForRingAlerts(prev);
          return prev;
        });
      } else if (event.type === 'update') {
        setClaims(prev => prev.map(c => c.id === event.id ? event.data : c));
      }
    });

    return () => { unsubWorkers(); unsubClaims(); };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    let existingWorkers = await base44.entities.Worker.list();
    if (existingWorkers.length === 0) {
      await base44.entities.Worker.bulkCreate(SEED_WORKERS);
      existingWorkers = await base44.entities.Worker.list();
    }
    setWorkers(existingWorkers);

    const existingClaims = await base44.entities.Claim.list('-created_date', 50);
    setClaims(existingClaims);
    checkForRingAlerts(existingClaims);
    setIsLoading(false);
  };

  const checkForRingAlerts = (claimsList) => {
    const cities = [...new Set(claimsList.map(c => c.city))];
    const alerts = [];
    cities.forEach(city => {
      if (checkRingAlert(claimsList, city)) {
        const count = claimsList.filter(c => {
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
          return c.city?.toLowerCase() === city.toLowerCase() && 
                 new Date(c.created_date) > fiveMinAgo;
        }).length;
        alerts.push({ city, count });
      }
    });
    setRingAlerts(alerts);
  };

  const handleSimulateFraud = async (cityOverride) => {
    // Pick a spoofer worker
    const candidatePool = cityOverride
      ? workers.filter((w) => (w.lastGPS_city || w.homeCity)?.toLowerCase() === cityOverride.toLowerCase())
      : workers;

    const spoofer = candidatePool.find(w => w.name?.includes('Fake')) || candidatePool[candidatePool.length - 1] || workers[workers.length - 1];
    if (!spoofer) return;

    const city = cityOverride || spoofer.lastGPS_city || spoofer.homeCity || 'Mumbai';
    triggerSevereWeather(city);

    const cpsData = {
      ...spoofer,
      ipCity: 'Different City', // IP won't match
      lastActivity: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Inactive
    };
    const { score, signals } = calculateCPS(cpsData);
    const status = determineClaimStatus(score);

    await base44.entities.Claim.create({
      claimId: `CLM-FRAUD-${Date.now()}`,
      workerId: spoofer.workerId,
      workerName: spoofer.name,
      city,
      cpsScore: score,
      status,
      signal_ipMatch: signals.ipMatch,
      signal_mockLocation: signals.mockLocation,
      signal_appActivity: signals.appActivity,
      signal_cityHistory: signals.cityHistory,
      signal_ipScore: signals.ipScore,
      signal_mockScore: signals.mockScore,
      signal_activityScore: signals.activityScore,
      signal_cityScore: signals.cityScore,
      ringAlert: false,
      weatherCondition: 'Simulated Storm',
      payoutAmount: 0,
    });

    await refreshData();
  };

  const runDemoSequence = async (city) => {
    await handleTriggerWeather(city);
    await handleSimulateFraud(city);
  };

  const handleTriggerWeather = async (city) => {
    const weather = triggerSevereWeather(city);
    const cityWorkers = workers.filter(w => 
      (w.lastGPS_city || w.homeCity)?.toLowerCase() === city.toLowerCase() && w.shiftActive
    );

    for (const w of cityWorkers) {
      const cpsData = {
        ...w,
        ipCity: w.lastGPS_city,
        lastActivity: w.lastActivity || new Date().toISOString(),
      };
      const { score, signals } = calculateCPS(cpsData);
      const status = determineClaimStatus(score);

      await base44.entities.Claim.create({
        claimId: `CLM-WX-${Date.now()}-${w.workerId}`,
        workerId: w.workerId,
        workerName: w.name,
        city,
        cpsScore: score,
        status,
        signal_ipMatch: signals.ipMatch,
        signal_mockLocation: signals.mockLocation,
        signal_appActivity: signals.appActivity,
        signal_cityHistory: signals.cityHistory,
        signal_ipScore: signals.ipScore,
        signal_mockScore: signals.mockScore,
        signal_activityScore: signals.activityScore,
        signal_cityScore: signals.cityScore,
        ringAlert: false,
        weatherCondition: weather.name,
        payoutAmount: status === 'AUTO_APPROVED' ? 500 : 0,
      });

      if (status === 'AUTO_APPROVED') {
        await base44.entities.Worker.update(w.id, {
          payoutStatus: 'PAID',
          payoutAmount: 500,
          payoutTimestamp: new Date().toISOString(),
        });
      }
    }

    // If no active workers, still create a demo claim
    if (cityWorkers.length === 0) {
      const anyWorker = workers.find(w => (w.lastGPS_city || w.homeCity)?.toLowerCase() === city.toLowerCase()) || workers[0];
      if (anyWorker) {
        const cpsData = {
          ...anyWorker,
          ipCity: anyWorker.lastGPS_city,
          lastActivity: anyWorker.lastActivity || new Date().toISOString(),
        };
        const { score, signals } = calculateCPS(cpsData);
        const status = determineClaimStatus(score);

        await base44.entities.Claim.create({
          claimId: `CLM-WX-${Date.now()}`,
          workerId: anyWorker.workerId,
          workerName: anyWorker.name,
          city,
          cpsScore: score,
          status,
          signal_ipMatch: signals.ipMatch,
          signal_mockLocation: signals.mockLocation,
          signal_appActivity: signals.appActivity,
          signal_cityHistory: signals.cityHistory,
          signal_ipScore: signals.ipScore,
          signal_mockScore: signals.mockScore,
          signal_activityScore: signals.activityScore,
          signal_cityScore: signals.cityScore,
          ringAlert: false,
          weatherCondition: weather.name,
          payoutAmount: status === 'AUTO_APPROVED' ? 500 : 0,
        });
      }
    }

    await refreshData();
  };

  const refreshData = async () => {
    const [updatedWorkers, updatedClaims] = await Promise.all([
      base44.entities.Worker.list(),
      base44.entities.Claim.list('-created_date', 50),
    ]);
    setWorkers(updatedWorkers);
    setClaims(updatedClaims);
    checkForRingAlerts(updatedClaims);
  };

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
        user={user}
        title="Admin Control Center" 
        onRefresh={refreshData}
        syncStatus="admin online"
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <AdminSideNav />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden xl:flex-row">
          <main className="relative flex-1 overflow-y-auto p-6 sm:p-8 lg:p-12 scrollbar-custom">
            <div className="mx-auto max-w-[1600px] flex flex-col gap-10 font-inter">
              <section className="rounded-2xl border border-[#1e2025] bg-[#0f1012] p-8 lg:p-10 shadow-2xl">
                <div className="flex items-center gap-6">
                  <div className="grid h-14 w-14 place-items-center rounded-xl border border-[#0891b2]/30 bg-[#06b6d4]/10 text-2xl text-[#06b6d4]">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-[36px] font-bold leading-none tracking-tight text-[#f0f0f2]">Admin Control Center</h1>
                    <p className="mt-2 text-[12px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">Fraud intelligence · payout orchestration · live map monitoring</p>
                  </div>
                </div>
              </section>


              <div className="flex flex-col gap-8">
                <StatsBar workers={workers} claims={claims} />
                <RingAlertBanner alerts={ringAlerts} />

                <section className="rounded-2xl border border-[#1e2025] bg-[#0f1012] p-8 shadow-2xl" style={{ minHeight: '600px' }}>
                  <div className="mb-6 flex items-center justify-between border-b border-[#1e2025] pb-4">
                    <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">Global asset risk distribution</p>
                    <div className="flex items-center gap-4">
                      <span className="rounded-lg border border-[#1e2025] bg-[#141618] px-3 py-1.5 text-[11px] font-bold text-[#5a5d6a]">{workers.length} nodes active</span>
                    </div>
                  </div>
                  <div className="h-[480px] w-full rounded-xl overflow-hidden border border-[#252830]">
                    <WorkerMap workers={workers} claims={claims} />
                  </div>
                </section>
              </div>
            </div>
          </main>


          <aside className="w-full border-t border-[#1e2025] bg-[#08090a] p-4 xl:w-[340px] xl:border-l xl:border-t-0 overflow-y-auto scrollbar-custom">
            <div className="flex flex-col gap-5">
              <section>
                <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">city weather monitor</p>
                <div className="rounded-xl border border-[#1e2025] bg-[#0f1012] p-3">
                  <WeatherTicker />
                </div>
              </section>

              <section>
                <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">simulation controls</p>
                <FraudSimulator 
                  workers={workers}
                  onSimulateFraud={handleSimulateFraud}
                  onTriggerWeather={handleTriggerWeather}
                  onRunDemoSequence={runDemoSequence}
                />
              </section>

              <section className="space-y-2">
                <div className="mb-3 flex items-center justify-between border-b border-[#1e2025] pb-2">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">live claims feed</p>
                  <span className="rounded border border-[#1e2025] bg-[#141618] px-2 py-0.5 text-[10px] text-[#5a5d6a]">{claims.length} events</span>
                </div>

                <div className="space-y-2">
                  {claims.length === 0 ? (
                    <div className="rounded-xl border border-[#1e2025] bg-[#141618] p-8 text-center text-[#5a5d6a]">
                      No claims yet.
                    </div>
                  ) : (
                    claims.map(claim => (
                      <div key={claim.id} onClick={() => setSelectedClaim(claim)} className="cursor-pointer">
                        <ClaimCard claim={claim} />
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

      <div className="md:hidden">
        <AdminSideNav />
      </div>


      {selectedClaim && (
        <ClaimDetailModal
          claim={selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onUpdate={refreshData}
        />
      )}
    </div>
  );
}
