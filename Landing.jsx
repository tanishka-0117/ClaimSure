import { Link, useLocation } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { Shield, Zap, CloudLightning, CheckCircle, LocateFixed, Radar, WalletCards, Twitter, Linkedin, Github, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import WeatherImpactDemo from '@/components/WeatherImpactDemo';
import PublicNavbar from '@/components/claimsure/PublicNavbar';


export default function Landing() {
  const location = useLocation();
  const [activeTimelineStep, setActiveTimelineStep] = useState(null);
  const [siteReady, setSiteReady] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);
  const timelineRef = useRef(null);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/gopi9717402019@gmail.com", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        setIsContactSubmitted(true);
      } else {
        form.submit();
      }
    } catch (error) {
      form.submit();
    } finally {
      setIsSubmittingContact(false);
    }
  };
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start 85%', 'end 35%'],
  });

  useEffect(() => {
    const introTimer = setTimeout(() => setSiteReady(true), 280);
    return () => clearTimeout(introTimer);
  }, []);

  useEffect(() => {
    if (!location.hash) return;

    const targetId = location.hash.replace('#', '');
    const timer = setTimeout(() => {
      const section = document.getElementById(targetId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [location.hash]);

  const timelineLineScale = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), {
    stiffness: 120,
    damping: 22,
    mass: 0.3,
  });

  const premiumButtonBase =
    'rounded-xl px-5 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-[0_16px_34px_-14px_rgba(6,182,212,0.85)]';

  const features = [
    {
      icon: CloudLightning,
      title: 'Real-Time Weather Intelligence',
      desc: 'Continuous weather monitoring at each rider location with instant severe-event detection.',
      image: '/images/feature_weather_radar.png'
    },
    {
      icon: Shield,
      title: 'Fraud-Safe CPS Engine',
      desc: 'Multi-signal trust scoring validates context and blocks suspicious payout activity.',
      image: '/images/feature_secure_engine.png'
    },
    {
      icon: CheckCircle,
      title: 'Instant Parametric Payouts',
      desc: 'When trigger conditions match, eligible workers get paid automatically without forms.',
      image: '/images/feature_instant_payout.png'
    },
  ];

  const steps = [
    {
      icon: LocateFixed,
      step: '01',
      title: 'Shift Starts',
      desc: 'Worker toggles shift on and begins protected delivery mode.',
    },
    {
      icon: Radar,
      step: '02',
      title: 'System Monitors',
      desc: 'Location and weather streams are validated in real-time.',
    },
    {
      icon: Zap,
      step: '03',
      title: 'Trigger Matched',
      desc: 'Severe condition + trusted context passes CPS checks.',
    },
    {
      icon: WalletCards,
      step: '04',
      title: 'Payout Released',
      desc: 'Claim is processed instantly and payout is initiated automatically.',
    },
  ];

  const timelineContainerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.14,
        delayChildren: 0.08,
      },
    },
  };

  const timelineItemVariants = {
    hidden: { opacity: 0, y: 26, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.58,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const handleFeatureMouseMove = (event) => {
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const rotateY = (x - 50) / 8;
    const rotateX = (50 - y) / 8;

    card.style.setProperty('--mx', `${x}%`);
    card.style.setProperty('--my', `${y}%`);
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  };

  const resetFeatureCard = (event) => {
    const card = event.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.setProperty('--mx', '50%');
    card.style.setProperty('--my', '50%');
  };

  return (
    <motion.div
      initial={{ opacity: 0.96 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-inter"
    >
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: siteReady ? 0 : 1 }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-0 z-[70] bg-slate-950"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/so_genearte_a_202603282306.png')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-slate-950/55" />
      <div className="noise-overlay pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 aurora-glow" />
      <div className="pointer-events-none absolute inset-0 bg-grid-white opacity-25 mix-blend-overlay" />

      <PublicNavbar />

      <motion.main
        initial={{ opacity: 0, y: 28 }}
        animate={siteReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full overflow-x-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 pt-8 md:pt-12 lg:pt-28">
          <section className="py-12 md:py-20 lg:py-28 text-center md:text-left">
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-start lg:items-center w-full">
              <div className="flex flex-col items-center md:items-start">
                <div className="hero-line hero-line-1 mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  <Zap className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  Next-Gen Parametric Engine
                </div>

                <h1 className="mx-auto md:mx-0 max-w-4xl text-3xl md:text-5xl font-bold tracking-tight text-white lg:text-7xl xl:text-8xl leading-tight md:leading-tight">
                  <span className="hero-line hero-line-2 block">Unpredictable weather.</span>
                  <span className="hero-line hero-line-3 block mt-2">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">Predictable payouts.</span>
                  </span>
                </h1>

                <p className="hero-line hero-line-4 mx-auto md:mx-0 mb-8 md:mb-10 mt-4 md:mt-6 max-w-xl text-base md:text-lg text-slate-400 text-center md:text-left">
                  ClaimSure monitors local weather metrics and triggers immediate, fraud-resistant payouts the moment disruption happens.
                </p>

                <div className="hero-line hero-line-6 flex flex-col justify-center gap-3 sm:flex-row md:justify-start w-full md:w-auto">
                  <Link to="/auth" state={{ role: 'worker' }}>
                    <Button
                      size="lg"
                      className={`${premiumButtonBase} group h-14 relative overflow-hidden bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] px-10 text-base font-bold text-white shadow-[0_20px_40px_-15px_rgba(6,182,212,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_25px_50px_-12px_rgba(6,182,212,0.5)]`}
                    >
                      <span className="relative z-10 flex items-center gap-3">Open Worker App</span>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transition-all duration-300 group-hover:h-full group-hover:bg-white/5" />
                    </Button>
                  </Link>

                  <Link to="/auth" state={{ role: 'admin' }}>
                    <Button
                      size="lg"
                      className="h-14 rounded-xl border border-white/20 bg-white/5 px-10 text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-cyan-300/40"
                    >
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>


                <div className="hero-line hero-line-5 mt-16 max-w-2xl perspective-1000 hidden md:block w-full">
                  <motion.div
                    initial={{ rotateX: 5, y: 10 }}
                    animate={{ rotateX: 0, y: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.6 }}
                    className="relative rounded-2xl border border-white/10 bg-black/80 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:border-[#06b6d4]/30"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Radar className="h-4 w-4 text-[#06b6d4] animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5a5d6a]">Risk intelligence stream</span>
                      </div>
                      <div className="flex gap-1.5 opacity-30 hover:opacity-100 transition-opacity">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1e2025]"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1e2025]"></div>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#1e2025]"></div>
                      </div>
                    </div>
                    <div className="font-mono text-left text-[11px] leading-relaxed text-[#a0a3b0] space-y-2">
                      <div className="flex gap-4 items-center">
                        <span className="text-[#5a5d6a] w-12">10:42:01</span>
                        <span className="text-[#06b6d4] font-bold">GET</span>
                        <span className="text-[#f0f0f2]">/weather/loc_WX92</span>
                        <span className="text-[#5a5d6a]">200 OK</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-[#5a5d6a] w-12">10:42:02</span>
                        <span className="text-[#fbbf24] font-bold">WARN</span>
                        <span className="text-[#a0a3b0]">Precipitation exceeds 40mm/h</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="text-[#5a5d6a] w-12">10:42:02</span>
                        <span className="text-[#3b82f6] font-bold">POST</span>
                        <span className="text-[#f0f0f2]">/claims/trigger</span>
                        <span className="text-[#5a5d6a]">201 CREATED</span>
                      </div>
                      <div className="flex gap-4 items-center bg-[#06b6d4]/5 -mx-4 px-4 py-2 border-l-2 border-[#06b6d4] rounded-r text-[12px]">
                        <span className="text-[#5a5d6a] text-[10px] w-12">10:42:03</span>
                        <span className="text-[#06b6d4] font-bold">EXEC</span>
                        <span className="text-[#f0f0f2]">₹5,200 Transferred to: ID:#8921</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div className="relative hidden w-full lg:block">
                <motion.img
                  src="/images/okay_but_my_202603282303.png"
                  alt="ClaimSure Tech Engine"
                  className="w-full h-[430px] xl:h-[500px] object-cover rounded-3xl opacity-90 transition-all duration-700 hover:opacity-100 drop-shadow-[0_0_80px_rgba(6,182,212,0.15)]"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10 rounded-3xl" />
              </div>
            </div>
          </section>

          <WeatherImpactDemo />

          <section id="features" className="grid gap-3 md:gap-6 py-8 md:py-14 md:grid-cols-3 w-full scroll-mt-24">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onMouseMove={handleFeatureMouseMove}
                onMouseLeave={resetFeatureCard}
                style={{
                  transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
                  '--mx': '50%',
                  '--my': '50%',
                }}
                className="group relative rounded-2xl p-[1px] transition-all duration-300 ease-in-out will-change-transform"
              >
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400/65 via-blue-400/55 to-indigo-400/65 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100" />
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/80 to-slate-900/60 p-0 shadow-[0_18px_38px_-26px_rgba(15,23,42,0.9)] backdrop-blur-xl">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-in-out z-20 group-hover:opacity-100"
                    style={{
                      background: 'radial-gradient(circle at var(--mx) var(--my), rgba(6, 182, 212, 0.28), rgba(99, 102, 241, 0.14) 22%, transparent 52%)',
                    }}
                  />
                  <div className="w-full h-24 md:h-40 overflow-hidden relative bg-black/40 flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent z-10" />
                    <img src={feature.image} alt={feature.title} className="w-full h-full object-contain relative z-0 transition-all duration-700 ease-out group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" />
                  </div>

                  <div className="relative z-10 flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-cyan-500/10 ring-1 ring-cyan-500/20 mx-6 -mt-4 md:-mt-5 bg-slate-900 shadow-md">
                    <feature.icon className="h-4 md:h-5 w-4 md:w-5 text-cyan-400 transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:-rotate-6" />
                  </div>
                  <div className="p-4 md:p-6 pt-2 md:pt-4 relative z-10">
                    <h3 className="mb-2 text-sm md:text-lg font-semibold text-slate-100">{feature.title}</h3>
                    <p className="text-xs md:text-sm leading-relaxed text-slate-400">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </section>

          <section id="how-it-works" ref={timelineRef} className="py-10 md:py-16 w-full scroll-mt-24">
            <div className="mb-6 md:mb-10 text-center">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-100">How It Works</h2>
              <p className="mt-2 text-xs md:text-sm lg:text-base text-slate-400">A transparent timeline from shift start to automatic payout.</p>
            </div>

            <div className="relative mx-auto max-w-6xl">
              <div className="pointer-events-none absolute left-8 right-8 top-7 hidden h-[2px] md:block">
                <div className="h-full w-full bg-slate-700/50" />
                <motion.div
                  style={{ scaleX: timelineLineScale, transformOrigin: 'left center' }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400/80 via-blue-400/80 to-indigo-400/80"
                />
              </div>

              <motion.div
                variants={timelineContainerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.25 }}
                className="grid gap-3 md:gap-6 grid-cols-1 md:grid-cols-4"
              >
                {steps.map((item, i) => (
                  <motion.div
                    key={item.step}
                    variants={timelineItemVariants}
                    onMouseEnter={() => setActiveTimelineStep(i)}
                    onMouseLeave={() => setActiveTimelineStep(null)}
                    className={`group relative transition-opacity duration-300 ${activeTimelineStep !== null && activeTimelineStep !== i ? 'opacity-65' : 'opacity-100'}`}
                  >
                    <div className="mb-4 flex items-center gap-3 md:flex-col md:items-center md:gap-2 md:text-center">
                      <div
                        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15 ring-1 ring-cyan-300/35 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-[0_0_26px_rgba(6,182,212,0.35)] ${activeTimelineStep === i ? 'scale-105 shadow-[0_0_34px_rgba(6,182,212,0.55)] ring-cyan-300/55' : ''}`}
                      >
                        {activeTimelineStep === i && (
                          <motion.div
                            layoutId="timeline-active-glow"
                            className="pointer-events-none absolute inset-0 rounded-2xl bg-cyan-400/20 blur-sm"
                            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                          />
                        )}
                        <item.icon className="h-5 w-5 text-cyan-300 transition-all duration-300 ease-in-out group-hover:rotate-6 group-hover:scale-110" />
                      </div>
                      <span
                        className={`rounded-full border border-cyan-300/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-cyan-300 transition-all duration-300 ease-in-out ${activeTimelineStep === i ? 'border-cyan-300/60 bg-cyan-400/20 text-blue-200 shadow-[0_0_22px_rgba(6,182,212,0.35)]' : ''}`}
                      >
                        STEP {item.step}
                      </span>
                    </div>

                    <div
                      className={`rounded-2xl border border-white/5 bg-slate-900/58 p-5 text-left shadow-[0_16px_34px_-24px_rgba(15,23,42,0.88)] backdrop-blur-xl transition-all duration-300 ease-in-out hover:-translate-y-[5px] hover:border-blue-300/25 hover:shadow-[0_22px_42px_-24px_rgba(234,179,8,0.55)] md:text-center ${activeTimelineStep === i ? 'border-blue-300/35 shadow-[0_24px_48px_-22px_rgba(234,179,8,0.65)]' : ''}`}
                    >
                      <h4 className="mb-1.5 text-sm font-semibold text-slate-100 md:text-base">{item.title}</h4>
                      <p className="text-xs leading-relaxed text-slate-400">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>
        </div>
      </motion.main>

      <footer className="relative mt-20 border-t border-white/10 bg-slate-950 pt-16 pb-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -ml-[400px] w-[800px] h-[400px] bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
            <div className="md:col-span-4 lg:col-span-3">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-cyan-400" />
                <span className="text-lg font-bold text-white tracking-tight">ClaimSure</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Next-generation parametric insurance platform delivering instant, weather-triggered payouts to independent workers worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://github.com/tanishka-0117/ClaimSure" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/30 transition-all">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://www.linkedin.com/in/gopi-nath-das-b40b52305" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/30 transition-all">
                  <Linkedin className="h-4 w-4" />
                </a>
                <a href="https://github.com/tanishka-0117/ClaimSure" target="_blank" rel="noopener noreferrer" className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/30 transition-all">
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">How it Works</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Weather Logic</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Worker App</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Admin Portal</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-white mb-4">Coverage</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Extreme Heat</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Heavy Rain</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Blizzard Warning</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Poor Air Quality</a></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-cyan-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div className="md:col-span-4 lg:col-span-3">
              <h4 className="text-sm font-semibold text-white mb-4">Get in Touch</h4>
              <p className="text-sm text-slate-400 mb-4">
                Subscribe to updates or send us a specific query. We'll be in touch!
              </p>
              {isContactSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center p-6 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-center shadow-[0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-sm"
                >
                  <div className="h-12 w-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-3 ring-1 ring-cyan-400/30">
                    <CheckCircle className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h5 className="font-semibold text-white mb-1">Message Received</h5>
                  <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                    Thanks for reaching out! Your query has been successfully sent to our team.
                  </p>
                  <button
                    onClick={() => setIsContactSubmitted(false)}
                    className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-400/30 underline-offset-4"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form
                  action="https://formsubmit.co/gopi9717402019@gmail.com"
                  method="POST"
                  onSubmit={handleContactSubmit}
                  className="flex flex-col gap-3"
                >
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      required
                      disabled={isSubmittingContact}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <textarea
                      name="message"
                      placeholder="How can we help?"
                      rows="3"
                      disabled={isSubmittingContact}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none disabled:opacity-50"
                    ></textarea>
                  </div>
                  <input type="hidden" name="_subject" value="🔹 ClaimSure | Priority Customer Inquiry 🔹" />
                  <input type="hidden" name="Platform" value="ClaimSure Insurance Technologies" />
                  <input type="hidden" name="Status" value="New Secure Inquiry" />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_cc" value="tanishkaagrawal3212@gmail.com,saxenashivam0321@gmail.com" />
                  <input type="hidden" name="_template" value="box" />
                  <input type="hidden" name="_autoresponse" value="Thank you for reaching out to ClaimSure Insurance. We have securely received your query. Our dedicated elite team is reviewing your message and will be in touch with you shortly. This is an automated confirmation." />
                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-sm rounded-lg py-2.5 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {isSubmittingContact ? (
                      <>
                        <span className="h-4 w-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></span>
                        Submitting...
                      </>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/10 pt-8 gap-4">
            <p className="text-xs text-slate-500">
              © 2026 ClaimSure, Inc. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Privacy Policy</a>
              <a href="#" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
