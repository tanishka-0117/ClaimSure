import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import PublicNavbar from '@/components/claimsure/PublicNavbar';

// Modern input field styled exactly to StitchMCP specs (bottom border, glass focus)
const InputField = ({ label, type, value, onChange, minLength }) => (
  <div className="group relative pt-4">
    <label className="absolute top-0 left-0 text-[10px] uppercase font-bold tracking-[0.05em] text-[#00e5ff] transition-all group-focus-within:text-[#c3f5ff]">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required
      minLength={minLength}
      className="w-full bg-transparent border-b border-[#3b494c] py-2 text-[#e5e2e3] text-sm placeholder:text-[#849396] focus:outline-none focus:border-[#c3f5ff] focus:bg-[#c3f5ff]/5 transition-all outline-none rounded-none"
    />
  </div>
);

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const redirectPath = location.state?.from || '/worker';

  const [mode, setMode] = useState('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(loginEmail, loginPassword);
      if (redirectPath && redirectPath !== '/auth') {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(user?.role === 'admin' ? '/admin' : '/worker', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Unable to log in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await signup({ name, email, password });
      navigate(user?.role === 'admin' ? '/admin' : '/worker', { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to create account');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden font-inter text-[#e5e2e3] bg-[#131314]">
      {/* Dynamic Background from generate_image tool */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: "url('/images/auth_bg.png')" }}
      />
      
      {/* Tonal Depth Layers as prescribed by StitchMCP's Digital Obsidian */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-[#131314]/90 via-[#1c1b1c]/80 to-[#0e0e0f]/95 mix-blend-multiply" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 z-10 h-96 w-96 rounded-full bg-[#00daf3]/10 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 z-10 h-80 w-80 rounded-full bg-blue-500/10 blur-[80px]" />

      <PublicNavbar simplified />

      <main className="relative z-20 mx-auto grid min-h-[calc(100vh-48px)] max-w-5xl place-items-center px-4 py-8">
        {/*
          StitchMCP Requirements applied:
          - Surface container high (#2a2a2b) at 60% opacity with 20px base blur.
          - Ambient occlusion shadow (rgba 229, 226, 227 at 4%) instead of flat dropshadows.
          - Glass interaction: increase blur from 20px to 40px on hover.
          - Ghost border fallback using outline-variant (#3b494c) mixed in.
        */}
        <section className="group w-full max-w-md mt-16 md:mt-24 rounded-2xl bg-[#2a2a2b]/60 p-8 pt-10 ring-1 ring-[#3b494c]/30 shadow-[0_24px_48px_rgba(229,226,227,0.04)] backdrop-blur-[20px] transition-all duration-700 hover:backdrop-blur-[40px] hover:shadow-[0_32px_56px_rgba(229,226,227,0.06)] relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00e5ff]/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-light tracking-wide text-white">
              {mode === 'login' ? 'Authentication.' : 'Registration.'}
            </h1>
          </div>

          <div className="mb-8 flex gap-2 rounded-xl bg-[#0e0e0f]/80 p-1.5 shadow-inner">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                mode === 'login' 
                  ? 'bg-gradient-to-r from-[#c3f5ff]/20 to-[#00e5ff]/10 text-[#c3f5ff] shadow-[0_0_0_1px_rgba(0,229,255,0.3)_inset] backdrop-blur-md' 
                  : 'text-[#849396] hover:text-[#e5e2e3] hover:bg-white/5'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                mode === 'signup' 
                  ? 'bg-gradient-to-r from-[#c3f5ff]/20 to-[#00e5ff]/10 text-[#c3f5ff] shadow-[0_0_0_1px_rgba(0,229,255,0.3)_inset] backdrop-blur-md' 
                  : 'text-[#849396] hover:text-[#e5e2e3] hover:bg-white/5'
              }`}
            >
              Register Worker
            </button>
          </div>

          <div className="relative">
            {mode === 'login' ? (
              <form onSubmit={onLogin} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <InputField
                  label="Registered Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                
                <InputField
                  label="Secure Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />

                {/* Primary Threshold Button matching StitchMCP's "Glass & Gradient" rule */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[0.375rem] bg-gradient-to-br from-[#c3f5ff] to-[#00e5ff] text-[#00363d] font-bold tracking-wide transition-all duration-300 shadow-[0_4px_14px_rgba(0,229,255,0.3)] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,229,255,0.4)] disabled:opacity-70 disabled:hover:scale-100"
                >
                  <User className="h-4 w-4" />
                  {isSubmitting ? 'Authenticating Object...' : 'Initialize Session'}
                </button>
              </form>
            ) : (
              <form onSubmit={onSignup} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <InputField
                  label="Full Authorized Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                
                <InputField
                  label="Origin Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
                <InputField
                  label="Cryptographic Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[0.375rem] bg-gradient-to-br from-[#c3f5ff] to-[#00e5ff] text-[#00363d] font-bold tracking-wide transition-all duration-300 shadow-[0_4px_14px_rgba(0,229,255,0.3)] hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(0,229,255,0.4)] disabled:opacity-70 disabled:hover:scale-100"
                >
                  <UserPlus className="h-4 w-4" />
                  {isSubmitting ? 'Synthesizing Profile...' : 'Create Worker Profile'}
                </button>
              </form>
            )}
          </div>

          {error && (
            <div className="mt-6 flex items-center justify-center rounded bg-[#93000a]/20 py-2 px-3 border border-[#ffb4ab]/30">
              <p className="text-xs text-[#ffb4ab] uppercase tracking-wider font-semibold text-center">{error}</p>
            </div>
          )}

          <div className="mt-8 border-t border-[#3b494c]/30 pt-6 text-center">
            <p className="mb-3 text-[10px] sm:text-xs text-[#3b494c] uppercase tracking-widest font-semibold">
              New signups create default Worker tokens.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginEmail('admin@claimsure.com');
              }}
              className="mt-2 text-[10px] sm:text-xs font-bold text-[#00daf3] hover:text-[#c3f5ff] transition-colors uppercase tracking-wider underline decoration-[#00daf3]/30 underline-offset-4 shadow-[0_0_15px_rgba(0,218,243,0.15)] bg-[#00daf3]/5 px-3 py-1.5 rounded-full"
            >
              System Admin? Prefill Email
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
