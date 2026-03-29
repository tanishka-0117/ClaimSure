import { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { CloudRain, Banknote, MapPin, Search, ShieldCheck, RefreshCw } from 'lucide-react';

export default function WeatherImpactDemo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.5 });
  const [phase, setPhase] = useState('calm'); // calm, storm, paid

  useEffect(() => {
    if (!isInView) return;

    // Sequence timings
    const stormTimer = setTimeout(() => setPhase('storm'), 2500);
    const paidTimer = setTimeout(() => setPhase('paid'), 6500);

    return () => {
      clearTimeout(stormTimer);
      clearTimeout(paidTimer);
    };
  }, [isInView]);

  const resetDemo = () => {
    setPhase('calm');
    setTimeout(() => setPhase('storm'), 2500);
    setTimeout(() => setPhase('paid'), 6500);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 my-4">
      <div 
        ref={containerRef}
        className="relative flex min-h-[550px] md:min-h-[650px] w-full flex-col items-center justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/40 shadow-2xl backdrop-blur-xl transition-all duration-700"
      >
        
        {/* --- DYNAMIC BACKGROUNDS --- */}
        <AnimatePresence>
          {phase === 'storm' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 z-0 bg-slate-950/80"
            >
              <div className="absolute inset-0 weather-rain-layer opacity-80" />
              <div className="absolute inset-0 weather-rain-layer-2 opacity-60" />
            </motion.div>
          )}

          {phase === 'paid' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 z-0 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.25)_0%,transparent_60%)] blur-[40px] pointer-events-none"
            />
          )}
        </AnimatePresence>


        {/* --- TOP SECTION: TEXT NARRATIVE --- */}
        <div className="relative z-20 mt-16 flex h-24 items-center justify-center text-center px-6 w-full">
          <AnimatePresence mode="wait">
            {phase === 'calm' && (
              <motion.div
                key="text-calm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <h2 className="text-3xl md:text-5xl font-semibold text-slate-100 tracking-tight">
                  When bad weather hits,<br />
                  <span className="text-slate-400">workers bear the cost.</span>
                </h2>
              </motion.div>
            )}

            {phase === 'storm' && (
              <motion.div
                key="text-storm"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <h2 className="text-3xl md:text-5xl font-semibold text-slate-100 tracking-tight drop-shadow-lg">
                  Our automated engine<br />
                  <span className="text-cyan-400">detects criteria instantly.</span>
                </h2>
              </motion.div>
            )}

            {phase === 'paid' && (
              <motion.div
                key="text-paid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl"
              >
                <h2 className="text-3xl md:text-5xl font-semibold text-slate-100 tracking-tight drop-shadow-lg">
                  Funds are triggered<br />
                  <span className="text-lime-400">with zero paperwork.</span>
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


        {/* --- MIDDLE SECTION: UI MOCKUP --- */}
        <div className="relative z-20 mb-16 mt-8 flex w-full flex-col items-center justify-center perspective-1000">
          <motion.div 
            animate={
              phase === 'storm' 
                ? { x: [0, -3, 3, -2, 2, 0], y: [0, 2, -2, 1, -1, 0] } 
                : { x: 0, y: 0 }
            }
            transition={
              phase === 'storm'
                ? { repeat: Infinity, duration: 0.4, ease: "linear" }
                : { duration: 0.5 }
            }
            className={`relative mx-auto w-full max-w-[280px] md:max-w-[320px] aspect-[4/5] rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl transition-all duration-700 ${phase === 'storm' ? 'backdrop-blur-md bg-opacity-70' : ''}`}
          >
            {/* Header bar of fake phone */}
            <div className="absolute top-4 inset-x-0 mx-auto flex w-1/3 h-5 justify-center opacity-50">
               <div className="h-1.5 w-16 rounded-full bg-slate-700"></div>
            </div>

            {/* View container */}
            <div className="absolute inset-0 top-10 p-5 overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* CALM VIEW */}
                {phase === 'calm' && (
                  <motion.div 
                    key="ui-calm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col items-center pt-8"
                  >
                    <div className="mb-4 rounded-full bg-emerald-500/20 p-5 ring-1 ring-emerald-500/30">
                      <MapPin className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-medium text-slate-200">Active Delivery</h3>
                    <p className="mt-2 text-sm text-slate-500">Routing in progress</p>
                    <div className="mt-8 w-full space-y-3">
                      <div className="h-12 w-full rounded-xl bg-slate-800/80 animate-pulse"></div>
                      <div className="h-12 w-full rounded-xl bg-slate-800/80 animate-pulse delay-75"></div>
                    </div>
                  </motion.div>
                )}

                {/* STORM VIEW */}
                {phase === 'storm' && (
                  <motion.div 
                    key="ui-storm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full flex-col items-center pt-8"
                  >
                    <div className="relative mb-4 rounded-full bg-slate-950 p-5 ring-2 ring-cyan-500/50 glow-cyan-pulse">
                      <Search className="relative z-10 h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="text-xl font-medium text-cyan-400">Scanning Area</h3>
                    <p className="mt-2 text-sm text-slate-400 text-center">Validating weather signals...</p>
                    <div className="mt-8 w-full rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                      <div className="flex items-center gap-3">
                        <CloudRain className="h-5 w-5 text-cyan-300 animate-pulse" />
                        <span className="text-sm font-medium text-cyan-200">Severe rain matched & verified</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* PAID VIEW */}
                {phase === 'paid' && (
                  <motion.div 
                    key="ui-paid"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex h-full flex-col items-center pt-8"
                  >
                    <div className="mb-4 rounded-full bg-lime-500/20 p-5 glow-lime ring-1 ring-lime-500/50">
                      <Banknote className="h-10 w-10 text-lime-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-lime-400">$25.00 Payout</h3>
                    <p className="mt-2 text-sm text-slate-400">Processed automatically</p>
                    <div className="mt-10 w-full rounded-xl border border-lime-500/20 bg-lime-500/5 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-200 text-sm">
                        <ShieldCheck className="h-5 w-5 text-lime-400" /> Instant Claim
                      </div>
                      <span className="text-xs font-semibold text-lime-400 bg-lime-400/10 px-2 py-1 rounded">APPROVED</span>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
            
            {/* Bottom generic ui bar */}
            <div className="absolute bottom-5 inset-x-0 mx-auto h-1.5 w-1/3 rounded-full bg-slate-700/50"></div>
          </motion.div>
        </div>
        
        {/* Reset button to replay demo block */}
        <div className="absolute bottom-6 right-6 z-30">
           {phase === 'paid' && (
             <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={resetDemo}
                className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors border border-white/5 bg-slate-800/50 hover:bg-slate-800 rounded-full px-4 py-2 backdrop-blur-md"
             >
                <RefreshCw className="w-3.5 h-3.5" /> Replay Demo
             </motion.button>
           )}
        </div>

      </div>
    </div>
  );
}
