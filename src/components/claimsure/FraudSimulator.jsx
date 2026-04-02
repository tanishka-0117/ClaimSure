import { useState } from 'react';
import { Bug, CloudLightning, PlayCircle, Radar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function FraudSimulator({ workers, onSimulateFraud, onTriggerWeather, onRunDemoSequence }) {
  const dynamicCities = [...new Set((workers || []).map((w) => w.lastGPS_city || w.homeCity).filter(Boolean))];
  const cityOptions = dynamicCities.length > 0 ? dynamicCities : ['Mumbai'];

  const [selectedCity, setSelectedCity] = useState(cityOptions[0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [statusLabel, setStatusLabel] = useState('Idle');

  const activeInCity = (workers || []).filter(
    (w) => (w.lastGPS_city || w.homeCity) === selectedCity && w.shiftActive
  ).length;

  const handleFraud = async () => {
    setIsSimulating(true);
    setStatusLabel(`Running fraud simulation for ${selectedCity}`);
    await onSimulateFraud(selectedCity);
    setStatusLabel('Fraud simulation completed');
    setTimeout(() => setIsSimulating(false), 1000);
  };

  const handleWeather = async () => {
    setIsSimulating(true);
    setStatusLabel(`Triggering storm for ${selectedCity}`);
    await onTriggerWeather(selectedCity);
    setStatusLabel('Storm simulation completed');
    setTimeout(() => setIsSimulating(false), 1000);
  };

  const handleFullDemo = async () => {
    setIsSimulating(true);
    setStatusLabel(`Running full demo sequence for ${selectedCity}`);
    if (onRunDemoSequence) {
      await onRunDemoSequence(selectedCity);
    } else {
      await onTriggerWeather(selectedCity);
      await onSimulateFraud(selectedCity);
    }
    setStatusLabel('Full demo completed');
    setTimeout(() => setIsSimulating(false), 1000);
  };

  return (
    <div className="relative overflow-hidden space-y-3 rounded-xl border border-[#1e2025] bg-[#0f1012] p-4">
      {isSimulating && (
        <div className="pointer-events-none absolute inset-0 z-50">
          <div className="absolute inset-0 bg-[#06b6d4]/5 animate-pulse" />
          <div className="absolute top-0 h-[2px] w-full bg-[#06b6d4] shadow-[0_0_15px_#06b6d4] animate-[scan_2s_linear_infinite]" />
        </div>
      )}

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>

      <div className="flex items-center gap-2">
        <Radar className={`h-4 w-4 ${isSimulating ? 'text-[#ef4444] animate-spin' : 'text-[#06b6d4]'}`} />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#f0f0f2]">Simulation Control</h3>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-[#1e2025] bg-[#141618] px-3 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5a5d6a]">active assets</p>
          <p className="mt-1 text-sm font-mono text-[#f0f0f2]">{activeInCity} nodes</p>
        </div>
        <div className="rounded-lg border border-[#1e2025] bg-[#141618] px-3 py-2">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5a5d6a]">signal status</p>
          <p className="mt-1 truncate text-xs font-mono text-[#06b6d4]">{statusLabel.toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-2">
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="h-9 flex-1 border-[#252830] bg-[#141618] text-xs font-mono">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleFullDemo}
            disabled={isSimulating}
            className="h-9 gap-1.5 bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] text-xs font-bold text-white hover:opacity-90 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Launch Demo
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleFraud}
            disabled={isSimulating}
            variant="outline"
            className="h-9 gap-2 border-[#252830] bg-[#141618] text-[10px] font-bold uppercase hover:bg-[#1a1d21] text-[#f0f0f2]"
          >
            <Bug className="h-3.5 w-3.5 text-red-500" />
            Sim Fraud
          </Button>

          <Button
            onClick={handleWeather}
            disabled={isSimulating}
            variant="outline"
            className="h-9 gap-2 border-[#252830] bg-[#141618] text-[10px] font-bold uppercase hover:bg-[#1a1d21] text-[#f0f0f2]"
          >
            <CloudLightning className="h-3.5 w-3.5 text-[#06b6d4]" />
            Sim Storm
          </Button>
        </div>
      </div>
    </div>
  );

}
