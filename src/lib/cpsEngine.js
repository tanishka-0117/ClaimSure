/**
 * CPS (Claim Protection Score) Scoring Engine
 * Returns a score from 0-100 based on 4 signals
 */

export function calculateCPS(workerData) {
  let score = 0;
  const signals = {
    ipMatch: false,
    mockLocation: false,
    appActivity: false,
    cityHistory: false,
    ipScore: 0,
    mockScore: 0,
    activityScore: 0,
    cityScore: 0,
  };

  // Signal 1 — IP vs GPS City Match (30 points)
  const ipCity = workerData.ipCity || '';
  const gpsCity = workerData.lastGPS_city || '';
  if (ipCity && gpsCity && ipCity.toLowerCase() === gpsCity.toLowerCase()) {
    score += 30;
    signals.ipMatch = true;
    signals.ipScore = 30;
  }

  // Signal 2 — Device Mock Location Flag (25 points)
  if (!workerData.isMockLocation) {
    score += 25;
    signals.mockLocation = true;
    signals.mockScore = 25;
  }

  // Signal 3 — In-App Activity (25 points)
  if (workerData.lastActivity) {
    const lastActive = new Date(workerData.lastActivity);
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (lastActive > fiveMinAgo) {
      score += 25;
      signals.appActivity = true;
      signals.activityScore = 25;
    }
  }

  // Signal 4 — City History Match (20 points)
  if (workerData.homeCity && gpsCity && 
      workerData.homeCity.toLowerCase() === gpsCity.toLowerCase()) {
    score += 20;
    signals.cityHistory = true;
    signals.cityScore = 20;
  }

  return { score, signals };
}

/**
 * Claims Decision Engine
 */
export function determineClaimStatus(cpsScore) {
  if (cpsScore >= 75) return 'AUTO_APPROVED';
  if (cpsScore >= 50) return 'SOFT_VERIFY';
  return 'FLAGGED';
}

/**
 * Check for Ring Alert pattern
 * Returns true if 3+ claims from same city within 5 minutes
 */
export function checkRingAlert(claims, city) {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentClaims = claims.filter(c => 
    c.city?.toLowerCase() === city.toLowerCase() &&
    new Date(c.created_date) > fiveMinAgo
  );
  return recentClaims.length >= 3;
}

// Extreme weather condition codes from OpenWeatherMap
export const EXTREME_WEATHER_CODES = [900, 901, 902, 781, 762, 771, 232, 202];

export function isExtremeWeather(code) {
  return EXTREME_WEATHER_CODES.includes(code);
}