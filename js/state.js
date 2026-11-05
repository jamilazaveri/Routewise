/**
 * Routewise Frontend - State Management Module
 */

function getSafeTheme() {
  try {
    return localStorage.getItem('routewise_theme') || 'light';
  } catch (e) {
    return 'light';
  }
}

export const state = {
  theme: getSafeTheme(),
  
  wizard: {
    currentStep: 1,
    startCity: 'Chennai',
    destinationCity: 'Pondicherry',
    startDate: '',
    numDays: 2,
    numTravellers: 2,
    transportMode: 'car',
    totalBudgetMax: 18000,
    totalBudgetMin: 12600,
    shares: {
      accommodation: 35,
      food: 25,
      transport: 20,
      sightseeing: 20
    }
  },

  cities: [
    { name: 'Chennai', state: 'Tamil Nadu', code: 'TN', icon: 'building-2', lat: 13.0827, lng: 80.2707 },
    { name: 'Bengaluru', state: 'Karnataka', code: 'KA', icon: 'trees', lat: 12.9716, lng: 77.5946 },
    { name: 'Pondicherry', state: 'Puducherry', code: 'PY', icon: 'waves', lat: 11.9416, lng: 79.8083 },
    { name: 'Madurai', state: 'Tamil Nadu', code: 'TN', icon: 'landmark', lat: 9.9252, lng: 78.1198 },
    { name: 'Coimbatore', state: 'Tamil Nadu', code: 'TN', icon: 'mountain', lat: 11.0168, lng: 76.9558 }
  ],

  // Active Plan & Route Data
  currentPlan: null,
  currentTripId: null,
  currentRouteOptions: [],
  currentRouteType: 'fastest',
  currentChecklist: [],
  
  // Leaflet references
  leafletMap: null,
  mapMarkers: [],
  mapPolyline: null
};

// Set theme on HTML document
export function applyTheme(themeName) {
  state.theme = themeName;
  try {
    localStorage.setItem('routewise_theme', themeName);
  } catch (e) {}
  document.documentElement.setAttribute('data-theme', themeName);
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.innerHTML = themeName === 'dark' 
      ? '<i data-lucide="sun"></i>' 
      : '<i data-lucide="moon"></i>';
    if (window.lucide) window.lucide.createIcons();
  }
}
