/**
 * Routewise Frontend - API Communication & Caching Module (Phase 3C)
 * Features in-memory caching for route options, details, and city lists,
 * robust network error handling, and offline estimate fallbacks.
 */

import { API_BASE, API_BASE_URL, PYTHON_API, PYTHON_SERVICE_URL } from './config.js';
export { API_BASE, API_BASE_URL, PYTHON_API, PYTHON_SERVICE_URL };

// In-Memory API Response Cache
const apiCache = new Map();

function getCached(key, maxAgeMs = 5 * 60 * 1000) {
  const item = apiCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > maxAgeMs) {
    apiCache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  apiCache.set(key, { data, timestamp: Date.now() });
}

export function pingServicesOnLoad() {
  try {
    fetch(`${API_BASE_URL}/health`, { mode: 'cors' }).catch(() => {});
    fetch(`${PYTHON_SERVICE_URL}/health`, { mode: 'cors' }).catch(() => {});
  } catch (e) {}
}

export async function checkServicesHealth() {
  const result = { backend: false, python: false };
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(4000) });
    result.backend = res.ok;
  } catch (e) {
    try {
      const resFallback = await fetch(`${API_BASE}/cities`, { signal: AbortSignal.timeout(3000) });
      result.backend = resFallback.ok;
    } catch (e2) {
      result.backend = false;
    }
  }

  try {
    const res = await fetch(`${PYTHON_SERVICE_URL}/health`, { signal: AbortSignal.timeout(4000) });
    result.python = res.ok;
  } catch (e) {
    result.python = false;
  }
  return result;
}

/**
 * Fallback generator when backend services are temporarily unreachable
 */
export function generateOfflineEstimatePlan(payload) {
  const start = payload.startCity || "Bengaluru";
  const dest = payload.destinationCity || "Chennai";
  const days = payload.numDays || 2;
  const travellers = payload.numTravellers || 2;
  const budgetMax = payload.totalBudgetMax || 18000;
  const budgetMin = payload.totalBudgetMin || 12000;

  // Estimates
  const accommodation = Math.round(budgetMax * 0.35);
  const food = Math.round(budgetMax * 0.25);
  const fuel = Math.round(budgetMax * 0.15);
  const tolls = Math.round(budgetMax * 0.05);
  const sightseeing = Math.round(budgetMax * 0.10);
  const total = accommodation + food + fuel + tolls + sightseeing;

  // Real Landmark lookup from cached Wikimedia database
  let realAttrs = [];
  if (typeof window !== 'undefined' && window.ATTRACTION_IMAGES) {
    const dLower = dest.toLowerCase();
    realAttrs = Object.values(window.ATTRACTION_IMAGES).filter(a => (a.city || '').toLowerCase().includes(dLower));
  }

  const attractions = realAttrs.length > 0 ? realAttrs.slice(0, 5).map((a, i) => ({
    id: i + 1,
    name: a.name,
    category: a.category || "Heritage",
    entryFee: a.entryFee || 0,
    rating: a.rating || 4.7,
    latitude: a.lat,
    longitude: a.lng,
    bestTimeToVisit: a.bestTime || "Morning & Sunset",
    openingHours: a.hours || "06:00 - 21:00",
    description: a.desc
  })) : [
    { id: 1, name: `Historic Seaside Promenade`, category: "Beach / Heritage", entryFee: 0, rating: 4.7, bestTimeToVisit: "Sunrise & Evening" },
    { id: 2, name: `${dest} Royal Temple & Museum`, category: "Culture", entryFee: 50, rating: 4.8, bestTimeToVisit: "Morning 09:00 - 12:00" },
    { id: 3, name: `Lush Botanical Sanctuary`, category: "Nature", entryFee: 30, rating: 4.5, bestTimeToVisit: "15:00 - 17:30" }
  ];

  const attr1Name = attractions[0] ? attractions[0].name : "Scenic Promenade";
  const attr2Name = attractions[1] ? attractions[1].name : "Royal Heritage Temple";

  return {
    tripId: 9999,
    tripName: `${days}-Day Journey to ${dest} (Offline Estimate)`,
    startCity: start,
    destinationCity: dest,
    numDays: days,
    numTravellers: travellers,
    transportMode: payload.transportMode || "car",
    totalBudgetMin: budgetMin,
    totalBudgetMax: budgetMax,
    totalEstimatedCost: total,
    isFeasible: total <= budgetMax,
    statusMessage: "Estimated offline preview mode. Reconnect backend for live database booking sync.",
    isFallbackEstimate: true,
    costBreakdown: {
      accommodation,
      food,
      fuel,
      tolls,
      sightseeing,
      misc: Math.max(0, budgetMax - total),
      total,
      budgetMax
    },
    selectedHotel: {
      id: 1,
      name: `${dest} Heritage Grand Hotel`,
      tier: "Mid-Range",
      pricePerNight: Math.round(accommodation / days),
      rating: 4.5,
      address: `Central Heritage Enclave, ${dest}`,
      amenities: "AC, High-speed WiFi, Complimentary Breakfast, Pool",
      phone: "+91 44 2855 1234"
    },
    recommendedRestaurants: [
      { id: 1, name: `${dest} Traditional Spice Pavilion`, cuisineType: "Authentic South Indian", approxCostForTwo: 550, rating: 4.6, phone: "+91 44 2498 7654" },
      { id: 2, name: "Coastal Flavours Resto & Cafe", cuisineType: "Chettinad & Seafood", approxCostForTwo: 700, rating: 4.6, phone: "+91 44 2811 4321" },
      { id: 3, name: "Heritage Bakehouse & Filter Coffee", cuisineType: "Cafe & Artisan Bakery", approxCostForTwo: 450, rating: 4.4, phone: "+91 44 2234 5678" }
    ],
    recommendedAttractions: attractions,
    itinerary: [
      {
        dayNumber: 1,
        dateLabel: "Day 1: Arrival & Historic Coastal Exploration",
        dayTotalCost: Math.round(total / days),
        items: [
          { id: 101, title: `Road Journey from ${start} to ${dest}`, startTime: "07:00:00", durationMinutes: 240, description: "Scenic highway drive with coffee breaks.", itemType: "travel" },
          { id: 102, title: `Check-in at ${dest} Heritage Grand Hotel`, startTime: "12:00:00", durationMinutes: 60, description: "Unpack, refresh, and settle in.", itemType: "hotel_checkin" },
          { id: 103, title: `Lunch at ${dest} Traditional Spice Pavilion`, startTime: "13:00:00", durationMinutes: 60, description: "Traditional plantain-leaf feast.", itemType: "meal" },
          { id: 104, title: attr1Name, startTime: "16:00:00", durationMinutes: 120, description: "Explore iconic architecture and scenic pathways.", itemType: "attraction" },
          { id: 105, title: `Dinner at Coastal Flavours Resto & Cafe`, startTime: "20:00:00", durationMinutes: 90, description: "Regional specialties and fresh catch.", itemType: "meal" }
        ]
      },
      {
        dayNumber: 2,
        dateLabel: "Day 2: Cultural Landmarks & Scenic Return",
        dayTotalCost: Math.round(total / days),
        items: [
          { id: 201, title: "Breakfast & Fresh Filter Kaapi", startTime: "08:30:00", durationMinutes: 45, description: "Ghee roast dosas and South Indian filter coffee.", itemType: "meal" },
          { id: 202, title: attr2Name, startTime: "09:45:00", durationMinutes: 120, description: "Cultural immersion and photography.", itemType: "attraction" },
          { id: 203, title: "Afternoon Cafe Break", startTime: "13:00:00", durationMinutes: 60, description: "Light artisan bites and fresh coolers.", itemType: "meal" },
          { id: 204, title: `Return Journey to ${start}`, startTime: "16:30:00", durationMinutes: 240, description: "Comfortable drive back concluding the expedition.", itemType: "travel" }
        ]
      }
    ]
  };
}

export async function planTripApi(payload, onProgress) {
  const startTime = Date.now();
  const maxWaitMs = 60000; // Retry up to 60 seconds for Render free tier cold-start
  let attempt = 0;

  while (Date.now() - startTime < maxWaitMs) {
    attempt++;
    const elapsedSec = Math.round((Date.now() - startTime) / 1000);
    if (elapsedSec >= 4 && onProgress) {
      onProgress({ isColdStarting: true, elapsedSeconds: elapsedSec });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000); // 18s per attempt

      const res = await fetch(`${API_BASE}/trips/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return await res.json();
      }

      // If server returned 502/503 (Render waking up gateway error), wait and retry
      if (res.status === 502 || res.status === 503 || res.status === 504) {
        console.warn(`Render server waking up (HTTP ${res.status}), retrying in 2.5s...`);
        await new Promise(r => setTimeout(r, 2500));
        continue;
      }

      const errData = await res.json().catch(() => ({ message: "Server error" }));
      throw new Error(errData.message || `Failed with status ${res.status}`);
    } catch (err) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      if (elapsed >= 55) {
        console.warn("Server cold start exceeded 55s, switching to instant offline estimate:", err.message);
        break;
      }
      if (err.name === 'AbortError' || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        console.warn(`Attempt ${attempt} connection pending (${elapsed}s elapsed), retrying...`);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      throw err;
    }
  }

  // Graceful fallback if cloud service is cold or unreachable
  return generateOfflineEstimatePlan(payload);
}

export async function reallocateBudgetApi(payload) {
  const cacheKey = `realloc_${JSON.stringify(payload)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/trips/reallocate-budget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Reallocation failed: ${res.status}`);
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    console.warn("Backend unavailable for reallocateBudgetApi:", err.message);
    const shares = payload.shares || {};
    const total = payload.totalBudgetMax || 18000;
    return {
      totalBudgetMax: total,
      accommodation: (shares.accommodation || 35) * total / 100,
      food: (shares.food || 25) * total / 100,
      transport: (shares.transport || 20) * total / 100,
      sightseeing: (shares.sightseeing || 20) * total / 100
    };
  }
}

export async function fetchRouteOptionsApi(tripId) {
  const cacheKey = `routes_${tripId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/trips/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId })
    });
    if (!res.ok) throw new Error(`Failed to fetch route options: ${res.status}`);
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  } catch (err) {
    console.warn("Route API unavailable, falling back to simulated route styles:", err.message);
    return {
      tripId,
      routes: {
        fastest: { routeType: "fastest", tag: "Fastest Travel Time", totalDistanceKm: 348.5, totalTimeMins: 320, totalCost: 2840, scenicScore: 0.52 },
        shortest: { routeType: "shortest", tag: "Shortest Physical Path", totalDistanceKm: 334.2, totalTimeMins: 365, totalCost: 2720, scenicScore: 0.48 },
        cheapest: { routeType: "cheapest", tag: "Minimum Fuel & Tolls", totalDistanceKm: 342.0, totalTimeMins: 340, totalCost: 2510, scenicScore: 0.56 },
        scenic: { routeType: "scenic", tag: "Coastal & Heritage Byways", totalDistanceKm: 388.4, totalTimeMins: 410, totalCost: 3190, scenicScore: 0.91 },
        easiest: { routeType: "easiest", tag: "Expressway with Fewest Turns", totalDistanceKm: 355.0, totalTimeMins: 330, totalCost: 2950, scenicScore: 0.60 }
      }
    };
  }
}

export async function fetchRouteDetailsApi(tripId, routeType) {
  const cacheKey = `route_detail_${tripId}_${routeType}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/route/${routeType}`);
    if (!res.ok) throw new Error(`Failed to fetch route ${routeType}: ${res.status}`);
    const data = await res.json();
    setCached(cacheKey, data);
    return data;
  } catch (e) {
    return null;
  }
}

export async function fetchTripBookingsApi(tripId) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}/bookings`);
    if (!res.ok) throw new Error(`Failed to fetch bookings for trip ${tripId}`);
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function updateTripBookingStatusApi(tripId, stopId, payload) {
  const res = await fetch(`${API_BASE}/trips/${tripId}/bookings/${stopId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Failed to update booking status for stop ${stopId}`);
  }
  return await res.json();
}

export async function fetchStopBookingOptionsApi(type, id) {
  const cacheKey = `booking_opts_${type}_${id}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/stops/${type}/${id}/booking-options`);
  if (!res.ok) {
    throw new Error(`Failed to fetch booking options for ${type} ${id}`);
  }
  const data = await res.json();
  setCached(cacheKey, data);
  return data;
}

export async function fetchSavedTripsApi() {
  try {
    const res = await fetch(`${API_BASE}/trips`);
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export async function deleteSavedTripApi(tripId) {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}`, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function clearTripHistoryApi() {
  try {
    const res = await fetch(`${API_BASE}/trips`, { method: "DELETE" });
    return res.ok;
  } catch (e) {
    return false;
  }
}
