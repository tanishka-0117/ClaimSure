import { RefreshCw, LogOut, User, Settings, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';
import Logo from './Logo';
import { useAuth } from '@/lib/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export default function AppHeader({ 
  user, 
  title, 
  onRefresh = null, 
  syncStatus = 'online', 
  isSyncing = false,
  showSync = true 
}) {
  const { logout } = useAuth();
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div role="button" className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/5 px-2.5 py-1.5 transition-all hover:bg-white/10 cursor-pointer outline-none">
                  <div className="grid h-5 w-5 place-items-center rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[9px] font-bold text-cyan-400">
                    {shortName}
                  </div>
                  <span className="hidden text-xs font-medium text-slate-200 sm:block">
                    {user?.name || 'User'}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0f1012] border-[#1e2025] text-slate-200 shadow-2xl">
                <DropdownMenuLabel className="font-normal py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-100">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-slate-500 font-mono mt-1">{user?.workerId || user?.email || 'ID: UNKNOWN'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="cursor-pointer focus:bg-white/5 focus:text-cyan-400 py-2">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile details</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-white/5 focus:text-cyan-400 py-2">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer focus:bg-white/5 focus:text-cyan-400 py-2">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-400 py-2">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
