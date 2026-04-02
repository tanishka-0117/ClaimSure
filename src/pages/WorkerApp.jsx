import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudLightning, Power, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { calculateCPS, determineClaimStatus } from '../lib/cpsEngine';
import { triggerSevereWeather, getWeatherByCode, getWeatherForCity, fetchLiveWeatherForCity } from '../lib/weatherEngine';
import { SEED_WORKERS } from '../lib/seedData';
import LanguageVoicePanel, { T, speakAlert } from '../components/claimsure/LanguageVoicePanel';
import LowBatteryGuard from '../components/claimsure/LowBatteryGuard';
import SmartCoveragePlans from '../components/claimsure/SmartCoveragePlans';
import WorkerSideNav from '../components/claimsure/WorkerSideNav';
import AppHeader from '../components/claimsure/AppHeader';
import { useAuth } from '@/lib/AuthContext';
const CPSShieldGauge = ({ score }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 80 ? '#06b6d4' : score > 50 ? '#fbbf24' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center h-20 w-20">
      <svg className="h-full w-full -rotate-90 transform">
        <circle
          cx="40"
          cy="40"
          r={radius}
          className="stroke-[#1e2025]"
          strokeWidth="6"
          fill="transparent"
        />
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeLinecap: 'round' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono text-[#f0f0f2]">{score}</span>
        <span className="text-[8px] font-bold uppercase tracking-wider text-[#5a5d6a]">Score</span>
      </div>
    </div>
  );
};


const WeatherEffects = ({ condition }) => {
  if (!condition) return null;
  const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('storm');
  
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-20">
      {isRain && Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * 100 + '%' }}
          animate={{ y: '110vh' }}
          transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: "linear", delay: Math.random() }}
          className="absolute h-4 w-[1px] bg-cyan-400/40"
        />
      ))}
      {!isRain && condition.toLowerCase().includes('cloud') && Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: '-20%', y: 10 + Math.random() * 40 + '%' }}
          animate={{ x: '120%' }}
          transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear", delay: i * 2 }}
          className="absolute h-32 w-64 rounded-full bg-slate-800/20 blur-3xl"
        />
      ))}
    </div>
  );
};

export default function WorkerApp() {
  const { user: authUser } = useAuth();

  const ACTIVE_WORKER_KEY = 'claimsure.activeWorkerId';
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [worker, setWorker] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [siteReady, setSiteReady] = useState(false);
  const [latestClaim, setLatestClaim] = useState(null);
  const [lang, setLang] = useState('en');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLowBattery, setIsLowBattery] = useState(false);
  const [isTriggeringEvent, setIsTriggeringEvent] = useState(false);
  const [activities, setActivities] = useState([]);
  const [ripple, setRipple] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());
  const [payoutNotification, setPayoutNotification] = useState(null);
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const [liveWeather, setLiveWeather] = useState(null);

  const intervalRef = useRef(null);
  const activityRef = useRef(new Date().toISOString());
  const activityIdRef = useRef(0);

  useEffect(() => {
    const handler = () => {
      activityRef.current = new Date().toISOString();
    };

    window.addEventListener('touchstart', handler);
    window.addEventListener('click', handler);
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('touchstart', handler);
      window.removeEventListener('click', handler);
      window.removeEventListener('scroll', handler);
    };
  }, []);

  const addActivity = (type, message) => {
    const event = {
      id: activityIdRef.current++,
      type,
      message,
      timestamp: new Date(),
    };
    setActivities((prev) => [event, ...prev].slice(0, 6));
  };

  useEffect(() => {
    if (!worker?.shiftActive) return;
    const gpsInterval = setInterval(() => {
      addActivity('gps', 'GPS ping received');
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(gpsInterval);
  }, [worker?.shiftActive]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivities((prev) => [...prev]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadWorkers();
    const timer = setTimeout(() => setSiteReady(true), 280);
    return () => clearTimeout(timer);
  }, []);

  const loadWorkers = async () => {
    setIsLoading(true);
    let existing = await base44.entities.Worker.list();
    if (existing.length === 0) {
      await base44.entities.Worker.bulkCreate(SEED_WORKERS);
      existing = await base44.entities.Worker.list();
    }

    setWorkers(existing);
    
    let matchingWorker = authUser ? existing.find(w => w.name.toLowerCase() === authUser.name.toLowerCase()) : null;
    
    if (!matchingWorker && authUser) {
        const newWorkerData = {
            workerId: `W${Date.now().toString().slice(-4)}`,
            name: authUser.name,
            homeCity: 'Delhi',
            shiftActive: false,
            lastGPS_lat: 28.6139,
            lastGPS_lng: 77.2090,
            lastGPS_city: 'Delhi',
            lastIP: '127.0.0.1',
            isMockLocation: false,
            payoutStatus: 'NONE',
            payoutAmount: 0,
            avatar: 'blue',
        };
        const createdWorker = await base44.entities.Worker.create(newWorkerData);
        existing = await base44.entities.Worker.list();
        setWorkers(existing);
        matchingWorker = existing.find(w => w.name.toLowerCase() === authUser.name.toLowerCase()) || createdWorker;
    }

    const nextId = matchingWorker ? String(matchingWorker.id) : (existing.length > 0 ? String(existing[0].id) : null);

    if (nextId) {
      setSelectedWorkerId(nextId);
      setWorker(existing.find((w) => String(w.id) === nextId) || existing[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!selectedWorkerId) return;
    localStorage.setItem(ACTIVE_WORKER_KEY, selectedWorkerId);
  }, [selectedWorkerId]);

  useEffect(() => {
    if (!selectedWorkerId || workers.length === 0) return;
    const selected = workers.find((w) => String(w.id) === selectedWorkerId);
    if (selected) setWorker(selected);
  }, [selectedWorkerId, workers]);

  useEffect(() => {
    if (!worker) return;
    base44.entities.Claim.filter({ workerId: worker.workerId }, '-created_date', 1).then((claims) => {
      setLatestClaim(claims[0] || null);
    });
  }, [worker?.id, worker?.payoutStatus]);

  useEffect(() => {
    if (!worker?.shiftActive) return;
    intervalRef.current = setInterval(async () => {
      await base44.entities.Worker.update(worker.id, { lastActivity: activityRef.current });
      const updated = await base44.entities.Worker.list();
      setWorkers(updated);
      setLastSyncTime(new Date());
    }, 30000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [worker?.id, worker?.shiftActive]);

  useEffect(() => {
    setLastSyncTime(new Date());
  }, [worker?.id, latestClaim?.id]);

  useEffect(() => {
    const cityName = worker?.lastGPS_city || worker?.homeCity;
    if (!cityName) return;

    let cancelled = false;

    const loadLiveWeather = async () => {
      const weather = await fetchLiveWeatherForCity(cityName);
      if (!cancelled) {
        setLiveWeather(weather);
      }
    };

    loadLiveWeather();

    return () => {
      cancelled = true;
    };
  }, [worker?.lastGPS_city, worker?.homeCity]);

  const toggleShift = async () => {
    if (!worker) return;
    setIsToggling(true);
    const nextState = !worker.shiftActive;

    const payload = {
      shiftActive: nextState,
      lastActivity: new Date().toISOString(),
    };

    if (nextState) {
      payload.payoutStatus = 'NONE';
      payload.payoutAmount = 0;
    }

    await base44.entities.Worker.update(worker.id, payload);
    const refreshed = await base44.entities.Worker.list();
    setWorkers(refreshed);
    setIsToggling(false);

    if (voiceEnabled) {
      speakAlert(nextState ? T[lang]?.shift_start : T[lang]?.shift_stop, lang);
    }
  };

  const simulateWeatherEvent = async () => {
    if (!worker || isTriggeringEvent) return;

    setIsTriggeringEvent(true);
    addActivity('weather', 'Weather spike detected');
    const city = worker.lastGPS_city || worker.homeCity;
    const eventWeather = triggerSevereWeather(city);

    const cpsData = {
      ...worker,
      ipCity: worker.lastGPS_city,
      lastActivity: activityRef.current,
    };
    const { score, signals } = calculateCPS(cpsData);
    const status = determineClaimStatus(score);

    try {
      await base44.entities.Claim.create({
        claimId: `CLM-${Date.now()}`,
        workerId: worker.workerId,
        workerName: worker.name,
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
        weatherCondition: eventWeather.name,
        payoutAmount: status === 'AUTO_APPROVED' ? 500 : 0,
      });

      if (status === 'AUTO_APPROVED') {
        addActivity('payout', '₹500 credited to account');
        setPayoutNotification({ stage: 0, amount: 500 });
        setTimeout(() => setPayoutNotification((prev) => (prev ? { ...prev, stage: 1 } : null)), 1200);
        setTimeout(() => setPayoutNotification((prev) => (prev ? { ...prev, stage: 2 } : null)), 2400);
        setTimeout(() => setPayoutNotification(null), 4200);

        await base44.entities.Worker.update(worker.id, {
          payoutStatus: 'PAID',
          payoutAmount: 500,
          payoutTimestamp: new Date().toISOString(),
          currentWeather: eventWeather.name,
          weatherCode: eventWeather.code,
        });

        if (voiceEnabled) speakAlert(T[lang]?.weather_alert, lang);
      } else {
        await base44.entities.Worker.update(worker.id, {
          payoutStatus: 'PENDING',
          currentWeather: eventWeather.name,
          weatherCode: eventWeather.code,
        });
      }

      const refreshed = await base44.entities.Worker.list();
      setWorkers(refreshed);
      setLastSyncTime(new Date());
    } finally {
      setIsTriggeringEvent(false);
    }
  };

  const getTimeAgo = () => {
    const diff = Math.floor((new Date().getTime() - lastSyncTime.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    return `${Math.floor(diff / 60)}m ago`;
  };

  const formatActivityAge = (timestamp) => {
    const diff = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    return `${Math.floor(diff / 60)}m`;
  };

  const onVoiceToggleFallback = (nextEnabled) => {
    setVoiceEnabled(nextEnabled);
    if (nextEnabled) {
      speakAlert(T[lang]?.shift_start || 'Voice alerts enabled', lang);
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#08090a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1e2025] border-t-[#06b6d4]" />
      </div>
    );
  }

  const weather = getWeatherByCode(worker?.weatherCode) || liveWeather || getWeatherForCity(worker?.lastGPS_city || worker?.homeCity);
  const city = worker?.lastGPS_city || worker?.homeCity;
  const shortName = (worker?.name || 'Ravi Kumar').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  const cpsScore = latestClaim?.cpsScore ?? 92;

  const timelineItems = [
    latestClaim
      ? {
          title: `${latestClaim.status === 'AUTO_APPROVED' ? 'Auto-approved' : latestClaim.status} - ₹${latestClaim.payoutAmount || 0}`,
          meta: `${(latestClaim.weatherCondition || weather?.name || 'weather').toLowerCase()} - CPS ${latestClaim.cpsScore || 0}`,
          tone: latestClaim.status === 'AUTO_APPROVED' ? 'bg-[#06b6d4]' : 'bg-[#e8a020]',
        }
      : null,
    { title: 'Payout disbursed - ₹500', meta: 'upi transfer - yesterday', tone: 'bg-[#06b6d4]' },
    { title: 'Manual review', meta: 'location mismatch - 3d ago', tone: 'bg-[#3b82f6]' },
    { title: 'Auto-approved - ₹500', meta: 'heavy rain - CPS 89 - 5d ago', tone: 'bg-[#06b6d4]' },
  ].filter(Boolean);

  const signalRows = [
    { label: 'IP match', value: 'pass', width: '95%', track: 'bg-[#06b6d4]' },
    { label: 'Location history', value: 'pass', width: '88%', track: 'bg-[#06b6d4]' },
    { label: 'App activity', value: 'caution', width: '62%', track: 'bg-[#3b82f6]' },
    { label: 'Mock detection', value: 'clear', width: '100%', track: 'bg-[#06b6d4]' },
  ];

  const renderRightRail = (isMobile = false) => (
    <div className={`flex flex-col ${isMobile ? 'gap-3 sm:gap-4 md:gap-5' : 'gap-5'} w-full`}>
      <section>
        <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">last payout</p>
        <div className="rounded-xl border border-[#0891b2]/30 bg-[#06b6d4]/5 p-4">
          <p className="text-5xl leading-none text-[#06b6d4]">₹{worker?.payoutAmount || 500}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wider text-[#06b6d4]/80">credited - {getTimeAgo()}</p>
          <div className="mt-3 flex justify-between border-t border-[#1e2025] pt-2 text-[10px] uppercase tracking-wider text-[#5a5d6a]">
            <span>basic shield</span><span>₹137/mo</span>
          </div>
        </div>
      </section>

      <section>
        <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">cps fraud score</p>
        <div className="rounded-xl border border-[#1e2025] bg-[#141618] p-4">
          <div className="mb-3 flex items-end gap-2">
            <span className="text-5xl leading-none text-[#06b6d4]">{cpsScore}</span>
            <span className="pb-1 text-xs font-mono text-[#5a5d6a]">/100</span>
            <span className="ml-auto rounded border border-[#0891b2]/30 bg-[#06b6d4]/10 px-2 py-1 text-[10px] uppercase tracking-wider text-[#06b6d4]">auto-approved</span>
          </div>
          <div className="space-y-2.5">
            {signalRows.map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wider text-[#5a5d6a]"><span>{row.label}</span><span className={row.value === 'caution' ? 'text-[#3b82f6]' : 'text-[#06b6d4]'}>{row.value}</span></div>
                <div className="h-1 w-full rounded bg-[#252830]"><div className={`h-1 rounded ${row.track === 'bg-[#06b6d4]' ? 'bg-[#06b6d4]' : 'bg-[#3b82f6]'}`} style={{ width: row.width }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">language</p>
        <div className="rounded-xl border border-[#1e2025] bg-[#141618] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-[#a0a3b0]">{lang.toUpperCase()} selected</p>
            <button
              type="button"
              onClick={() => {
                const next = !voiceEnabled;
                onVoiceToggleFallback(next);
              }}
              className={`rounded-md border px-2 py-1 text-[10px] uppercase tracking-wider ${voiceEnabled ? 'border-[#0891b2]/30 bg-[#06b6d4]/10 text-[#06b6d4]' : 'border-[#252830] bg-[#0f1012] text-[#5a5d6a]'}`}
            >
              voice {voiceEnabled ? 'on' : 'off'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowLanguagePanel((v) => !v)}
            className="w-full rounded-md border border-[#252830] bg-[#0f1012] px-2 py-1.5 text-xs text-[#a0a3b0] hover:text-[#f0f0f2]"
          >
            {showLanguagePanel ? 'Hide language options' : 'Change language'}
          </button>
          {showLanguagePanel && (
            <div className="mt-2">
              <LanguageVoicePanel
                lang={lang}
                onLangChange={setLang}
                voiceEnabled={voiceEnabled}
                onVoiceToggle={() => onVoiceToggleFallback(!voiceEnabled)}
              />
            </div>
          )}
        </div>
      </section>

      <section>
        <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">coverage plan</p>
        <SmartCoveragePlans
          currentPlan="basic"
          weather={weather}
          city={city}
        />
      </section>

      <section>
        <p className="mb-2 text-[10px] uppercase tracking-[0.1em] text-[#5a5d6a]">safe zone routing</p>
        <div className="rounded-xl border border-[#1e2025] bg-[#141618] p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs">Current area status</p>
            <span className="rounded-md border border-[#7f2222] bg-[#2a0808] px-2 py-1 text-[10px] uppercase tracking-wider text-[#e84040]">severe</span>
          </div>
          <p className="text-xs text-[#5a5d6a]">Nearest shelter: CSMT Station - 1.2 km.</p>
        </div>
      </section>
    </div>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#08090a] font-inter text-[#f0f0f2] relative">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: siteReady ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className="absolute inset-0 z-50 pointer-events-none bg-[#08090a]"
      />
      <WeatherEffects condition={weather?.name} />
      <LowBatteryGuard onLowBattery={setIsLowBattery} />


      <AppHeader 
        user={worker}
        title="Worker Dashboard"
        syncStatus="online"
        onRefresh={() => {
           loadWorkers();
           setLastSyncTime(new Date());
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden w-[65px] border-r border-[#1e2025] md:block">
          <WorkerSideNav />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          <main className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-12 pb-24 md:pb-8 lg:pb-12 scrollbar-custom w-full">
            <div className="w-full mx-auto max-w-[1600px] flex flex-col gap-6 md:gap-8 lg:gap-10">
              <AnimatePresence>


            {payoutNotification && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-[100] flex items-center justify-center"
              >
                {payoutNotification.stage === 2 && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="h-64 w-64 rounded-full bg-cyan-500/30 blur-3xl"
                  />
                )}
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="w-[280px] rounded-xl border border-[#252830] bg-[#0f1012]/90 p-5 backdrop-blur-xl shadow-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl border-2 transition-all duration-300 ${payoutNotification.stage === 2 ? 'border-[#06b6d4] bg-[#06b6d4]/10 text-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#3b82f6]'}`}>
                      {payoutNotification.stage === 0 ? <CloudLightning className="animate-bounce" /> : payoutNotification.stage === 1 ? <RefreshCw className="animate-spin" /> : <Shield className="animate-pulse" />}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#f0f0f2]">
                        {payoutNotification.stage === 0 ? 'Event Detected' : payoutNotification.stage === 1 ? 'CPS Auditing...' : 'Payout Disbursed'}
                      </p>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-[#5a5d6a]">
                        {payoutNotification.stage === 2 ? '₹500.00 SETTLED' : 'Real-time validation'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

          </AnimatePresence>

          {worker?.payoutStatus === 'PENDING' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 rounded-xl border border-[#3b82f6]/30 bg-[#3b82f6]/5 px-3 sm:px-4 py-3">
              <div className="grid h-6 w-6 sm:h-7 sm:w-7 place-items-center rounded-md border border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#3b82f6] flex-shrink-0">!</div>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-[#3b82f6]">Claim is being processed</p>
                <p className="text-[11px] sm:text-xs text-[#5a5d6a]">You will be notified within 2 hours</p>
              </div>
              <span className="rounded-md border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-2 py-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-[#3b82f6] whitespace-nowrap">pending</span>
            </div>
          )}

          <section className="rounded-2xl border border-[#1e2025] bg-[#0f1012] p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 md:gap-6">
              <div className="grid h-12 sm:h-14 w-12 sm:w-14 place-items-center rounded-xl border border-[#0891b2]/30 bg-[#06b6d4]/10 text-xl sm:text-2xl text-[#06b6d4] shadow-[0_0_15px_rgba(6,182,212,0.1)]">{shortName[0] || 'R'}</div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-[36px] font-bold leading-none tracking-tight text-[#f0f0f2]">{worker?.name || 'Worker'}</h1>
                <p className="mt-2 text-[10px] sm:text-[12px] uppercase font-bold tracking-[0.15em] text-[#5a5d6a]">{worker?.workerId || 'WRK-00142'} · {city}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider">
                <span className={`rounded-lg border px-3 py-1.5 ${worker?.shiftActive ? 'border-[#0891b2]/30 bg-[#06b6d4]/10 text-[#06b6d4]' : 'border-[#3a3d48] bg-[#141618] text-[#5a5d6a]'}`}>shift {worker?.shiftActive ? 'active' : 'offline'}</span>
                <span className="rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/10 px-3 py-1.5 text-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.1)]">{weather?.name?.toLowerCase() || 'clear'}</span>
                <span className="rounded-lg border border-[#203e7d] bg-[#0a1428] px-3 py-1.5 text-[#4080ff]">Quantum shield</span>
              </div>
            </div>
          </section>


          <section className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-[#1e2025] bg-[#0f1012] px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 shadow-xl transition-all duration-300 hover:border-[#333]">
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">total earnings (net)</p>
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl font-bold leading-none text-[#06b6d4]">₹4,530</p>
              <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider text-[#5a5d6a]">9 settlements · live ledger</p>
            </div>
            <div className="rounded-2xl border border-[#1e2025] bg-[#0f1012] px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group transition-all duration-300 hover:border-[#06b6d4]/30 shadow-xl">
              <div>
                <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">cps trust integrity</p>
                <div className="flex items-baseline gap-1 mt-3 sm:mt-4">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold leading-none text-[#f0f0f2]">{cpsScore}</p>
                  <p className="text-xs sm:text-sm md:text-base font-bold text-[#5a5d6a]">/100</p>
                </div>
                <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider text-[#06b6d4] font-bold">SECURE CHANNEL</p>
              </div>
              <div className="hidden sm:block">
                <CPSShieldGauge score={cpsScore} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e2025] bg-[#0f1012] px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 shadow-xl">
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">shift duration</p>
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl font-bold leading-none text-[#f0f0f2]">{worker?.shiftActive ? '4h 22m' : '0h 00m'}</p>
              <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider text-[#5a5d6a]">active since 10:38 AM</p>
            </div>
            <div className="rounded-2xl border border-[#1e2025] bg-[#0f1012] px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 shadow-xl">
              <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">nav accuracy (RT)</p>
              <p className="mt-3 sm:mt-4 text-2xl sm:text-3xl md:text-4xl font-bold leading-none text-[#f0f0f2]">±12.4m</p>
              <p className="mt-2 sm:mt-3 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-wider text-[#06b6d4] font-bold">STABLE SYNC</p>
            </div>
          </section>


          <section className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 rounded-2xl border border-[#1e2025] bg-[#0f1012] p-4 sm:p-6 md:p-8 lg:flex-row lg:items-center shadow-2xl overflow-hidden relative">
              <div className="flex flex-col items-center justify-center relative min-w-[100px] sm:min-w-[140px]">
                {worker?.shiftActive && (
                  <div className="absolute inset-0 z-0 bg-[#06b6d4]/10 blur-[80px] animate-pulse rounded-full" />
                )}
                <motion.button
                  type="button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                    setTimeout(() => setRipple(null), 450);
                    toggleShift();
                  }}
                  whileHover={{ scale: 1.04 }}
                  animate={
                    worker?.shiftActive
                      ? {
                          boxShadow: [
                            '0 0 12px rgba(6, 182, 212, 0.25), 0 0 0 2px rgba(6, 182, 212, 0.08)',
                            '0 0 32px rgba(59, 130, 246, 0.55), 0 0 64px rgba(6, 182, 212, 0.42), 0 0 0 4px rgba(6, 182, 212, 0.14)',
                            '0 0 12px rgba(6, 182, 212, 0.25), 0 0 0 2px rgba(6, 182, 212, 0.08)',
                          ],
                        }
                      : {
                          boxShadow: '0 0 0 rgba(0,0,0,0)',
                        }
                  }
                  transition={
                    worker?.shiftActive
                      ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                  className={`group relative h-[100px] w-[100px] rounded-full border-2 transition-all duration-500 shadow-2xl active:scale-90 ${
                    worker?.shiftActive
                      ? 'border-[#06b6d4] bg-gradient-to-br from-[#083344] to-[#0f1012] text-[#06b6d4]'
                      : 'border-[#1e2025] bg-gradient-to-br from-[#141618] to-[#0f1012] text-[#5a5d6a]'
                  }`}
                  disabled={isToggling}
                >
                  {ripple && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0.6 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute h-4 w-4 rounded-full bg-[#06b6d4]"
                      style={{ left: ripple.x - 8, top: ripple.y - 8 }}
                    />
                  )}
                  <span className={`absolute inset-[32px] grid place-items-center rounded-full transition-all duration-500 ${worker?.shiftActive ? 'bg-[#06b6d4] text-black shadow-[0_0_25px_#06b6d4]' : 'bg-[#252830] text-[#5a5d6a]'}`}>
                    <Power className={`h-6 w-6 ${worker?.shiftActive ? 'animate-pulse' : ''}`} />
                  </span>
                </motion.button>
                <p className="mt-4 text-[12px] font-black uppercase tracking-[0.2em] text-[#06b6d4]">{worker?.shiftActive ? 'online' : 'paused'}</p>
                <p className="text-[10px] text-[#5a5d6a] font-bold uppercase tracking-widest mt-1">session secure</p>
              </div>

              <div className="flex flex-1 flex-col gap-3 sm:gap-4 md:gap-6">
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#1e2025] bg-[#141618] px-3 py-2 sm:px-4 sm:py-3 transition-colors hover:bg-[#1a1d21] group">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a] transition-colors group-hover:text-[#a0a3b0]">active weather</p>
                    <p className="text-sm sm:text-base font-medium mt-1">{weather?.name || 'Clear'}</p>
                  </div>
                  <div className="rounded-xl border border-[#1e2025] bg-[#141618] px-4 py-3 group">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">signal metadata</p>
                    <p className="text-sm sm:text-base font-medium text-[#06b6d4] mt-1">HIGH INTEGRITY</p>
                  </div>
                  <div className="rounded-xl border border-[#1e2025] bg-[#141618] px-4 py-3 group">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">localization</p>
                    <p className="text-sm sm:text-base font-medium mt-1">GPS-V4 (MOCK)</p>
                  </div>
                  <div className="rounded-xl border border-[#1e2025] bg-[#141618] px-4 py-3 group">
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">user involvement</p>
                    <p className="text-sm sm:text-base font-medium mt-1">62.8% active</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">infrastructure connectivity</p>
                  <div className="flex h-5 items-end gap-1.5">
                    {[6, 10, 14, 18, 20].map((h, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}px` }}
                        className={`w-2 rounded-sm ${idx === 4 ? 'bg-[#252830]' : 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.3)]'}`} 
                      />
                    ))}
                  </div>
                </div>

                {isLowBattery && <div className="rounded-lg border border-[#3b82f6]/30 bg-[#3b82f6]/5 px-4 py-3 text-[12px] font-medium text-[#3b82f6] animate-pulse">Intelligent power management active.</div>}
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-[#1e2025] bg-[#0f1012] p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl md:text-[28px] font-bold leading-tight">{weather?.name || 'Tropical storm'}</h3>
                  <p className="mt-2 text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.15em] text-[#5a5d6a]">{city}</p>
                </div>
                <span className={`rounded-lg border px-2 py-1 sm:px-3 sm:py-1.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest whitespace-nowrap ${weather?.severe ? 'border-[#ef4444]/30 bg-red-500/10 text-red-500' : 'border-[#3a3d48] bg-[#141618] text-[#5a5d6a]'}`}>{weather?.severe ? 'critical' : 'stable'}</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between border-t border-[#1e2025] py-2 sm:py-3.5"><span className="text-[10px] sm:text-[12px] font-medium text-[#5a5d6a]">Payout eligibility</span><span className="font-mono text-sm sm:text-base font-bold text-[#06b6d4]">QUALIFIED</span></div>
                <div className="flex justify-between border-t border-[#1e2025] py-2 sm:py-3.5"><span className="text-[10px] sm:text-[12px] font-medium text-[#5a5d6a]">Estimated weight</span><span className="font-mono text-sm sm:text-base font-bold">₹500.00</span></div>
                <div className="flex justify-between border-t border-[#1e2025] py-2 sm:py-3.5"><span className="text-[10px] sm:text-[12px] font-medium text-[#5a5d6a]">Oracles active</span><span className="font-mono text-sm sm:text-base font-bold">3 SENSORS</span></div>
              </div>

              <Button onClick={simulateWeatherEvent} disabled={isTriggeringEvent} className="mt-6 sm:mt-8 h-10 sm:h-12 w-full rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-[11px] sm:text-[13px] font-black uppercase tracking-widest text-white hover:opacity-90 shadow-2xl shadow-cyan-500/20 active:scale-95 transition-all">
                <RefreshCw className={`mr-2.5 h-4 w-4 ${isTriggeringEvent ? 'animate-spin' : ''}`} />
                {isTriggeringEvent ? 'Orchestrating...' : worker?.shiftActive ? 'Trigger Environmental Event' : 'Trigger Demo Event'}
              </Button>
            </div>
          </section>


          <section className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 2xl:grid-cols-2">
            <div className="rounded-2xl border border-[#1e2025] bg-[#0f1012] p-4 sm:p-6 md:p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1e2025] pb-4">
                <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-[#5a5d6a]">real-time infrastructure log</p>
                <span className="rounded-lg border border-[#1e2025] bg-[#141618] px-2 py-1 text-[9px] sm:text-[11px] font-mono text-[#5a5d6a]">{activities.length} packets</span>
              </div>
              <div className="space-y-2">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 sm:gap-4 border-b border-[#1e2025] py-2 sm:py-3.5 text-[11px] sm:text-[13px] last:border-0">
                    <span className={`h-2 w-2 rounded-full flex-shrink-0 ${activity.type === 'weather' ? 'bg-[#3b82f6] shadow-[0_0_8px_rgba(59,130,246,0.5)]' : activity.type === 'payout' ? 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-[#6366f1]'}`} />
                    <span className="flex-1 text-[#a0a3b0] font-medium text-[10px] sm:text-[13px]">{activity.message}</span>
                    <span className="text-[9px] sm:text-[11px] font-mono text-[#5a5d6a] font-bold whitespace-nowrap">{formatActivityAge(activity.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#1e2025] bg-[#0f1012] p-4 sm:p-6 md:p-8 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-[#1e2025] pb-4">
                <p className="text-[10px] sm:text-[12px] font-bold uppercase tracking-[0.2em] text-[#5a5d6a]">verified claim timeline</p>
                <span className="rounded-lg border border-[#1e2025] bg-[#141618] px-2 py-1 text-[9px] sm:text-[11px] font-mono text-[#5a5d6a]">{timelineItems.length} records</span>
              </div>

              <div className="relative pl-2">
                <div className="absolute bottom-4 left-[14px] top-4 w-px bg-[#1e2025]" />
                {timelineItems.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="relative flex gap-5 py-4 first:pt-0 last:pb-0">
                    <div className="z-10 mt-1.5 grid h-4 w-4 place-items-center rounded-full border border-[#252830] bg-[#141618] shadow-lg flex-shrink-0">
                      <div className={`h-2 w-2 rounded-full ${item.tone} shadow-sm`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] sm:text-[14px] font-bold text-[#f0f0f2] break-words">{item.title}</p>
                      <p className="mt-1.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-[#5a5d6a] break-words">{item.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="lg:hidden rounded-2xl border border-[#1e2025] bg-[#08090a] p-3 sm:p-4">
            {renderRightRail(true)}
          </section>
        </div>
      </main>


          <aside className="hidden lg:flex w-[280px] border-l border-[#1e2025] bg-[#08090a] p-4 overflow-y-auto scrollbar-custom">
            {renderRightRail(false)}
          </aside>
        </div>
      </div>

      <div className="md:hidden">
        <WorkerSideNav />
      </div>

    </div>
  );
}
