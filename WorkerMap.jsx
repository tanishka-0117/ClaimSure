import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
  AUTO_APPROVED: '#06b6d4',
  SOFT_VERIFY: '#3b82f6',
  FLAGGED: '#fbbf24',
  DENIED: '#ef4444',
  NONE: '#6366f1',
};

const STATUS_LABELS = {
  AUTO_APPROVED: 'Auto-Approved',
  SOFT_VERIFY: 'Soft Verify',
  FLAGGED: 'Flagged',
  DENIED: 'Denied',
  NONE: 'Inactive/Stable',
};

function getWorkerStatus(worker, claims) {
  const workerClaims = claims.filter(c => c.workerId === worker.workerId);
  if (workerClaims.length === 0) return 'NONE';
  return workerClaims[workerClaims.length - 1].status;
}

const mapPulseCss = `
  @keyframes radar-pulse {
    0% { transform: scale(0.95); opacity: 0.7; }
    50% { transform: scale(1.4); opacity: 0.3; }
    100% { transform: scale(1.8); opacity: 0; }
  }
  .radar-pulse-ring {
    animation: radar-pulse 2s infinite ease-out;
    pointer-events: none;
  }
`;


function MapBounds({ workers }) {
  const map = useMap();
  useEffect(() => {
    const active = workers.filter(w => w.lastGPS_lat && w.lastGPS_lng);
    if (active.length > 0) {
      const bounds = active.map(w => [w.lastGPS_lat, w.lastGPS_lng]);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
    }
  }, [workers, map]);
  return null;
}

export default function WorkerMap({ workers, claims }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 z-0 bg-[#08090a]">
      <style>{mapPulseCss}</style>

      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB'
        />
        <MapBounds workers={workers} />
        {workers.map(worker => {
          if (!worker.lastGPS_lat || !worker.lastGPS_lng) return null;
          const status = getWorkerStatus(worker, claims);
          const color = STATUS_COLORS[status] || STATUS_COLORS.NONE;
          
          return (
            <div key={worker.id || worker.workerId}>
              {worker.shiftActive && (
                <CircleMarker
                  center={[worker.lastGPS_lat, worker.lastGPS_lng]}
                  radius={25}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.15,
                    color: 'transparent',
                    className: 'radar-pulse-ring'
                  }}
                />
              )}
              <CircleMarker
                center={[worker.lastGPS_lat, worker.lastGPS_lng]}
                radius={worker.shiftActive ? 12 : 8}
                fillColor={color}
                color={worker.shiftActive ? '#ffffff' : color}
                weight={worker.shiftActive ? 2 : 1}
                opacity={1}
                fillOpacity={0.8}
                pathOptions={{
                  className: worker.shiftActive ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''
                }}
              >
                <Tooltip 
                  permanent={worker.shiftActive} 
                  direction="top" 
                  offset={[0, -10]}
                  className="custom-map-label"
                >
                  <div className="flex items-center gap-2 px-1 py-0.5">
                    <span className={`h-1.5 w-1.5 rounded-full`} style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tighter">
                      {worker.name.split(' ')[0]}
                    </span>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="space-y-1 font-inter text-xs" style={{ color: '#0f1729' }}>
                    <p className="text-sm font-bold">{worker.name}</p>
                    <p className="opacity-80">{worker.lastGPS_city} · {worker.shiftActive ? 'ON SHIFT' : 'OFFLINE'}</p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="font-semibold" style={{ color }}>{STATUS_LABELS[status]}</span>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            </div>
          );

        })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-white/10 bg-black/80 p-3 backdrop-blur-md shadow-2xl">
        <p className="mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-500">Risk Intelligence Legend</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(STATUS_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-slate-300 font-medium whitespace-nowrap">{STATUS_LABELS[key]}</span>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        .custom-map-label {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: rgba(255, 255, 255, 0.95);
        }
      `}</style>
    </div>
  );
}
