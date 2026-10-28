/**
 * Routewise Frontend - API Communication & Caching Module (Phase 3C)
 * Features in-memory caching for route options, details, and city lists,
 * robust network error handling, and offline estimate fallbacks.
 */

export const API_BASE = "http://localhost:8080/api";
export const PYTHON_API = "http://localhost:8000";

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

export async function checkServicesHealth() {
  const result = { backend: false, python: false };
  try {
    const res = await fetch(`${API_BASE}/cities`, { signal: AbortSignal.timeout(3000) });
    result.backend = res.ok;
  } catch (e) {
    result.backend = false;
  }

  try {
    const res = await fetch(`${PYTHON_API}/health`, { signal: AbortSignal.timeout(3000) });
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
      rating: 4.4,
      address: `Central Promenade, ${dest}`,
      amenities: "AC, WiFi, Free Breakfast, Swimming Pool",
      phone: "+91 44 2855 1234"
    },
    recommendedRestaurants: [
      { id: 1, name: `${dest} Spice Pavilion`, cuisineType: "South Indian", approxCostForTwo: 550, rating: 4.5, phone: "+91 44 2498 7654" },
      { id: 2, name: "Coastal Flavours Resto", cuisineType: "Chettinad & Seafood", approxCostForTwo: 700, rating: 4.6, phone: "+91 44 2811 4321" },
      { id: 3, name: "The French Quarter Cafe", cuisineType: "Cafe & Bakery", approxCostForTwo: 450, rating: 4.3, phone: "+91 44 2234 5678" }
    ],
    recommendedAttractions: [
      { id: 1, name: `Historic Seaside Promenade`, category: "Beach / Heritage", entryFee: 0, rating: 4.7, bestTimeToVisit: "Sunrise & Evening" },
      { id: 2, name: `${dest} Royal Temple & Museum`, category: "Culture", entryFee: 50, rating: 4.8, bestTimeToVisit: "Morning 09:00 - 12:00" },
      { id: 3, name: `Lush Botanical Sanctuary`, category: "Nature", entryFee: 30, rating: 4.5, bestTimeToVisit: "15:00 - 17:30" }
    ],
    itinerary: [
      {
        dayNumber: 1,
        dateLabel: "Day 1: Arrival & Coastal Discovery",
        dayTotalCost: Math.round(total / days),
        items: [
          { id: 101, title: `Journey from ${start} to ${dest}`, startTime: "07:00:00", durationMinutes: 240, description: "Scenic highway drive with coffee breaks.", itemType: "travel" },
          { id: 102, title: `Check-in at ${dest} Heritage Grand`, startTime: "12:00:00", durationMinutes: 60, description: "Relax and unpack.", itemType: "hotel_checkin" },
          { id: 103, title: `Lunch at ${dest} Spice Pavilion`, startTime: "13:00:00", durationMinutes: 60, description: "Traditional thali and local delicacies.", itemType: "meal" },
          { id: 104, title: `Historic Seaside Promenade`, startTime: "16:00:00", durationMinutes: 120, description: "Walk along the coastline.", itemType: "attraction" },
          { id: 105, title: `Dinner at Coastal Flavours Resto`, startTime: "20:00:00", durationMinutes: 90, description: "Candlelit seafood dinner.", itemType: "meal" }
        ]
      },
      {
        dayNumber: 2,
        dateLabel: "Day 2: Heritage Landmarks & Culture",
        dayTotalCost: Math.round(total / days),
        items: [
          { id: 201, title: "Breakfast & Fresh Filter Coffee", startTime: "08:30:00", durationMinutes: 45, description: "Crisp dosas and filter kaapi.", itemType: "meal" },
          { id: 202, title: `${dest} Royal Temple & Museum`, startTime: "09:45:00", durationMinutes: 120, description: "Architectural wonders and temple corridors.", itemType: "attraction" },
          { id: 203, title: "Afternoon Cafe Break", startTime: "13:00:00", durationMinutes: 60, description: "Artisan pastries and cool refreshments.", itemType: "meal" },
          { id: 204, title: `Lush Botanical Sanctuary`, startTime: "15:00:00", durationMinutes: 90, description: "Shaded exotic plant walkways.", itemType: "attraction" },
          { id: 205, title: `Return Journey to ${start}`, startTime: "17:30:00", durationMinutes: 240, description: "Conclude road trip with cherished memories.", itemType: "travel" }
        ]
      }
    ]
  };
}

export async function planTripApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/trips/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: "Server error" }));
      throw new Error(errData.message || `Failed with status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn("Backend unavailable for planTripApi, providing estimate fallback:", err.message);
    return generateOfflineEstimatePlan(payload);
  }
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
