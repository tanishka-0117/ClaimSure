/**
 * Weather Engine
 * - Uses live weather from Open-Meteo when available (no API key required)
 * - Falls back to local defaults/offline simulation when request fails
 */

const WEATHER_CONDITIONS = [
  { code: 800, name: 'Clear Sky', icon: '☀️', severe: false },
  { code: 801, name: 'Few Clouds', icon: '⛅', severe: false },
  { code: 500, name: 'Light Rain', icon: '🌧️', severe: false },
  { code: 202, name: 'Heavy Thunderstorm', icon: '⛈️', severe: true },
  { code: 781, name: 'Tornado', icon: '🌪️', severe: true },
  { code: 762, name: 'Volcanic Ash', icon: '🌋', severe: true },
  { code: 771, name: 'Squalls', icon: '💨', severe: true },
  { code: 901, name: 'Tropical Storm', icon: '🌀', severe: true },
  { code: 232, name: 'Heavy Drizzle Storm', icon: '⛈️', severe: true },
];

const CITY_WEATHER_DEFAULTS = {
  'Delhi': { code: 800, name: 'Clear Sky', icon: '☀️', severe: false },
  'Mumbai': { code: 500, name: 'Light Rain', icon: '🌧️', severe: false },
  'Bengaluru': { code: 801, name: 'Few Clouds', icon: '⛅', severe: false },
  'Chennai': { code: 800, name: 'Clear Sky', icon: '☀️', severe: false },
  'Kolkata': { code: 801, name: 'Few Clouds', icon: '⛅', severe: false },
};

const CITY_COORDS = {
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
};

const CACHE_TTL_MS = 10 * 60 * 1000;

let weatherOverrides = {};
let weatherCache = {};

function mapOpenMeteoCode(code) {
  // Mapping reference: https://open-meteo.com/en/docs
  if (code === 0) return { code: 800, name: 'Clear Sky', icon: '☀️', severe: false };
  if ([1, 2].includes(code)) return { code: 801, name: 'Few Clouds', icon: '⛅', severe: false };
  if (code === 3) return { code: 802, name: 'Cloudy', icon: '☁️', severe: false };
  if ([45, 48].includes(code)) return { code: 741, name: 'Fog', icon: '🌫️', severe: false };
  if ([51, 53, 55, 56, 57].includes(code)) return { code: 300, name: 'Drizzle', icon: '🌦️', severe: false };
  if ([61, 63, 65, 80, 81].includes(code)) return { code: 500, name: 'Rain', icon: '🌧️', severe: false };
  if (code === 82) return { code: 502, name: 'Heavy Rain', icon: '🌧️', severe: true };
  if ([66, 67].includes(code)) return { code: 511, name: 'Freezing Rain', icon: '🌨️', severe: true };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { code: 600, name: 'Snow', icon: '❄️', severe: true };
  if ([95, 96].includes(code)) return { code: 202, name: 'Thunderstorm', icon: '⛈️', severe: true };
  if (code === 99) return { code: 781, name: 'Severe Hail Storm', icon: '🌪️', severe: true };
  return { code: 801, name: 'Few Clouds', icon: '⛅', severe: false };
}

function normalizeCityName(city) {
  return String(city || '').trim();
}

export function getWeatherForCity(city) {
  const normalizedCity = normalizeCityName(city);
  if (weatherOverrides[normalizedCity]) {
    return weatherOverrides[normalizedCity];
  }
  if (weatherCache[normalizedCity]) {
    return weatherCache[normalizedCity].data;
  }
  return CITY_WEATHER_DEFAULTS[normalizedCity] || WEATHER_CONDITIONS[0];
}

export async function fetchLiveWeatherForCity(city, { force = false } = {}) {
  const normalizedCity = normalizeCityName(city);
  if (!normalizedCity) return WEATHER_CONDITIONS[0];

  if (weatherOverrides[normalizedCity]) {
    return weatherOverrides[normalizedCity];
  }

  const cached = weatherCache[normalizedCity];
  const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;
  if (!force && isFresh) {
    return cached.data;
  }

  const coords = CITY_COORDS[normalizedCity];
  if (!coords) {
    return getWeatherForCity(normalizedCity);
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=weather_code,temperature_2m,wind_speed_10m&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather API error ${response.status}`);

    const payload = await response.json();
    const current = payload?.current;
    const mapped = mapOpenMeteoCode(Number(current?.weather_code));

    const liveWeather = {
      ...mapped,
      temperature: Number.isFinite(current?.temperature_2m) ? current.temperature_2m : undefined,
      windSpeed: Number.isFinite(current?.wind_speed_10m) ? current.wind_speed_10m : undefined,
      source: 'live',
      observedAt: current?.time || new Date().toISOString(),
    };

    weatherCache[normalizedCity] = {
      fetchedAt: Date.now(),
      data: liveWeather,
    };

    return liveWeather;
  } catch {
    return getWeatherForCity(normalizedCity);
  }
}

export function setWeatherOverride(city, weatherCode) {
  const normalizedCity = normalizeCityName(city);
  const condition = WEATHER_CONDITIONS.find(w => w.code === weatherCode);
  if (condition) {
    weatherOverrides[normalizedCity] = condition;
  }
}

export function clearWeatherOverrides() {
  weatherOverrides = {};
}

export function triggerSevereWeather(city) {
  const normalizedCity = normalizeCityName(city);
  const severeConditions = WEATHER_CONDITIONS.filter(w => w.severe);
  const random = severeConditions[Math.floor(Math.random() * severeConditions.length)];
  weatherOverrides[normalizedCity] = random;
  return random;
}

export function getAllWeatherConditions() {
  return WEATHER_CONDITIONS;
}

export function getWeatherByCode(code) {
  if (typeof code !== 'number') return null;
  return WEATHER_CONDITIONS.find(w => w.code === code) || null;
}

export function getSevereWeatherConditions() {
  return WEATHER_CONDITIONS.filter(w => w.severe);
}