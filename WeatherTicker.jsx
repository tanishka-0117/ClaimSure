import { useState, useEffect } from 'react';
import { fetchLiveWeatherForCity, getWeatherForCity } from '../../lib/weatherEngine';

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata'];

export default function WeatherTicker() {
  const [weatherData, setWeatherData] = useState(() =>
    CITIES.map((city) => ({
      city,
      ...getWeatherForCity(city),
    }))
  );

  useEffect(() => {
    let cancelled = false;

    const loadLiveWeather = async (force = false) => {
      const next = await Promise.all(
        CITIES.map(async (city) => ({
          city,
          ...(await fetchLiveWeatherForCity(city, { force })),
        }))
      );

      if (!cancelled) {
        setWeatherData(next);
      }
    };

    loadLiveWeather(true);

    const interval = setInterval(() => {
      loadLiveWeather(false);
    }, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-hidden">
      {weatherData.map((w, i) => (
        <div
          key={w.city}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all duration-300 ${
            w.severe ? 'bg-red-500/10 border border-red-500/20' : 'bg-secondary/50'
          }`}
        >
          <span className="text-sm">{w.icon}</span>
          <span className="text-xs text-muted-foreground">{w.city}</span>
          {w.severe && (
            <span className="text-[9px] font-bold text-red-400 uppercase">SEVERE</span>
          )}
        </div>
      ))}
    </div>
  );
}
