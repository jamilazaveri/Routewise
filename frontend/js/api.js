/**
 * Routewise Frontend - API Communication Module
 * Interacts with Spring Boot (http://localhost:8080/api) & FastAPI (http://localhost:8000)
 */

export const API_BASE = "http://localhost:8080/api";
export const PYTHON_API = "http://localhost:8000";

export async function checkServicesHealth() {
  const result = { backend: false, python: false };
  try {
    const res = await fetch(`${API_BASE}/cities`);
    result.backend = res.ok;
  } catch (e) {
    result.backend = false;
  }

  try {
    const res = await fetch(`${PYTHON_API}/health`);
    result.python = res.ok;
  } catch (e) {
    result.python = false;
  }
  return result;
}

export async function planTripApi(payload) {
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
}

export async function reallocateBudgetApi(payload) {
  const res = await fetch(`${API_BASE}/trips/reallocate-budget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    throw new Error(`Reallocation failed: ${res.status}`);
  }
  return await res.json();
}

export async function fetchRouteOptionsApi(tripId) {
  const res = await fetch(`${API_BASE}/trips/routes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tripId })
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch route options: ${res.status}`);
  }
  return await res.json();
}

export async function fetchRouteDetailsApi(tripId, routeType) {
  const res = await fetch(`${API_BASE}/trips/${tripId}/route/${routeType}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch route ${routeType}: ${res.status}`);
  }
  return await res.json();
}

export async function fetchTripBookingsApi(tripId) {
  const res = await fetch(`${API_BASE}/trips/${tripId}/bookings`);
  if (!res.ok) {
    throw new Error(`Failed to fetch bookings for trip ${tripId}`);
  }
  return await res.json();
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
  const res = await fetch(`${API_BASE}/stops/${type}/${id}/booking-options`);
  if (!res.ok) {
    throw new Error(`Failed to fetch booking options for ${type} ${id}`);
  }
  return await res.json();
}

export async function fetchSavedTripsApi() {
  const res = await fetch(`${API_BASE}/trips`);
  if (!res.ok) return [];
  return await res.json();
}

export async function deleteSavedTripApi(tripId) {
  const res = await fetch(`${API_BASE}/trips/${tripId}`, { method: "DELETE" });
  return res.ok;
}

export async function clearTripHistoryApi() {
  const res = await fetch(`${API_BASE}/trips`, { method: "DELETE" });
  return res.ok;
}
