import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import PublicNavbar from '@/components/claimsure/PublicNavbar';

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
      setError(err.message || 'Unable to login');
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
    <div className="relative min-h-screen overflow-hidden font-inter text-[#f0f0f2]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/okay_but_my_202603282303.png')" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-slate-950/65" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-20 z-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-10 z-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
      <PublicNavbar simplified />

      <main className="relative z-20 mx-auto grid min-h-[calc(100vh-48px)] max-w-5xl place-items-center px-4 py-8">
        <section className="w-full max-w-md rounded-3xl border border-white/20 bg-[#0f172a]/35 p-5 shadow-[0_24px_80px_rgba(5,15,35,0.55)] backdrop-blur-2xl sm:p-6">
          <div className="mb-5 flex gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-1 backdrop-blur">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 rounded-md px-3 py-2 text-xs uppercase tracking-wider ${
                mode === 'login' ? 'bg-cyan-400/20 text-cyan-200 shadow-[0_0_0_1px_rgba(103,232,249,0.25)_inset]' : 'text-slate-300'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-md px-3 py-2 text-xs uppercase tracking-wider ${
                mode === 'signup' ? 'bg-cyan-400/20 text-cyan-200 shadow-[0_0_0_1px_rgba(103,232,249,0.25)_inset]' : 'text-slate-300'
              }`}
            >
              Sign up
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={onLogin} className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#5a5d6a]">Email</label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  className="border-white/20 bg-white/[0.04] text-[#e5edf5] placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#5a5d6a]">Password</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="border-white/20 bg-white/[0.04] text-[#e5edf5] placeholder:text-slate-400"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-cyan-200/30 bg-cyan-300/90 text-slate-950 hover:bg-cyan-200"
              >
                <User className="mr-1.5 h-4 w-4" />
                {isSubmitting ? 'Signing in...' : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={onSignup} className="space-y-3">
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#5a5d6a]">Full name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-white/20 bg-white/[0.04] text-[#e5edf5] placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#5a5d6a]">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-white/20 bg-white/[0.04] text-[#e5edf5] placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-wider text-[#5a5d6a]">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="border-white/20 bg-white/[0.04] text-[#e5edf5] placeholder:text-slate-400"
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full border border-cyan-200/30 bg-cyan-300/90 text-slate-950 hover:bg-cyan-200"
              >
                <UserPlus className="mr-1.5 h-4 w-4" />
                {isSubmitting ? 'Creating account...' : 'Sign up'}
              </Button>
            </form>
          )}

          {error && <p className="mt-3 text-xs text-[#ef4444]">{error}</p>}

          <p className="mt-4 text-xs text-[#5a5d6a]">
            New signups create Worker accounts. Use seeded admin credentials for admin access.
          </p>
        </section>
      </main>
    </div>
  );
}
