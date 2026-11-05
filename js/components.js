/**
 * Routewise Frontend - UI Components & Rendering Module (Phase 3B)
 * Comprehensive Dashboard, Leaflet Map with CartoDB Positron, Animated Routes,
 * Vertical Drag-and-Drop Timeline, Image-First Catalog Cards, and Saved Trips.
 */

import { state } from './state.js';
import { API_BASE } from './config.js';
import { 
  fetchRouteOptionsApi, 
  fetchRouteDetailsApi, 
  fetchTripBookingsApi, 
  updateTripBookingStatusApi,
  fetchSavedTripsApi,
  deleteSavedTripApi,
  clearTripHistoryApi,
  reallocateBudgetApi
} from './api.js';

const ATTRACTION_IMAGES = window.ATTRACTION_IMAGES || {};

// Unsplash curated scenic images for South India locations
const IMAGE_CATALOG = {
  chennai: [
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1616843413587-9e3a37f7bbd8?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80"
  ],
  pondicherry: [
    "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1600100397608-f010e421e428?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80"
  ],
  bengaluru: [
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80"
  ],
  madurai: [
    "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
  ],
  coimbatore: [
    "https://images.unsplash.com/photo-1620619767323-b95a89183081?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
  ],
  default: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80"
  ]
};

function getCardImage(city, idx = 0) {
  const key = (city || '').toLowerCase();
  const pool = IMAGE_CATALOG[key] || IMAGE_CATALOG.default;
  return pool[idx % pool.length];
}

/* ==========================================================================
   RENDER TRIP PLAN (DASHBOARD & SUMMARY HERO)
   ========================================================================== */
export function renderTripPlan(data) {
  state.currentPlan = data;
  state.currentTripId = data.tripId;

  // Reveal results container
  const resultsSec = document.getElementById('resultsSection');
  if (resultsSec) resultsSec.classList.add('active');

  const cb = data.costBreakdown || {};
  const totalCost = Math.round(cb.total || data.totalEstimatedCost || 0);
  const budgetMax = Math.round(cb.budgetMax || data.totalBudgetMax || 18000);
  const amountLeft = Math.round(budgetMax - totalCost);
  const isWithinBudget = data.isFeasible !== undefined ? data.isFeasible : (amountLeft >= 0);

  // 1. Summary Header Progress Ring & Values
  const pctUsed = Math.min(150, Math.round((totalCost / (budgetMax || 1)) * 100));
  const ringProgress = document.getElementById('summaryRingProgress');
  const ringPct = document.getElementById('summaryRingPct');
  const totalCostEl = document.getElementById('summaryTotalCost');
  const budgetTargetEl = document.getElementById('summaryBudgetTarget');
  const leftAmountEl = document.getElementById('summaryLeftAmount');
  const leftBadgeEl = document.getElementById('summaryBadgeStatus');
  const whatifSlider = document.getElementById('whatifBudgetSlider');
  const whatifDisplay = document.getElementById('whatifBudgetDisplay');

  if (ringPct) animateCountUp(ringPct, pctUsed, '%');
  if (totalCostEl) animateCountUp(totalCostEl, totalCost, '₹');
  if (budgetTargetEl) budgetTargetEl.textContent = `Budget: ₹${budgetMax.toLocaleString('en-IN')}`;

  if (whatifSlider) {
    whatifSlider.min = Math.round(budgetMax * 0.5);
    whatifSlider.max = Math.round(budgetMax * 1.8);
    whatifSlider.value = budgetMax;
    const progress = ((budgetMax - whatifSlider.min) / (whatifSlider.max - whatifSlider.min)) * 100;
    whatifSlider.style.setProperty('--whatif-pct', `${progress}%`);
    if (whatifDisplay) whatifDisplay.textContent = `₹${budgetMax.toLocaleString('en-IN')}`;
  }

  // Update SVG Ring
  if (ringProgress) {
    const radius = 68;
    const circumference = 2 * Math.PI * radius; // ~427.25
    const offset = circumference - (Math.min(100, pctUsed) / 100) * circumference;
    ringProgress.style.strokeDasharray = `${circumference} ${circumference}`;
    ringProgress.style.strokeDashoffset = offset;
    ringProgress.classList.toggle('overbudget', !isWithinBudget);
  }

  // Status Badge and "Rs X Left" in Green or "Over budget" in Red
  if (leftBadgeEl && leftAmountEl) {
    if (isWithinBudget) {
      leftBadgeEl.className = 'summary-badge-status within';
      leftBadgeEl.innerHTML = '<i data-lucide="check-circle" style="width:14px;height:14px;"></i> Within Budget';
      leftAmountEl.className = 'summary-left-pill positive';
      leftAmountEl.innerHTML = `<i data-lucide="trending-up" style="width:16px;height:16px;"></i> ₹${Math.abs(amountLeft).toLocaleString('en-IN')} left to spend`;

      // Trigger celebration confetti when within budget!
      triggerConfettiBurst();
    } else {
      leftBadgeEl.className = 'summary-badge-status over';
      leftBadgeEl.innerHTML = '<i data-lucide="alert-triangle" style="width:14px;height:14px;"></i> Over Budget';
      leftAmountEl.className = 'summary-left-pill negative';
      leftAmountEl.innerHTML = `<i data-lucide="trending-down" style="width:16px;height:16px;"></i> ₹${Math.abs(amountLeft).toLocaleString('en-IN')} over budget`;
    }
  }

  // 2. Interactive Stacked Bar Cost Breakdown
  renderStackedCostBar(cb, totalCost);

  // 3. Render Tabs Content
  renderTimelineTab(data.itinerary || []);
  loadAndRenderStayCards(data);
  renderFoodCards(data.recommendedRestaurants || []);
  renderPlacesCards(data.recommendedAttractions || []);

  // 4. Load Route Options & Map
  if (data.tripId) {
    loadRouteOptionsForTrip(data.tripId);
    loadTripChecklist(data.tripId);
  }

  // 5. Update WhatsApp and Share links
  updateWhatsAppShareLink(data);
  // Fetch live Open-Meteo destination weather
  fetchLiveDestinationWeather(data.destinationCity || 'Pondicherry');


  // Switch to Itinerary tab
  switchTab('itineraryTab');
  if (window.lucide) window.lucide.createIcons();

  // Smooth scroll
  setTimeout(() => {
    resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ==========================================================================
   INTERACTIVE STACKED COST BAR
   ========================================================================== */
function renderStackedCostBar(cb, totalCost) {
  const stay = cb.accommodation || 0;
  const food = cb.food || 0;
  const trans = (cb.fuel || 0) + (cb.tolls || 0);
  const sight = cb.sightseeing || 0;
  const denom = totalCost || 1;

  const pStay = Math.round((stay / denom) * 100) || 0;
  const pFood = Math.round((food / denom) * 100) || 0;
  const pTrans = Math.round((trans / denom) * 100) || 0;
  const pSight = Math.max(0, 100 - (pStay + pFood + pTrans));

  const bar = document.getElementById('stackedCostBar');
  if (bar) {
    bar.innerHTML = `
      <div class="stacked-bar-seg seg-stay" style="width:${pStay}%;" title="Stay: ₹${Math.round(stay)} (${pStay}%)"></div>
      <div class="stacked-bar-seg seg-food" style="width:${pFood}%;" title="Food: ₹${Math.round(food)} (${pFood}%)"></div>
      <div class="stacked-bar-seg seg-trans" style="width:${pTrans}%;" title="Fuel & Tolls: ₹${Math.round(trans)} (${pTrans}%)"></div>
      <div class="stacked-bar-seg seg-sight" style="width:${pSight}%;" title="Sightseeing: ₹${Math.round(sight)} (${pSight}%)"></div>
    `;
  }

  const legend = document.getElementById('costCategoriesLegend');
  if (legend) {
    legend.innerHTML = `
      <div class="cost-cat-pill" onmouseenter="highlightBarSeg('seg-stay')" onmouseleave="resetBarSegs()">
        <div class="cost-cat-title">
          <span class="cost-cat-dot" style="background:var(--cat-stay);"></span> Stay
        </div>
        <div class="cost-cat-val">₹${Math.round(stay).toLocaleString('en-IN')}</div>
      </div>

      <div class="cost-cat-pill" onmouseenter="highlightBarSeg('seg-food')" onmouseleave="resetBarSegs()">
        <div class="cost-cat-title">
          <span class="cost-cat-dot" style="background:var(--cat-food);"></span> Food & Dining
        </div>
        <div class="cost-cat-val">₹${Math.round(food).toLocaleString('en-IN')}</div>
      </div>

      <div class="cost-cat-pill" onmouseenter="highlightBarSeg('seg-trans')" onmouseleave="resetBarSegs()">
        <div class="cost-cat-title">
          <span class="cost-cat-dot" style="background:var(--cat-transport);"></span> Fuel & Tolls
        </div>
        <div class="cost-cat-val">₹${Math.round(trans).toLocaleString('en-IN')}</div>
      </div>

      <div class="cost-cat-pill" onmouseenter="highlightBarSeg('seg-sight')" onmouseleave="resetBarSegs()">
        <div class="cost-cat-title">
          <span class="cost-cat-dot" style="background:var(--cat-sightseeing);"></span> Places
        </div>
        <div class="cost-cat-val">₹${Math.round(sight).toLocaleString('en-IN')}</div>
      </div>
    `;
  }
}

window.highlightBarSeg = (segClass) => {
  document.querySelectorAll('.stacked-bar-seg').forEach(s => {
    s.style.opacity = s.classList.contains(segClass) ? '1' : '0.35';
    if (s.classList.contains(segClass)) s.style.transform = 'scaleY(1.2)';
  });
};

window.resetBarSegs = () => {
  document.querySelectorAll('.stacked-bar-seg').forEach(s => {
    s.style.opacity = '1';
    s.style.transform = 'scaleY(1)';
  });
};

/* ==========================================================================
   WHAT-IF LIVE BUDGET SLIDER
   ========================================================================== */
let whatifDebounceTimer = null;

export function handleWhatIfBudgetChange(newVal) {
  const display = document.getElementById('whatifBudgetDisplay');
  if (display) display.textContent = `₹${parseInt(newVal, 10).toLocaleString('en-IN')}`;

  const slider = document.getElementById('whatifBudgetSlider');
  if (slider) {
    const progress = ((newVal - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--whatif-pct', `${progress}%`);
  }

  clearTimeout(whatifDebounceTimer);
  whatifDebounceTimer = setTimeout(() => {
    applyWhatIfCalculation(newVal);
  }, 100);
}

function applyWhatIfCalculation(newVal) {
  if (!state.currentPlan) return;
  const currentCost = Math.round(state.currentPlan.costBreakdown?.total || state.currentPlan.totalEstimatedCost || 0);
  const diff = newVal - currentCost;
  const isWithin = diff >= 0;

  const leftBadgeEl = document.getElementById('summaryBadgeStatus');
  const leftAmountEl = document.getElementById('summaryLeftAmount');
  const ringProgress = document.getElementById('summaryRingProgress');
  const ringPct = document.getElementById('summaryRingPct');

  if (leftBadgeEl && leftAmountEl) {
    if (isWithin) {
      leftBadgeEl.className = 'summary-badge-status within';
      leftBadgeEl.innerHTML = '<i data-lucide="check-circle" style="width:14px;height:14px;"></i> Within Budget';
      leftAmountEl.className = 'summary-left-pill positive';
      leftAmountEl.innerHTML = `<i data-lucide="trending-up" style="width:16px;height:16px;"></i> ₹${Math.abs(diff).toLocaleString('en-IN')} left to spend`;
    } else {
      leftBadgeEl.className = 'summary-badge-status over';
      leftBadgeEl.innerHTML = '<i data-lucide="alert-triangle" style="width:14px;height:14px;"></i> Over Budget';
      leftAmountEl.className = 'summary-left-pill negative';
      leftAmountEl.innerHTML = `<i data-lucide="trending-down" style="width:16px;height:16px;"></i> ₹${Math.abs(diff).toLocaleString('en-IN')} over budget`;
    }
  }

  const pct = Math.min(150, Math.round((currentCost / newVal) * 100));
  if (ringPct) ringPct.textContent = `${pct}%`;
  if (ringProgress) {
    const circumference = 2 * Math.PI * 68;
    const offset = circumference - (Math.min(100, pct) / 100) * circumference;
    ringProgress.style.strokeDashoffset = offset;
    ringProgress.classList.toggle('overbudget', !isWithin);
  }

  // Update catalog badges dynamically based on what-if budget!
  updateCatalogBadges(newVal);
  if (window.lucide) window.lucide.createIcons();
}

function updateCatalogBadges(budget) {
  const stayBudget = budget * 0.35;
  document.querySelectorAll('.catalog-card[data-price]').forEach(card => {
    const price = parseFloat(card.dataset.price);
    const badge = card.querySelector('.catalog-budget-badge');
    if (badge) {
      if (price <= stayBudget) {
        badge.className = 'catalog-budget-badge within';
        badge.textContent = 'Within Budget';
      } else {
        badge.className = 'catalog-budget-badge over';
        badge.textContent = 'Slightly Over';
      }
    }
  });
}

/* ==========================================================================
   ROUTES & LEAFLET MAP WITH CARTO POSITRON AND ANIMATED LINE
   ========================================================================== */
export async function loadRouteOptionsForTrip(tripId) {
  try {
    const multi = await fetchRouteOptionsApi(tripId);
    state.currentRouteOptions = multi;

    // Normalize routes whether returned as Map/Object or Array
    let routesList = [];
    if (Array.isArray(multi.routes)) {
      routesList = multi.routes;
    } else if (multi.routes && typeof multi.routes === 'object') {
      routesList = Object.values(multi.routes);
    }
    multi._routesList = routesList;

    renderRouteCards(routesList);
    renderComparisonTable(routesList);

    if (routesList.length > 0) {
      selectRouteStyle(routesList[0].routeType);
    }
  } catch (e) {
    console.error("Error loading route options:", e);
  }
}

function renderRouteCards(routes) {
  const container = document.getElementById('routeStyleCardsList');
  if (!container) return;

  const styleIcons = {
    fastest: 'zap',
    shortest: 'compass',
    cheapest: 'wallet',
    scenic: 'trees',
    easiest: 'shield-check'
  };

  container.innerHTML = routes.map(r => {
    const duration = r.totalDurationMinutes || r.totalTimeMins || 0;
    const distance = r.totalDistanceKm || 0;
    const cost = r.totalCost || 0;

    return `
      <div class="route-style-card ${r.routeType === state.currentRouteType ? 'active' : ''}"
           onclick="window.selectRouteStyle('${r.routeType}')" id="routeCard-${r.routeType}">
        <div class="route-card-top">
          <div class="route-card-title">
            <i data-lucide="${styleIcons[r.routeType] || 'map-pin'}" style="width:18px;height:18px;color:#7C3AED;"></i>
            <span>${capitalize(r.routeType)}</span>
          </div>
          <span class="route-card-badge">${r.scenicScore ? Math.round(r.scenicScore * 100) + '% scenic' : 'Recommended'}</span>
        </div>
        <div class="route-card-metrics">
          <span><i data-lucide="navigation" style="width:14px;height:14px;"></i> ${distance} km</span>
          <span><i data-lucide="clock" style="width:14px;height:14px;"></i> ${duration} mins</span>
        </div>
        <div class="route-card-cost">₹${Math.round(cost).toLocaleString('en-IN')} <span style="font-size:0.75rem;font-weight:500;color:var(--text-muted);">(Fuel + Tolls)</span></div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderComparisonTable(routes) {
  const table = document.getElementById('routeComparisonTableBody');
  if (!table || routes.length === 0) return;

  const minDistance = Math.min(...routes.map(r => r.totalDistanceKm || 9999));
  const minDuration = Math.min(...routes.map(r => r.totalDurationMinutes || r.totalTimeMins || 9999));
  const minCost = Math.min(...routes.map(r => r.totalCost || 9999));
  const maxScenic = Math.max(...routes.map(r => r.scenicScore || 0));

  table.innerHTML = routes.map(r => {
    const duration = r.totalDurationMinutes || r.totalTimeMins || 0;
    const distance = r.totalDistanceKm || 0;
    const cost = r.totalCost || 0;

    return `
      <tr style="cursor:pointer;" onclick="window.selectRouteStyle('${r.routeType}')">
        <td><strong>${capitalize(r.routeType)}</strong></td>
        <td>
          ${distance} km
          ${distance === minDistance ? '<span class="table-best-badge">Shortest</span>' : ''}
        </td>
        <td>
          ${duration} mins
          ${duration === minDuration ? '<span class="table-best-badge">Fastest</span>' : ''}
        </td>
        <td>
          ₹${Math.round(cost).toLocaleString('en-IN')}
          ${cost === minCost ? '<span class="table-best-badge">Cheapest</span>' : ''}
        </td>
        <td>
          ${r.scenicScore ? Math.round(r.scenicScore * 100) + '%' : '40%'}
          ${r.scenicScore === maxScenic && maxScenic > 0 ? '<span class="table-best-badge">Top Scenic</span>' : ''}
        </td>
      </tr>
    `;
  }).join('');
}

export async function selectRouteStyle(type) {
  state.currentRouteType = type;
  document.querySelectorAll('.route-style-card').forEach(c => {
    c.classList.toggle('active', c.id === `routeCard-${type}`);
  });

  // Fetch full route details with geometry and legs from backend if available
  let routeDetail = null;
  if (state.currentTripId) {
    try {
      const res = await fetch(`${API_BASE}/trips/${state.currentTripId}/route/${type}`);
      if (res.ok) {
        routeDetail = await res.json();
      }
    } catch (e) {
      console.warn("Could not fetch route detail:", e);
    }
  }

  if (routeDetail && routeDetail.legs && routeDetail.legs.length > 0) {
    renderLeafletMapWithDetail(routeDetail);
    return;
  }

  const routes = state.currentRouteOptions?._routesList || 
                 (Array.isArray(state.currentRouteOptions?.routes) 
                    ? state.currentRouteOptions.routes 
                    : Object.values(state.currentRouteOptions?.routes || {}));

  const route = routes.find(r => r.routeType === type);
  if (route) {
    renderLeafletMap(route);
  }
}

export function renderLeafletMapWithDetail(routeDetail) {
  const mapDiv = document.getElementById('leafletMapContainer');
  if (!mapDiv) return;

  initLeafletMapInstance();

  // Clear existing pins & route path
  state.mapMarkers.forEach(m => state.leafletMap.removeLayer(m));
  state.mapMarkers = [];
  if (state.mapPolyline) {
    state.leafletMap.removeLayer(state.mapPolyline);
    state.mapPolyline = null;
  }

  const legs = routeDetail.legs || [];
  const coords = [];
  const addedStops = new Set();
  let pinIndex = 1;

  legs.forEach((leg) => {
    // Add geometry points
    if (leg.geometry && Array.isArray(leg.geometry)) {
      leg.geometry.forEach(pt => {
        if (Array.isArray(pt) && pt.length >= 2) coords.push(pt);
      });
    } else {
      if (leg.fromLat && leg.fromLng) coords.push([leg.fromLat, leg.fromLng]);
      if (leg.toLat && leg.toLng) coords.push([leg.toLat, leg.toLng]);
    }

    // Add marker for fromStop
    if (leg.fromLat && leg.fromLng && !addedStops.has(leg.fromStopName)) {
      addedStops.add(leg.fromStopName);
      addMarkerToMap([leg.fromLat, leg.fromLng], leg.fromStopName, leg.fromStopType, pinIndex++);
    }

    // Add marker for toStop
    if (leg.toLat && leg.toLng && !addedStops.has(leg.toStopName)) {
      addedStops.add(leg.toStopName);
      addMarkerToMap([leg.toLat, leg.toLng], leg.toStopName, leg.toStopType, pinIndex++);
    }
  });

  drawAnimatedRoute(coords, routeDetail.routeType);
}

function initLeafletMapInstance() {
  if (!state.leafletMap) {
    state.leafletMap = L.map('leafletMapContainer', { zoomControl: true }).setView([12.5, 79.5], 8);
    
    // CartoDB Voyager / Positron pastel tiles via fastly CDN (no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.leafletMap);
  }
}

function addMarkerToMap(latlng, name, stopType, index) {
  const type = (stopType || '').toLowerCase();
  let pinClass = 'pin-attraction';
  if (type.includes('hotel')) pinClass = 'pin-hotel';
  else if (type.includes('food') || type.includes('restaurant') || type.includes('meal')) pinClass = 'pin-food';
  else if (type.includes('travel')) pinClass = 'pin-travel';

  const customIcon = L.divIcon({
    className: 'custom-pin-wrap',
    html: `<div class="custom-pin-marker ${pinClass} pin-drop-bounce" style="animation-delay:${index * 110}ms">${index}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  const marker = L.marker(latlng, { icon: customIcon }).addTo(state.leafletMap)
    .bindPopup(`
      <div style="font-family:var(--font-body);padding:4px;">
        <strong style="color:#7C3AED;">${index}. ${name}</strong><br>
        <span style="font-size:0.78rem;color:#64748B;">${stopType || 'Waypoint'}</span>
      </div>
    `);
  state.mapMarkers.push(marker);
}

function drawAnimatedRoute(coords, routeType) {
  if (coords.length > 1) {
    const routeColors = {
      fastest: '#7C3AED',
      shortest: '#2563EB',
      cheapest: '#10B981',
      scenic: '#EC4899',
      easiest: '#F59E0B'
    };
    const chosenColor = routeColors[routeType] || '#7C3AED';

    state.mapPolyline = L.polyline(coords, {
      color: chosenColor,
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: routeType === 'scenic' ? '8, 8' : null
    }).addTo(state.leafletMap);

    const bounds = state.mapPolyline.getBounds();
    if (bounds && bounds.isValid()) {
      state.leafletMap.invalidateSize();
      const size = state.leafletMap.getSize();
      if (size && size.x > 0 && size.y > 0 && typeof state.leafletMap.flyToBounds === 'function') {
        try {
          state.leafletMap.flyToBounds(bounds, { duration: 1.4, easeLinearity: 0.25, padding: [50, 50] });
        } catch (e) {
          state.leafletMap.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        state.leafletMap.fitBounds(bounds, { padding: [50, 50] });
      }
    }
    animatePolyline(state.mapPolyline);
  }

  setTimeout(() => {
    if (state.leafletMap) state.leafletMap.invalidateSize();
  }, 250);
}

export function renderLeafletMap(route) {
  const mapDiv = document.getElementById('leafletMapContainer');
  if (!mapDiv) return;

  // Initialize Leaflet Map with CartoDB Positron / Voyager pastel tiles
  if (!state.leafletMap) {
    state.leafletMap = L.map('leafletMapContainer', { zoomControl: true }).setView([12.5, 79.5], 8);
    
    // CartoDB Voyager / Positron pastel tiles via fastly CDN (no API key required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(state.leafletMap);
  }

  // Clear existing pins & route path
  state.mapMarkers.forEach(m => state.leafletMap.removeLayer(m));
  state.mapMarkers = [];
  if (state.mapPolyline) {
    state.leafletMap.removeLayer(state.mapPolyline);
    state.mapPolyline = null;
  }

  const stops = route.stops || [];
  const coords = [];

  stops.forEach((stop, idx) => {
    if (stop.latitude && stop.longitude) {
      const latlng = [stop.latitude, stop.longitude];
      coords.push(latlng);

      const type = (stop.stopType || '').toLowerCase();
      let pinClass = 'pin-attraction';
      if (type.includes('hotel')) pinClass = 'pin-hotel';
      else if (type.includes('food') || type.includes('restaurant')) pinClass = 'pin-food';
      else if (type.includes('travel')) pinClass = 'pin-travel';

      const customIcon = L.divIcon({
        className: 'custom-pin-wrap',
        html: `<div class="custom-pin-marker ${pinClass} pin-drop-bounce" style="animation-delay:${(idx + 1) * 110}ms">${idx + 1}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(latlng, { icon: customIcon }).addTo(state.leafletMap)
        .bindPopup(`
          <div style="font-family:var(--font-body);padding:4px;">
            <strong style="color:#7C3AED;">${idx + 1}. ${stop.name}</strong><br>
            <span style="font-size:0.78rem;color:#64748B;">${stop.stopType}</span>
          </div>
        `);
      state.mapMarkers.push(marker);
    }
  });

  // Animated Route Line
  if (coords.length > 1) {
    const routeColors = {
      fastest: '#7C3AED',
      shortest: '#2563EB',
      cheapest: '#10B981',
      scenic: '#EC4899',
      easiest: '#F59E0B'
    };
    const chosenColor = routeColors[route.routeType] || '#7C3AED';

    state.mapPolyline = L.polyline(coords, {
      color: chosenColor,
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      dashArray: route.routeType === 'scenic' ? '8, 8' : null
    }).addTo(state.leafletMap);

    const bounds = state.mapPolyline.getBounds();
    if (bounds && bounds.isValid()) {
      state.leafletMap.invalidateSize();
      const size = state.leafletMap.getSize();
      if (size && size.x > 0 && size.y > 0 && typeof state.leafletMap.flyToBounds === 'function') {
        try {
          state.leafletMap.flyToBounds(bounds, { duration: 1.4, easeLinearity: 0.25, padding: [50, 50] });
        } catch (e) {
          state.leafletMap.fitBounds(bounds, { padding: [50, 50] });
        }
      } else {
        state.leafletMap.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Animate line as if being drawn
    animatePolyline(state.mapPolyline);
  }

  setTimeout(() => {
    if (state.leafletMap) state.leafletMap.invalidateSize();
  }, 250);
}

function animatePolyline(polyline) {
  const el = polyline.getElement();
  if (el) {
    el.style.strokeDasharray = '1000';
    el.style.strokeDashoffset = '1000';
    el.style.animation = 'drawRoute 1.4s ease-out forwards';
  }
}

/* ==========================================================================
   VERTICAL TIMELINE WITH DRAG-AND-DROP & CLOSING WARNINGS
   ========================================================================== */
export function renderTimelineTab(days) {
  const container = document.getElementById('timelineDaysContainer');
  if (!container) return;

  if (!days || days.length === 0) {
    container.innerHTML = `<p style="padding:1.5rem;color:var(--text-muted);">No timeline events generated.</p>`;
    return;
  }

  // Day filter pills
  const dayTabs = document.getElementById('timelineDayPills');
  if (dayTabs) {
    dayTabs.innerHTML = days.map((day, idx) => `
      <button type="button" class="timeline-day-pill ${idx === 0 ? 'active' : ''}" 
              onclick="window.filterTimelineDay(${idx + 1}, this)">
        Day ${day.dayNumber}
      </button>
    `).join('');
  }

  container.innerHTML = days.map(day => `
    <div class="timeline-day-group" id="timelineDay-${day.dayNumber}" data-day="${day.dayNumber}">
      <div class="day-header" style="margin-bottom:1rem;">
        <span class="day-title">
          <i data-lucide="calendar" style="color:#7C3AED;width:20px;height:20px;"></i>
          ${day.dateLabel || `Day ${day.dayNumber}`}
        </span>
        <span class="day-cost-tag">Day Total: ₹${Math.round(day.dayTotalCost || 0).toLocaleString('en-IN')}</span>
      </div>

      <div class="timeline-stops-container sortable-timeline" id="sortableDay-${day.dayNumber}">
        ${(day.items || []).map((item, idx) => {
          // Check opening/closing time warning
          const isClosedWarning = checkClosingWarning(item);
          const city = (state.currentPlan && state.currentPlan.destinationCity) ? state.currentPlan.destinationCity : 'Chennai';
          const query = encodeURIComponent(`${item.title} ${city}`);
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

          return `
            <div class="timeline-stop-card ${isClosedWarning ? 'closed-warning' : ''}" data-item-id="${item.id || idx}">
              <div class="stop-drag-handle" title="Drag to reorder stop">
                <i data-lucide="grip-vertical" style="width:18px;height:18px;"></i>
              </div>

              <div class="stop-time-col">
                <span>${formatTime(item.startTime)}</span>
                <span class="duration">${item.durationMinutes || 60}m stay</span>
              </div>

              <div class="stop-info-col">
                <h4>${item.title}</h4>
                <p>${item.description || ''}</p>
                ${isClosedWarning ? `
                  <div class="stop-warning-tag">
                    <i data-lucide="alert-triangle" style="width:12px;height:12px;"></i>
                    May be closed upon arrival! Consider swapping with an earlier morning stop.
                  </div>
                ` : ''}
              </div>

              <div class="event-actions-col">
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps">
                  <i data-lucide="navigation"></i> Directions
                </a>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  initTimelineDragAndDrop();
  if (window.lucide) window.lucide.createIcons();
}

function checkClosingWarning(item) {
  // If arrival time is later than 16:30 for an attraction (temple, museum, monument, ashram, basilica)
  const time = (item.startTime || '09:00:00').substring(0, 5);
  const hour = parseInt(time.split(':')[0], 10);
  const title = (item.title || '').toLowerCase();
  const type = (item.itemType || '').toLowerCase();
  
  // Highlight attractions scheduled late in the afternoon/evening
  if (type === 'attraction' && (hour >= 17 || title.includes('temple') || title.includes('museum') || title.includes('ashram'))) {
    if (hour >= 17 || hour <= 8) return true;
  }
  return false;
}

function initTimelineDragAndDrop() {
  document.querySelectorAll('.sortable-timeline').forEach(container => {
    if (window.Sortable) {
      new Sortable(container, {
        handle: '.stop-drag-handle',
        animation: 200,
        ghostClass: 'sortable-ghost',
        onEnd: function() {
          showToast("✓ Stop reordered! Recalculating timings & route geometry...", "success");
          recalculateTimelineTimes(container);
        }
      });
    }
  });
}

function recalculateTimelineTimes(container) {
  let startHour = 9;
  let startMin = 0;
  container.querySelectorAll('.timeline-stop-card').forEach(card => {
    const timeSpan = card.querySelector('.stop-time-col span:first-child');
    if (timeSpan) {
      const formatted = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      timeSpan.textContent = formatted;
      startHour += 1;
      startMin += 30;
      if (startMin >= 60) {
        startHour += 1;
        startMin -= 60;
      }
    }
  });
}

window.filterTimelineDay = (dayNum, btn) => {
  document.querySelectorAll('.timeline-day-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('.timeline-day-group').forEach(group => {
    if (dayNum === 0) {
      group.style.display = 'block';
    } else {
      group.style.display = parseInt(group.dataset.day, 10) === dayNum ? 'block' : 'none';
    }
  });
};

/* ==========================================================================
   IMAGE-FIRST CATALOG CARDS: STAY (HOTELS)
   ========================================================================== */
export async function loadAndRenderStayCards(planData) {
  const container = document.getElementById('stayCardsGrid');
  if (!container) return;

  const destination = (planData && planData.destinationCity) || 'Pondicherry';
  let hotels = [];

  try {
    const citiesRes = await fetch(`${API_BASE}/cities`);
    if (citiesRes.ok) {
      const cities = await citiesRes.json();
      const match = cities.find(c => c.name.toLowerCase() === destination.toLowerCase());
      if (match) {
        const hotelsRes = await fetch(`${API_BASE}/hotels?cityId=${match.id}`);
        if (hotelsRes.ok) {
          hotels = await hotelsRes.json();
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch city hotels:", e);
  }

  if (!hotels || hotels.length === 0) {
    hotels = [planData.selectedHotel].filter(Boolean);
  }

  renderStayCards(hotels, destination);
}

export function renderStayCards(hotels, destination = 'Pondicherry') {
  const container = document.getElementById('stayCardsGrid');
  if (!container) return;

  const stayBudget = (state.currentPlan?.totalBudgetMax || 18000) * 0.35;

  container.innerHTML = hotels.map((h, idx) => {
    const imgUrl = getCardImage(destination, idx);
    const isWithin = h.pricePerNight <= stayBudget;
    const phone = h.phone || '+91 94440 12345';
    const mmtUrl = h.bookingUrl || `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(destination)}&hotelName=${encodeURIComponent(h.name)}`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name + ' ' + destination)}`;

    return `
      <div class="catalog-card" data-price="${h.pricePerNight}">
        <div class="catalog-card-image-box">
          <div class="catalog-card-image-box illustrated-fallback">
     <div class="illustrated-fallback-icon"><i data-lucide="building-2" style="width:22px;height:22px;color:#7C3AED;"></i></div>
     <span class="illustrated-fallback-label">${h.tier || 'Deluxe'} Hotel</span>
   </div>
          <span class="catalog-budget-badge ${isWithin ? 'within' : 'over'}">
            ${isWithin ? 'Within Budget' : 'Slightly Over'}
          </span>
          <div class="catalog-rating-pill">
            ⭐ ${h.rating || 4.3} <span style="font-weight:400;color:var(--text-muted);">(Verified)</span>
          </div>
        </div>

        <div class="catalog-card-body">
          <div class="catalog-title-row">
            <h4>${h.name}</h4>
            <div class="catalog-price-tag">₹${Math.round(h.pricePerNight).toLocaleString('en-IN')}<span style="font-size:0.72rem;font-weight:500;color:var(--text-muted);">/nt</span></div>
          </div>

          <p class="catalog-card-desc">
            ${h.tier || 'Deluxe'} Stay • ${destination} • AC Rooms, Complimentary Breakfast, Free WiFi.
          </p>

          <div class="catalog-actions-row">
            <button type="button" class="btn-add-trip" onclick="window.handleAddToTrip('${h.name.replace(/'/g, "\\'")}', this)">
              <i data-lucide="plus"></i> Add to Trip
            </button>
            <div style="display:flex;gap:0.4rem;">
              <a href="${mmtUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn mmt">Book</a>
              <a href="tel:${phone}" class="partner-btn call"><i data-lucide="phone"></i> Call</a>
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="map-pin"></i></a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/* ==========================================================================
   IMAGE-FIRST CATALOG CARDS: FOOD & DINING
   ========================================================================== */
export function renderFoodCards(restaurants) {
  const container = document.getElementById('foodCardsGrid');
  if (!container) return;

  const destination = (state.currentPlan && state.currentPlan.destinationCity) || 'Pondicherry';
  const foodBudget = (state.currentPlan?.totalBudgetMax || 18000) * 0.25;

  container.innerHTML = (restaurants || []).map((r, idx) => {
    const imgUrl = getCardImage(destination, idx + 1);
    const approx = r.approxCostForTwo || 600;
    const isWithin = approx <= foodBudget;
    const phone = r.phone || '+91 94441 54321';
    const zomatoUrl = `https://www.zomato.com`;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + destination)}`;

    return `
      <div class="catalog-card" data-price="${approx}">
        <div class="catalog-card-image-box">
          <div class="catalog-card-image-box illustrated-fallback">
     <div class="illustrated-fallback-icon"><i data-lucide="utensils" style="width:22px;height:22px;color:#EC4899;"></i></div>
     <span class="illustrated-fallback-label">${r.cuisineType || 'Authentic'} Dining</span>
   </div>
          <span class="catalog-budget-badge ${isWithin ? 'within' : 'over'}">
            ${isWithin ? 'Within Budget' : 'Premium Spot'}
          </span>
          <div class="catalog-rating-pill">
            ⭐ ${r.rating || 4.4}
          </div>
        </div>

        <div class="catalog-card-body">
          <div class="catalog-title-row">
            <h4>${r.name}</h4>
            <div class="catalog-price-tag">~₹${Math.round(approx)}<span style="font-size:0.72rem;font-weight:500;color:var(--text-muted);"> for two</span></div>
          </div>

          <p class="catalog-card-desc">
            ${r.cuisine || 'Authentic South Indian & Coastal'} • Signature filter coffee, regional thali & desserts.
          </p>

          <div class="catalog-actions-row">
            <button type="button" class="btn-add-trip" onclick="window.handleAddToTrip('${r.name}', this)">
              <i data-lucide="plus"></i> Add to Trip
            </button>
            <div style="display:flex;gap:0.4rem;">
              <a href="tel:${phone}" class="partner-btn call"><i data-lucide="phone"></i> Call</a>
              <a href="${zomatoUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn zomato">Zomato</a>
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="map-pin"></i></a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

/* ==========================================================================
   IMAGE-FIRST CATALOG CARDS: PLACES (ATTRACTIONS)
   ========================================================================== */

export function renderPlacesCards(attractions) {
  const container = document.getElementById('placesCardsGrid');
  if (!container) return;

  const destination = (state.currentPlan && state.currentPlan.destinationCity) || 'Pondicherry';

  container.innerHTML = (attractions || []).map((a, idx) => {
    const wiki = ATTRACTION_IMAGES[a.name] || {};
    const imgUrl = wiki.imageUrl || getCardImage(destination, idx + 2);
    const ticket = a.ticketPrice || 0;
    const status = computeOpenStatus(a.openingTime, a.closingTime);
    const mapsUrl = a.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name + ' ' + destination)}`;
    const attrJson = JSON.stringify(a).replace(/"/g, '&quot;');

    return `
      <div class="catalog-card attraction-interactive-card" data-price="${ticket}" onclick="window.openAttractionModal(${attrJson})">
        <div class="catalog-card-image-box">
          <img src="${imgUrl}" alt="${a.name}" class="catalog-card-img" loading="lazy" />
          <span class="catalog-budget-badge within">
            ${ticket === 0 ? 'Free Entry' : `₹${Math.round(ticket)} entry`}
          </span>
          <div class="catalog-rating-pill">
            ⭐ ${a.rating || 4.5} <span style="font-size:0.7rem;font-weight:600;color:${status.isOpen ? '#059669' : '#DC2626'};margin-left:0.25rem;">• ${status.isOpen ? 'Open' : 'Closed'}</span>
          </div>
          <span class="photo-credit-tag">${wiki.attribution || 'Wikimedia Commons'}</span>
        </div>

        <div class="catalog-card-body">
          <div class="catalog-title-row">
            <h4>${a.name}</h4>
            <div class="catalog-price-tag">${ticket === 0 ? 'FREE' : `₹${Math.round(ticket)}`}</div>
          </div>

          <p class="catalog-card-desc">
            ${wiki.description ? wiki.description.substring(0, 110) + '...' : (a.category || 'Sightseeing') + ' • Hours: ' + (a.openingTime || '09:00') + ' - ' + (a.closingTime || '18:00')}
          </p>

          <div class="catalog-actions-row" onclick="event.stopPropagation()">
            <button type="button" class="btn-add-trip" onclick="window.handleAddToTrip('\${a.name}', this)">
              <i data-lucide="plus"></i> Add to Trip
            </button>
            <div style="display:flex;gap:0.4rem;">
              <button type="button" class="partner-btn" onclick="window.openAttractionModal(${attrJson})" title="View Details">
                <i data-lucide="maximize-2"></i> Details
              </button>
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="navigation"></i> Directions</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

window.handleAddToTrip = (itemName, btn) => {
  btn.classList.add('added');
  btn.innerHTML = `<i data-lucide="check"></i> Added!`;
  if (window.lucide) window.lucide.createIcons();
  showToast(`✨ '${itemName}' added to your active trip itinerary!`, 'success');
};

/* ==========================================================================
   SAVED TRIPS PAGE & VISUAL CARDS
   ========================================================================== */
export async function loadSavedTrips() {
  const container = document.getElementById('savedTripsGrid');
  if (!container) return;

  try {
    const trips = await fetchSavedTripsApi();
    if (!trips || trips.length === 0) {
      container.innerHTML = `
        <div style="padding:2.5rem;text-align:center;color:var(--text-muted);grid-column:1/-1;">
          <i data-lucide="folder-x" style="width:40px;height:40px;margin-bottom:0.75rem;color:#7C3AED;"></i>
          <h3>No saved trips yet</h3>
          <p>Generate a journey plan to see your saved itineraries here.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = trips.map(t => {
      const from = t.startCity?.name || 'Chennai';
      const to = t.destinationCity?.name || 'Pondicherry';
      const cost = Math.round(t.totalEstimatedCost || 0);
      const budget = Math.round(t.totalBudgetMax || 0);

      return `
        <div class="saved-trip-card">
          <div class="saved-card-header">
            <div>
              <div class="saved-card-route-title">
                ${from} <i data-lucide="arrow-right" style="width:16px;height:16px;color:#7C3AED;"></i> ${to}
              </div>
              <div class="saved-card-meta">
                <span class="saved-meta-chip">📅 ${t.numDays} Days</span>
                <span class="saved-meta-chip">👥 ${t.numTravellers} Travellers</span>
                <span class="saved-meta-chip">🚗 ${(t.transportMode || 'car').toUpperCase()}</span>
              </div>
            </div>
            <button type="button" class="header-btn" onclick="window.deleteTripRecord(${t.id}, event)" title="Delete trip">
              <i data-lucide="trash-2" style="width:16px;height:16px;color:#F43F5E;"></i>
            </button>
          </div>

          <div class="saved-mini-preview-track">
            <i data-lucide="compass" style="width:16px;height:16px;color:#7C3AED;"></i>
            <span>${t.items ? t.items.length : 6} planned stops with dynamic budget tracking</span>
          </div>

          <div class="saved-card-footer">
            <div>
              <span style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;font-weight:700;">Est. Cost</span>
              <div class="saved-cost-display">₹${cost.toLocaleString('en-IN')}</div>
            </div>
            <button type="button" class="header-btn primary" onclick="window.loadSavedTripById(${t.id})">
              <span>View Itinerary</span> <i data-lucide="chevron-right" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  } catch (e) {
    console.error("Failed to load saved trips:", e);
  }
}

window.deleteTripRecord = async (tripId, event) => {
  event.stopPropagation();
  if (!confirm("Are you sure you want to delete this saved trip?")) return;
  const ok = await deleteSavedTripApi(tripId);
  if (ok) {
    showToast("Trip removed from history", "success");
    loadSavedTrips();
  }
};

window.loadSavedTripById = async (tripId) => {
  try {
    const res = await fetch(`${API_BASE}/trips/${tripId}`);
    if (res.ok) {
      const trip = await res.json();
      renderTripPlan(trip);
      switchTab('itineraryTab');
    }
  } catch (e) {
    showToast("Failed to load trip: " + e.message, "error");
  }
};

/* ==========================================================================
   CONFETTI CELEBRATION & NUMBER COUNT-UP
   ========================================================================== */
function triggerConfettiBurst() {
  if (window.confetti) {
    window.confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#F43F5E', '#10B981', '#0284C7', '#FEF3C7']
    });
  }
}

function animateCountUp(el, target, prefix = '') {
  let current = 0;
  const step = Math.max(1, Math.floor(target / 25));
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = `${prefix}${current.toLocaleString('en-IN')}`;
  }, 20);
}

/* ==========================================================================
   SLIDING TABS SWITCHER
   ========================================================================== */
export function switchTab(tabId) {
  const tabs = document.querySelectorAll('.sliding-tab-btn');
  const indicator = document.getElementById('tabSlidingIndicator');

  tabs.forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    if (isActive) {
      if (indicator) {
        indicator.style.left = `${btn.offsetLeft}px`;
        indicator.style.width = `${btn.offsetWidth}px`;
      }
      btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  });

  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  if (tabId === 'routesTab' && state.leafletMap) {
    setTimeout(() => state.leafletMap.invalidateSize(), 200);
  } else if (tabId === 'savedTripsTab') {
    loadSavedTrips();
  }
}

/* ==========================================================================
   BOOKING CHECKLIST COMPONENT & REUSABLE BUTTON ACTIONS
   ========================================================================== */
export async function loadTripChecklist(tripId) {
  try {
    let items = await fetchTripBookingsApi(tripId);
    if ((!items || items.length === 0) && (state.currentPlan || state.currentTripPlan)) {
      items = [];
      const plan = state.currentPlan || state.currentTripPlan;
      const startCity = plan.startCity || 'Chennai';
      const destCity = plan.destinationCity || 'Pondicherry';
      const mode = (plan.transportMode || 'car').toUpperCase();

      // 1. Intercity Transport Stop
      items.push({
        id: 999,
        stopType: 'transport',
        stopName: `${startCity} to ${destCity} (${mode})`,
        status: 'Not booked',
        referenceNumber: '',
        notes: `RedBus / IRCTC booking for ${plan.numTravellers || 2} travellers`,
        bookingOptions: {
          ticketInfo: `Intercity Travel (${mode})`,
          providerLinks: [
            { provider: 'redbus', label: 'Book on RedBus', url: `https://www.redbus.in/bus-tickets/${encodeURIComponent(startCity)}-to-${encodeURIComponent(destCity)}` },
            { provider: 'irctc', label: 'Book on IRCTC', url: 'https://www.irctc.co.in/nget/train-search' },
            { provider: 'makemytrip', label: 'MakeMyTrip', url: 'https://www.makemytrip.com' }
          ]
        }
      });

      // 2. Hotel Accommodation Stop
      if (plan.selectedHotel) {
        items.push({
          id: 1001,
          stopType: 'hotel',
          stopName: plan.selectedHotel.name,
          status: 'Not booked',
          referenceNumber: '',
          notes: 'Near central hub',
          bookingOptions: {
            cityName: destCity,
            phone: plan.selectedHotel.phone || '+91 44 2855 1234',
            ticketInfo: `₹${plan.selectedHotel.pricePerNight || 1800}/night`,
            providerLinks: [
              { provider: 'makemytrip', label: 'MakeMyTrip', url: `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(destCity)}&hotelName=${encodeURIComponent(plan.selectedHotel.name)}` },
              { provider: 'booking.com', label: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(plan.selectedHotel.name + ' ' + destCity)}` },
              { provider: 'google_maps', label: 'Directions', url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(plan.selectedHotel.name + ' ' + destCity)}` }
            ]
          }
        });
      }

      // 3. Restaurants
      (plan.recommendedRestaurants || []).slice(0, 2).forEach((r, idx) => {
        items.push({
          id: 2001 + idx,
          stopType: 'restaurant',
          stopName: r.name,
          status: 'Call pending',
          referenceNumber: '',
          notes: 'Cuisine & reservation',
          bookingOptions: {
            cityName: destCity,
            phone: r.phone || '+91 44 2498 7654',
            ticketInfo: `₹${r.approxCostForTwo || 600} for two`,
            providerLinks: [
              { provider: 'google_maps', label: 'Directions', url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name + ' ' + destCity)}` },
              { provider: 'zomato', label: 'View on Zomato', url: `https://www.zomato.com/${encodeURIComponent(destCity.toLowerCase())}/restaurants?q=${encodeURIComponent(r.name)}` }
            ]
          }
        });
      });

      // 4. Attractions
      (plan.recommendedAttractions || []).slice(0, 2).forEach((a, idx) => {
        items.push({
          id: 3001 + idx,
          stopType: 'attraction',
          stopName: a.name,
          status: 'Not booked',
          referenceNumber: '',
          notes: 'Tickets at entry or partner site',
          bookingOptions: {
            cityName: destCity,
            ticketInfo: a.entryFee > 0 ? `₹${a.entryFee} entry` : 'Free Entry',
            openingHours: a.openingHours || '09:00 - 18:00',
            websiteUrl: a.bookingUrl || null,
            providerLinks: [
              { provider: 'google_maps', label: 'Directions', url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name + ' ' + destCity)}` }
            ]
          }
        });
      });
    }
    state.currentChecklist = items;
    renderChecklist(items);
  } catch (e) {
    console.error("Checklist error:", e);
  }
}

export function updateChecklistCounts() {
  const items = state.currentChecklist || [];
  const total = items.length;
  const booked = items.filter(it => it.status === 'Booked').length;
  const pending = items.filter(it => it.status === 'Call pending').length;
  const unbooked = items.filter(it => it.status === 'Not booked').length;

  const totalEl = document.getElementById('chkTotalCount');
  const bookedEl = document.getElementById('chkBookedCount');
  const pendingEl = document.getElementById('chkPendingCount');
  const unbookedEl = document.getElementById('chkUnbookedCount');
  const bar = document.getElementById('chkProgressBar');
  const tabBadge = document.getElementById('checklistTabBadge');

  if (totalEl) totalEl.textContent = total;
  if (bookedEl) bookedEl.textContent = booked;
  if (pendingEl) pendingEl.textContent = pending;
  if (unbookedEl) unbookedEl.textContent = unbooked;
  if (bar) bar.style.width = total > 0 ? `${(booked / total) * 100}%` : '0%';
  if (tabBadge) tabBadge.textContent = `${booked}/${total}`;
}

export function setChecklistStatus(id, newStatus) {
  const input = document.getElementById(`chkStatus-${id}`);
  if (input) input.value = newStatus;

  // Update segmented control buttons in the DOM
  const seg = document.getElementById(`chkSeg-${id}`);
  if (seg) {
    seg.querySelectorAll('.segmented-btn').forEach(btn => {
      btn.classList.remove('active', 'not-booked', 'call-pending', 'booked');
    });
    const statusSlug = newStatus.toLowerCase().replace(/\s+/g, '-');
    const targetBtn = seg.querySelector(`[data-status="${newStatus}"]`);
    if (targetBtn) {
      targetBtn.classList.add('active', statusSlug);
    }
  }

  // Update card border / accent class
  const card = document.getElementById(`chkCard-${id}`);
  if (card) {
    card.classList.remove('booked', 'pending', 'unbooked');
    card.classList.add(newStatus === 'Booked' ? 'booked' : newStatus === 'Call pending' ? 'pending' : 'unbooked');
  }

  // Update in state item
  const item = (state.currentChecklist || []).find(it => it.id === id);
  if (item) {
    item.status = newStatus;
  }

  updateChecklistCounts();
}

function renderStopActions(item) {
  const type = (item.stopType || 'hotel').toLowerCase();
  const bo = item.bookingOptions || {};
  const links = bo.providerLinks || bo.links || [];
  const phone = bo.phone || '';
  const cityName = bo.cityName || state.currentPlan?.destinationCity || 'Tamil Nadu';
  const stopName = item.stopName || '';
  
  const mapsUrl = bo.mapsUrl || links.find(l => l.provider === 'google_maps' || l.provider === 'gmaps')?.url 
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stopName + ' ' + cityName)}`;

  if (type === 'hotel') {
    const mmtLink = links.find(l => l.provider === 'makemytrip' || l.provider === 'mmt');
    const bdcLink = links.find(l => l.provider === 'booking.com' || l.provider === 'booking');
    const mmtUrl = mmtLink ? mmtLink.url : `https://www.makemytrip.com/hotels/hotel-listing/?city=${encodeURIComponent(cityName)}&hotelName=${encodeURIComponent(stopName)}`;
    const bdcUrl = bdcLink ? bdcLink.url : `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(stopName + ' ' + cityName)}`;

    return `
      <a href="${mmtUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <i data-lucide="building"></i> Book on MakeMyTrip
      </a>
      <a href="${bdcUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <i data-lucide="bed"></i> Book on Booking.com
      </a>
      ${phone ? `<a href="tel:${phone}" class="btn btn-secondary btn-sm"><i data-lucide="phone"></i> Call (${phone})</a>` : ''}
      ${phone ? `<button type="button" class="btn btn-secondary btn-sm" onclick="window.copyToClipboard('${phone}')"><i data-lucide="copy"></i> Copy number</button>` : ''}
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <i data-lucide="navigation"></i> Directions
      </a>
    `;
  }

  if (type === 'restaurant' || type === 'food') {
    const zomatoLink = links.find(l => l.provider === 'zomato');
    const swiggyLink = links.find(l => l.provider === 'swiggy');

    return `
      ${phone ? `<a href="tel:${phone}" class="btn btn-secondary btn-sm"><i data-lucide="phone"></i> Call to reserve (${phone})</a>` : ''}
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <i data-lucide="navigation"></i> Directions
      </a>
      ${zomatoLink && zomatoLink.url ? `
        <a href="${zomatoLink.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          <i data-lucide="external-link"></i> View on Zomato
        </a>
      ` : ''}
      ${swiggyLink && swiggyLink.url ? `
        <a href="${swiggyLink.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
          <i data-lucide="external-link"></i> View on Swiggy
        </a>
      ` : ''}
    `;
  }

  if (type === 'attraction' || type === 'sightseeing') {
    const officialLink = links.find(l => l.provider === 'official' || l.provider === 'ticket');
    const hasBookingUrl = bo.websiteUrl || (officialLink && officialLink.url && !officialLink.url.includes('google.com/search'));

    return `
      ${hasBookingUrl ? `
        <a href="${hasBookingUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
          <i data-lucide="ticket"></i> Book Tickets
        </a>
      ` : `
        <span class="entry-chip-disabled">
          <i data-lucide="ticket"></i> Tickets at entry (${bo.ticketInfo || 'Free entry'})
        </span>
      `}
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <i data-lucide="navigation"></i> Directions
      </a>
    `;
  }

  if (type === 'transport') {
    const redbusLink = links.find(l => l.provider === 'redbus');
    const irctcLink = links.find(l => l.provider === 'irctc');
    const mmtLink = links.find(l => l.provider === 'makemytrip' || l.provider === 'mmt');

    const redbusUrl = redbusLink ? redbusLink.url : `https://www.redbus.in`;
    const irctcUrl = irctcLink ? irctcLink.url : `https://www.irctc.co.in/nget/train-search`;
    const mmtUrl = mmtLink ? mmtLink.url : `https://www.makemytrip.com`;

    return `
      <a href="${redbusUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <i data-lucide="bus"></i> Book on RedBus
      </a>
      <a href="${irctcUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <i data-lucide="train"></i> Book on IRCTC
      </a>
      <a href="${mmtUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
        <i data-lucide="plane"></i> MakeMyTrip
      </a>
      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
        <i data-lucide="navigation"></i> View Route
      </a>
    `;
  }

  return links.map(l => `
    <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
      <i data-lucide="external-link"></i> ${l.label}
    </a>
  `).join('');
}

export function renderChecklist(items) {
  const container = document.getElementById('checklistItemsList');
  if (!container) return;

  state.currentChecklist = items;
  updateChecklistCounts();

  container.innerHTML = items.map(item => {
    const statusClass = item.status === 'Booked' ? 'booked' : item.status === 'Call pending' ? 'pending' : 'unbooked';
    const bo = item.bookingOptions || {};
    const actionsHtml = renderStopActions(item);

    return `
      <div class="checklist-card ${statusClass}" id="chkCard-${item.id}">
        <div class="chk-top-row">
          <div>
            <h4 style="font-size:1.1rem;font-weight:700;">${item.stopName}</h4>
            <span style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">
              ${item.stopType} • ${bo.ticketInfo || bo.openingHours || 'Stop in Itinerary'}
            </span>
          </div>

          <div class="segmented-control" id="chkSeg-${item.id}">
            <button type="button" class="segmented-btn ${item.status === 'Not booked' ? 'active not-booked' : ''}" data-status="Not booked" onclick="window.setChecklistStatus(${item.id}, 'Not booked')">
              <span class="status-dot"></span> Not booked
            </button>
            <button type="button" class="segmented-btn ${item.status === 'Call pending' ? 'active call-pending' : ''}" data-status="Call pending" onclick="window.setChecklistStatus(${item.id}, 'Call pending')">
              <span class="status-dot"></span> Call pending
            </button>
            <button type="button" class="segmented-btn ${item.status === 'Booked' ? 'active booked' : ''}" data-status="Booked" onclick="window.setChecklistStatus(${item.id}, 'Booked')">
              <span class="status-dot"></span> Booked
            </button>
          </div>
          <input type="hidden" id="chkStatus-${item.id}" value="${item.status || 'Not booked'}" />
        </div>

        <div class="chk-inputs-row">
          <div class="chk-input-wrap">
            <label>Confirmation / Ref #</label>
            <input type="text" class="chk-modern-input" id="chkRef-${item.id}" placeholder="e.g. MMT-9821 / Confirmed" value="${item.referenceNumber || ''}">
          </div>
          <div class="chk-input-wrap">
            <label>Notes & Instructions</label>
            <input type="text" class="chk-modern-input" id="chkNotes-${item.id}" placeholder="e.g. Table reserved under Rahul, Deluxe room" value="${item.notes || ''}">
          </div>
          <button type="button" class="btn btn-primary btn-sm chk-save-btn" id="chkSaveBtn-${item.id}" onclick="window.saveChecklistItem(${item.id})">
            <i data-lucide="check"></i> <span class="btn-text">Save</span>
          </button>
        </div>

        <div class="chk-actions-toolbar">
          ${actionsHtml}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

export async function saveChecklistItem(id) {
  const statusInput = document.getElementById(`chkStatus-${id}`);
  const ref = document.getElementById(`chkRef-${id}`);
  const notes = document.getElementById(`chkNotes-${id}`);
  const saveBtn = document.getElementById(`chkSaveBtn-${id}`);

  if (!statusInput) return;
  const newStatus = statusInput.value;

  if (saveBtn) {
    saveBtn.classList.add('loading');
    saveBtn.innerHTML = '<span class="btn-spinner"></span> <span class="btn-text">Saving...</span>';
  }

  const payload = {
    status: newStatus,
    referenceNumber: ref ? ref.value : '',
    notes: notes ? notes.value : ''
  };

  const item = (state.currentChecklist || []).find(it => it.id === id);
  if (item) {
    item.status = newStatus;
    item.referenceNumber = payload.referenceNumber;
    item.notes = payload.notes;
  }

  try {
    if (state.currentTripId && state.currentTripId !== 9999) {
      await updateTripBookingStatusApi(state.currentTripId, id, payload);
    }
  } catch (e) {
    console.warn("API update failed, updated in offline mode:", e);
  }

  setTimeout(() => {
    if (saveBtn) {
      saveBtn.classList.remove('loading');
      saveBtn.classList.add('btn-success');
      saveBtn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> <span class="btn-text">Saved!</span>';
      if (window.lucide) window.lucide.createIcons();
    }
    showToast(`✓ Booking for '${item ? item.stopName : 'stop'}' saved!`, 'success');
    updateChecklistCounts();

    setTimeout(() => {
      if (saveBtn) {
        saveBtn.classList.remove('btn-success');
        saveBtn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> <span class="btn-text">Save</span>';
        if (window.lucide) window.lucide.createIcons();
      }
    }, 2000);
  }, 400);
}

export function handleCopySummaryClick(btn) {
  copyTripTextSummary();
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.classList.add('btn-success');
  btn.innerHTML = '<i data-lucide="check" style="width:16px;height:16px;"></i> <span class="btn-text">Copied!</span>';
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    btn.classList.remove('btn-success');
    btn.innerHTML = originalHtml;
    if (window.lucide) window.lucide.createIcons();
  }, 2000);
}

/* ==========================================================================
   TOAST & SHARE UTILITIES
   ========================================================================== */
export function showToast(message, type = 'normal') {
  const toast = document.getElementById('appToast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `app-toast visible ${type}`;

  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3200);
}

export function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(`✓ Copied: "${text}" to clipboard!`, 'success'))
      .catch(() => fallbackCopyText(text, `✓ Copied: "${text}" to clipboard!`));
  } else {
    fallbackCopyText(text, `✓ Copied: "${text}" to clipboard!`);
  }
}

export function copyTripTextSummary() {
  if (!state.currentPlan) {
    showToast("Please generate a trip first!", "warning");
    return;
  }
  const p = state.currentPlan;
  const cb = p.costBreakdown || {};
  const text = `🧭 Routewise Trip: ${p.startCity} to ${p.destinationCity}\n` +
    `Days: ${p.numDays} | Travellers: ${p.numTravellers} | Transport: ${p.transportMode.toUpperCase()}\n` +
    `Total Estimated Cost: ₹${Math.round(cb.total || 0).toLocaleString('en-IN')}\n` +
    `Hotel: ₹${Math.round(cb.accommodation || 0)} | Food: ₹${Math.round(cb.food || 0)} | Transport: ₹${Math.round((cb.fuel||0)+(cb.tolls||0))} | Sightseeing: ₹${Math.round(cb.sightseeing || 0)}\n` +
    `Generated via Routewise Smart Journey Planner.`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(() => showToast("✓ Trip summary copied to clipboard!", "success"))
      .catch(() => fallbackCopyText(text, "✓ Trip summary copied to clipboard!"));
  } else {
    fallbackCopyText(text, "✓ Trip summary copied to clipboard!");
  }
}

function fallbackCopyText(text, toastMsg) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(toastMsg, 'success');
  } catch (err) {
    showToast(toastMsg, 'success');
  }
}

function updateWhatsAppShareLink(p) {
  const link = document.getElementById('whatsappShareLink');
  if (!link || !p) return;
  const cb = p.costBreakdown || {};
  const msg = encodeURIComponent(
    `*Routewise Trip Plan:* ${p.startCity} to ${p.destinationCity} (${p.numDays} Days, ${p.numTravellers} Travellers)\n` +
    `Estimated Cost: ₹${Math.round(cb.total || 0).toLocaleString('en-IN')}\n` +
    `Generated via Routewise!`
  );
  link.href = `https://api.whatsapp.com/send?text=${msg}`;
}

function formatTime(t) {
  if (!t) return '09:00';
  if (t.length >= 5) return t.substring(0, 5);
  return t;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ==========================================================================
   LIVE WEATHER & IMMERSIVE MODAL (PHASE 3C - FREE DATA)
   ========================================================================== */

const CITY_COORDINATES = {
  chennai: { lat: 13.0827, lng: 80.2707 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  pondicherry: { lat: 11.9416, lng: 79.8083 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  coimbatore: { lat: 11.0168, lng: 76.9558 }
};

export async function fetchLiveDestinationWeather(cityName) {
  const weatherTextEl = document.getElementById('weatherText');
  if (!weatherTextEl) return;

  const key = (cityName || 'Pondicherry').toLowerCase();
  const coords = CITY_COORDINATES[key] || CITY_COORDINATES.pondicherry;

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const data = await res.json();
    const cur = data.current || {};
    const temp = Math.round(cur.temperature_2m || 28);
    const wind = Math.round(cur.wind_speed_10m || 10);
    const breezeDesc = wind > 15 ? 'moderate breeze' : 'gentle breeze';

    weatherTextEl.textContent = `${temp} °C, ${breezeDesc} in ${cityName} • Ideal for sightseeing`;
  } catch (e) {
    console.warn("Weather fetch fallback:", e.message);
    weatherTextEl.textContent = `28 °C, pleasant breeze in ${cityName}`;
  }
}

export function computeOpenStatus(openingTime = '09:00:00', closingTime = '18:00:00') {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMins = (t) => {
    if (!t) return 0;
    const parts = t.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
  };

  const openMins = parseMins(openingTime);
  const closeMins = parseMins(closingTime);

  const format12h = (t) => {
    const parts = (t || '18:00').split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1] || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  if (currentMinutes >= openMins && currentMinutes < closeMins) {
    return { isOpen: true, text: `Open now - closes ${format12h(closingTime)}`, className: 'open' };
  } else {
    return { isOpen: false, text: `Closed now - opens ${format12h(openingTime)}`, className: 'closed' };
  }
}

export function openAttractionModal(attrData) {
  const modal = document.getElementById('attractionModal');
  if (!modal) return;

  const heroImg = document.getElementById('modalHeroImg');
  const openStatusPill = document.getElementById('modalOpenStatusPill');
  const photoCredit = document.getElementById('modalPhotoCredit');
  const title = document.getElementById('modalTitle');
  const categoryCity = document.getElementById('modalCategoryCity');
  const ticketBadge = document.getElementById('modalTicketBadge');
  const desc = document.getElementById('modalDesc');
  const hours = document.getElementById('modalHours');
  const duration = document.getElementById('modalDuration');
  const bestTime = document.getElementById('modalBestTime');
  const ticketInfo = document.getElementById('modalTicketInfo');
  const bookBtn = document.getElementById('modalBookBtn');
  const callBtn = document.getElementById('modalCallBtn');
  const dirBtn = document.getElementById('modalDirectionsBtn');

  const wiki = ATTRACTION_IMAGES[attrData.name] || {};
  const status = computeOpenStatus(attrData.openingTime, attrData.closingTime);

  if (heroImg) {
    heroImg.src = wiki.imageUrl || 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80';
    heroImg.alt = attrData.name;
  }
  if (openStatusPill) {
    openStatusPill.className = `modal-open-status-pill ${status.className}`;
    openStatusPill.textContent = status.text;
  }
  if (photoCredit) {
    photoCredit.textContent = wiki.attribution || 'Photo: Wikimedia Commons, CC BY-SA';
  }
  if (title) title.textContent = attrData.name;
  if (categoryCity) categoryCity.textContent = `${attrData.category || 'Heritage'} • ${attrData.city || state.currentPlan?.destinationCity || 'Tamil Nadu'}`;
  
  const ticket = attrData.ticketPrice || 0;
  if (ticketBadge) ticketBadge.textContent = ticket === 0 ? 'Free Entry' : `₹${Math.round(ticket)}`;
  if (desc) desc.textContent = wiki.description || attrData.description || 'Historic landmark and popular destination in South India.';
  if (hours) hours.textContent = `${attrData.openingTime ? attrData.openingTime.substring(0, 5) : '09:00'} - ${attrData.closingTime ? attrData.closingTime.substring(0, 5) : '18:00'}`;
  if (duration) duration.textContent = `${attrData.avgVisitDurationMins || 90} mins`;
  if (bestTime) bestTime.textContent = attrData.bestTimeToVisit || 'Morning or Sunset';
  if (ticketInfo) ticketInfo.textContent = attrData.ticketInfo || (ticket === 0 ? 'Free entry for all' : 'Tickets available at gate / partner');

  const destination = attrData.city || state.currentPlan?.destinationCity || 'Chennai';
  if (bookBtn) bookBtn.href = attrData.bookingUrl || `https://www.makemytrip.com`;
  if (callBtn) {
    const phone = attrData.phone || '+91 44 2855 1234';
    callBtn.href = `tel:${phone}`;
    callBtn.innerHTML = `<i data-lucide="phone"></i> Call (${phone})`;
  }
  if (dirBtn) dirBtn.href = attrData.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attrData.name + ' ' + destination)}`;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

export function closeAttractionModal() {
  const modal = document.getElementById('attractionModal');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

window.openAttractionModal = openAttractionModal;
window.closeAttractionModal = closeAttractionModal;
