import { Link, useLocation, Outlet } from 'react-router-dom';
import { Shield, LayoutDashboard, Smartphone } from 'lucide-react';

export default function AppLayout() {
  const location = useLocation();
  const isWorker = location.pathname.startsWith('/worker');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Top Nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Claim<span className="text-primary">Sure</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              to="/worker"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isWorker 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Worker</span>
            </Link>
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isAdmin 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
