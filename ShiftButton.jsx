import { Power } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ShiftButton({ isActive, onToggle, isLoading }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Pulse rings when active */}
        {isActive && (
          <>
            <div className="absolute inset-0 rounded-full bg-primary/20 pulse-ring" />
            <div className="absolute inset-0 rounded-full bg-primary/10 pulse-ring" style={{ animationDelay: '0.5s' }} />
          </>
        )}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={onToggle}
          disabled={isLoading}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 35px rgba(59, 130, 246, 0.6), 0 0 60px rgba(6, 182, 212, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '';
          }}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
            isActive
              ? 'bg-primary shadow-[0_0_40px_rgba(59,130,246,0.4)]'
              : 'bg-secondary border-2 border-border hover:border-primary/50'
          }`}
        >
          <Power className={`w-10 h-10 transition-colors duration-300 ${
            isActive ? 'text-primary-foreground' : 'text-muted-foreground'
          }`} />
        </motion.button>
      </div>
      <div className="text-center">
        <p className={`text-sm font-semibold tracking-wide uppercase ${
          isActive ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {isLoading ? 'Processing...' : isActive ? 'On Shift' : 'Start Shift'}
        </p>
        {isActive && (
          <p className="text-xs text-muted-foreground mt-1">
            Coverage active · Tracking every 30s
          </p>
        )}
      </div>
    </div>
  );
}
