import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

const statusIcon = { AUTO_APPROVED: CheckCircle, FLAGGED: AlertTriangle, SOFT_VERIFY: Clock };
const statusColor = { AUTO_APPROVED: 'text-green-400', FLAGGED: 'text-cyan-400', SOFT_VERIFY: 'text-cyan-400' };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    // Load recent claims as notifications
    base44.entities.Claim.list('-created_date', 15).then(claims => {
      setNotifications(claims);
      setUnread(Math.min(claims.length, 5));
    });

    // Real-time updates
    const unsub = base44.entities.Claim.subscribe((event) => {
      if (event.type === 'create') {
        setNotifications(prev => [event.data, ...prev].slice(0, 20));
        setUnread(prev => prev + 1);
      }
    });
    return unsub;
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) setUnread(0);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center hover:bg-accent/10 transition-colors"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-11 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold">Notifications</h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-muted-foreground text-center">No notifications yet</p>
                ) : (
                  notifications.map(n => {
                    const Icon = statusIcon[n.status] || AlertTriangle;
                    const color = statusColor[n.status] || 'text-cyan-400';
                    return (
                      <div key={n.id} className="flex items-start gap-2.5 p-3 hover:bg-secondary/50 border-b border-border/50 transition-colors">
                        <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{n.workerName} — {n.city}</p>
                          <p className="text-[10px] text-muted-foreground">
                            CPS {n.cpsScore} · {n.status?.replace('_', ' ')}
                          </p>
                        </div>
                        <p className="text-[9px] text-muted-foreground flex-shrink-0">
                          {moment(n.created_date).fromNow(true)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
