import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function AppHeader({ 
  user, 
  title, 
  onRefresh = null, 
  syncStatus = 'online', 
  isSyncing = false,
  showSync = true 
}) {
  const shortName = (user?.name || 'User').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="sticky top-0 z-40 w-full pt-2 pb-2 px-3 sm:px-5 pointer-events-none">
      <div className="mx-auto max-w-full pointer-events-auto">
        <div className="flex h-12 items-center justify-between rounded-2xl border border-white/10 bg-black/92 px-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Brand & Title */}
          <div className="flex items-center gap-4">
            <Logo iconOnly />
            <div className="h-6 w-px bg-white/10 mx-1" />
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-tight text-white sm:text-sm">
                {title || 'Dashboard'}
              </span>
              {showSync && (
                <div className="hidden items-center gap-1.5 md:flex">
                  <span className={`h-1 w-1 rounded-full ${syncStatus === 'online' ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]' : 'bg-slate-500'}`} />
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">
                    {syncStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-4 md:flex pr-2 border-r border-white/10 mr-1">
               <NotificationBell />
            </div>

            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="ghost"
                size="sm"
                className="h-8 rounded-lg border border-white/5 bg-white/5 px-2.5 text-[10px] uppercase tracking-wider text-slate-300 transition-all hover:bg-white/10"
              >
                <RefreshCw className={`mr-1.5 h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}

            <div className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 px-2.5 py-1.5 transition-all hover:bg-white/10">
              <div className="grid h-5 w-5 place-items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[9px] font-bold text-cyan-400">
                {shortName}
              </div>
              <span className="hidden text-xs font-medium text-slate-200 sm:block">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
