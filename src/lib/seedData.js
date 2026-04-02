/**
 * Seed data for demo workers
 */

const CITY_COORDS = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
};

export const SEED_WORKERS = [
  {
    workerId: 'W001',
    name: 'Ravi Sharma',
    homeCity: 'Delhi',
    shiftActive: false,
    lastGPS_lat: 28.6139,
    lastGPS_lng: 77.2090,
    lastGPS_city: 'Delhi',
    lastIP: '103.21.58.192',
    isMockLocation: false,
    payoutStatus: 'NONE',
    payoutAmount: 0,
    avatar: 'blue',
    lastActivity: new Date().toISOString(),
  },
  {
    workerId: 'W002',
    name: 'Priya Nair',
    homeCity: 'Mumbai',
    shiftActive: false,
    lastGPS_lat: 19.0760,
    lastGPS_lng: 72.8777,
    lastGPS_city: 'Mumbai',
    lastIP: '49.36.128.45',
    isMockLocation: false,
    payoutStatus: 'NONE',
    payoutAmount: 0,
    avatar: 'purple',
    lastActivity: new Date().toISOString(),
  },
  {
    workerId: 'W003',
    name: 'Arjun Singh',
    homeCity: 'Bengaluru',
    shiftActive: false,
    lastGPS_lat: 12.9716,
    lastGPS_lng: 77.5946,
    lastGPS_city: 'Bengaluru',
    lastIP: '106.51.72.133',
    isMockLocation: false,
    payoutStatus: 'NONE',
    payoutAmount: 0,
    avatar: 'green',
    lastActivity: new Date().toISOString(),
  },
  {
    workerId: 'W004',
    name: 'Fake User 1',
    homeCity: 'Delhi',
    shiftActive: false,
    lastGPS_lat: 19.0823,
    lastGPS_lng: 72.8812,
    lastGPS_city: 'Mumbai',
    lastIP: '182.73.111.222',
    isMockLocation: true,
    payoutStatus: 'NONE',
    payoutAmount: 0,
    avatar: 'red',
  },
  {
    workerId: 'W005',
    name: 'Fake User 2',
    homeCity: 'Chennai',
    shiftActive: false,
    lastGPS_lat: 19.0544,
    lastGPS_lng: 72.8406,
    lastGPS_city: 'Mumbai',
    lastIP: '223.178.44.88',
    isMockLocation: false,
    payoutStatus: 'NONE',
    payoutAmount: 0,
    avatar: 'indigo',
  },
];

export function getCityCoords(city) {
  return CITY_COORDS[city] || { lat: 20.5937, lng: 78.9629 };
}