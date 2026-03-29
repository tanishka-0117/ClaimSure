import { MapPin, Wifi, Cloud, Activity } from 'lucide-react';
import { getWeatherForCity } from '../../lib/weatherEngine';

export default function WorkerStatusCard({ worker }) {
  const weather = getWeatherForCity(worker?.lastGPS_city || worker?.homeCity);

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      {/* Worker Identity */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border border-[#0891b2]/30 bg-[#06b6d4]/10 flex items-center justify-center">
          <span className="text-lg font-bold text-[#06b6d4]">
            {worker?.name?.charAt(0) || 'W'}
          </span>
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{worker?.name || 'Worker'}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {worker?.lastGPS_city || worker?.homeCity || 'Unknown'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${worker?.shiftActive ? 'bg-[#06b6d4] shadow-[0_0_8px_rgba(6,182,212,0.5)]' : 'bg-[#252830]'}`} />
          <span className={`text-xs ${worker?.shiftActive ? 'text-[#06b6d4]' : 'text-[#5a5d6a]'}`}>
            {worker?.shiftActive ? 'Active' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <Cloud className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs font-medium">{weather?.icon} {weather?.name?.split(' ')[0]}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <Wifi className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs font-medium">{worker?.lastIP ? 'Connected' : 'No IP'}</p>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2.5 text-center">
          <Activity className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs font-medium">
            {worker?.isMockLocation ? '⚠️ Mock' : '✓ Real'}
          </p>
        </div>
      </div>
    </div>
  );
}
