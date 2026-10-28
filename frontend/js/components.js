/**
 * Routewise Frontend - UI Components & Rendering Module
 * Manages Results, Leaflet Map, Route Styles, Checklist & Tabs
 */

import { state } from './state.js';
import { 
  fetchRouteOptionsApi, 
  fetchRouteDetailsApi, 
  fetchTripBookingsApi, 
  updateTripBookingStatusApi 
} from './api.js';

export function renderTripPlan(data) {
  state.currentPlan = data;
  state.currentTripId = data.tripId;

  // Show results section
  const resultsSec = document.getElementById('resultsSection');
  if (resultsSec) resultsSec.classList.add('active');

  // 1. Feasibility Banner
  const banner = document.getElementById('feasibilityBanner');
  const bannerTitle = document.getElementById('feasibilityTitle');
  const bannerMsg = document.getElementById('feasibilityMsg');
  const altCard = document.getElementById('cheapestAltCard');

  if (data.isFeasible) {
    banner.className = 'feasibility-banner banner-success';
    banner.querySelector('.banner-icon-box').innerHTML = '<i data-lucide="check-circle" style="color:#10B981"></i>';
    bannerTitle.textContent = "Itinerary Fits Within Budget!";
    bannerMsg.textContent = data.statusMessage || "All estimated costs fit comfortably within your allocated budget.";
    if (altCard) altCard.classList.add('hidden');
  } else {
    banner.className = 'feasibility-banner banner-warning';
    banner.querySelector('.banner-icon-box').innerHTML = '<i data-lucide="alert-triangle" style="color:#F43F5E"></i>';
    bannerTitle.textContent = "Warning: Budget is Lower than Estimated Costs";
    bannerMsg.textContent = data.statusMessage || "Estimated trip expenses exceed your maximum budget limit.";

    if (data.cheapestAlternative && altCard) {
      altCard.classList.remove('hidden');
      const alt = data.cheapestAlternative;
      document.getElementById('altPrice').textContent = `Min Feasible: ₹${Math.round(alt.suggestedBudget).toLocaleString('en-IN')}`;
      document.getElementById('altSummary').textContent = 
        `To make this trip feasible, consider switching to ${alt.transportMode.toUpperCase()} transport and staying at '${alt.hotelName}'.`;
    }
  }

  // 2. Cost Breakdown Cards
  const cb = data.costBreakdown || {};
  const totalCost = cb.total || 0;
  const budgetMax = cb.budgetMax || data.totalBudgetMax || 0;
  const amountLeft = budgetMax - totalCost;

  document.getElementById('costTotalVal').textContent = `₹${Math.round(totalCost).toLocaleString('en-IN')}`;
  document.getElementById('costTotalSub').textContent = `Budget: ₹${Math.round(budgetMax).toLocaleString('en-IN')} (Left: ₹${Math.round(amountLeft).toLocaleString('en-IN')})`;

  document.getElementById('costStayVal').textContent = `₹${Math.round(cb.accommodation || 0).toLocaleString('en-IN')}`;
  document.getElementById('costFoodVal').textContent = `₹${Math.round(cb.food || 0).toLocaleString('en-IN')}`;
  document.getElementById('costTransVal').textContent = `₹${Math.round((cb.fuel || 0) + (cb.tolls || 0)).toLocaleString('en-IN')}`;
  document.getElementById('costTransSub').textContent = `Fuel ₹${Math.round(cb.fuel || 0)} + Tolls ₹${Math.round(cb.tolls || 0)}`;
  document.getElementById('costSightVal').textContent = `₹${Math.round(cb.sightseeing || 0).toLocaleString('en-IN')}`;

  // 3. Render Sub-Tabs
  renderItineraryTimeline(data.itinerary || []);
  renderHotelsTab(data.selectedHotel, data.rankedHotels || []);
  renderRestaurantsTab(data.recommendedRestaurants || []);
  renderAttractionsTab(data.recommendedAttractions || []);

  // 4. Load Route Options & Map
  if (data.tripId) {
    loadRouteOptionsForTrip(data.tripId);
    loadTripChecklist(data.tripId);
  }

  // 5. Update WhatsApp Share Link
  updateWhatsAppShareLink(data);

  // Switch to Itinerary tab
  switchTab('itineraryTab');
  if (window.lucide) window.lucide.createIcons();

  // Scroll smoothly down to results
  setTimeout(() => {
    resultsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 150);
}

/* ==========================================================================
   DAY-BY-DAY ITINERARY TIMELINE
   ========================================================================== */
export function renderItineraryTimeline(days) {
  const container = document.getElementById('itineraryTimeline');
  if (!container) return;

  if (!days || days.length === 0) {
    container.innerHTML = `<p style="padding:1.5rem;color:var(--text-muted);">No timeline items generated.</p>`;
    return;
  }

  container.innerHTML = days.map(day => `
    <div class="day-container">
      <div class="day-header">
        <span class="day-title">
          <i data-lucide="calendar" style="color:#7C3AED;width:22px;height:22px;"></i>
          ${day.dateLabel || `Day ${day.dayNumber}`}
        </span>
        <span class="day-cost-tag">Day Total: ₹${Math.round(day.dayTotalCost || 0).toLocaleString('en-IN')}</span>
      </div>

      <div class="timeline-items-list">
        ${(day.items || []).map(item => {
          const type = (item.itemType || '').toLowerCase();
          const city = (state.currentPlan && state.currentPlan.destinationCity) ? state.currentPlan.destinationCity : 'Chennai';
          const query = encodeURIComponent(`${item.title} ${city}`);
          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

          let actions = '';
          if (type.includes('hotel')) {
            actions = `
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="map-pin"></i> Maps</a>
              <button type="button" class="partner-btn" onclick="window.switchTab('checklistTab')"><i data-lucide="list-checks"></i> Check & Book</button>
            `;
          } else if (type.includes('meal')) {
            actions = `
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="map-pin"></i> Maps</a>
              <span class="partner-btn call"><i data-lucide="clock"></i> Reserve ${formatTime(item.startTime)}</span>
            `;
          } else if (type.includes('attraction')) {
            actions = `
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="navigation"></i> Directions</a>
              <button type="button" class="partner-btn" onclick="window.switchTab('attractionsTab')"><i data-lucide="info"></i> Info & Rules</button>
            `;
          }

          return `
            <div class="timeline-event-card">
              <div class="event-time-col">
                <span>${formatTime(item.startTime)}</span>
                <span class="duration">${item.durationMinutes || 60}m stay</span>
              </div>
              <div class="event-details-col">
                <h4>${item.title}</h4>
                <p>${item.description || (item.cost > 0 ? `Estimated ₹${Math.round(item.cost)}` : 'Included')}</p>
              </div>
              <div class="event-actions-col">
                ${actions}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function formatTime(t) {
  if (!t) return '09:00';
  if (t.length >= 5) return t.substring(0, 5);
  return t;
}

/* ==========================================================================
   ROUTE STYLES & LEAFLET MAP
   ========================================================================== */
export async function loadRouteOptionsForTrip(tripId) {
  try {
    const multiRoutes = await fetchRouteOptionsApi(tripId);
    state.currentRouteOptions = multiRoutes;
    renderRouteTabs(multiRoutes);
    if (multiRoutes.routes && multiRoutes.routes.length > 0) {
      selectRouteType(multiRoutes.routes[0].routeType);
    }
  } catch (e) {
    console.error("Error loading route options:", e);
  }
}

function renderRouteTabs(multi) {
  const container = document.getElementById('routeStylesContainer');
  if (!container || !multi.routes) return;

  container.innerHTML = multi.routes.map(r => `
    <div class="route-style-tab ${r.routeType === state.currentRouteType ? 'active' : ''}" 
         onclick="window.selectRouteType('${r.routeType}')">
      <h4>${capitalize(r.routeType)}</h4>
      <div class="route-style-metric">${r.totalDistanceKm} km • ${r.totalDurationMinutes} mins</div>
      <div style="font-size:0.75rem;color:#7C3AED;font-weight:700;margin-top:0.25rem;">
        ₹${Math.round(r.totalCost)} (Fuel + Tolls)
      </div>
    </div>
  `).join('');
}

export function selectRouteType(type) {
  state.currentRouteType = type;
  document.querySelectorAll('.route-style-tab').forEach(tab => {
    tab.classList.toggle('active', tab.querySelector('h4')?.textContent.toLowerCase() === type.toLowerCase());
  });

  const route = (state.currentRouteOptions.routes || []).find(r => r.routeType === type);
  if (route) {
    renderLeafletMap(route);
  }
}

export function renderLeafletMap(route) {
  const mapDiv = document.getElementById('leafletMapContainer');
  if (!mapDiv) return;

  if (!state.leafletMap) {
    state.leafletMap = L.map('leafletMapContainer', { zoomControl: true }).setView([12.9716, 79.5], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.leafletMap);
  }

  // Clear existing markers & polyline
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
      const marker = L.marker(latlng).addTo(state.leafletMap)
        .bindPopup(`<b>${idx + 1}. ${stop.name}</b><br>${stop.stopType}`);
      state.mapMarkers.push(marker);
    }
  });

  if (coords.length > 1) {
    state.mapPolyline = L.polyline(coords, {
      color: '#7C3AED',
      weight: 5,
      opacity: 0.85,
      dashArray: route.routeType === 'scenic' ? '8, 8' : null
    }).addTo(state.leafletMap);

    state.leafletMap.fitBounds(state.mapPolyline.getBounds(), { padding: [50, 50] });
  }

  setTimeout(() => {
    if (state.leafletMap) state.leafletMap.invalidateSize();
  }, 200);
}

/* ==========================================================================
   BOOKING CHECKLIST & ACTIONS
   ========================================================================== */
export async function loadTripChecklist(tripId) {
  try {
    const items = await fetchTripBookingsApi(tripId);
    state.currentChecklist = items;
    renderChecklist(items);
  } catch (e) {
    console.error("Checklist error:", e);
  }
}

export function renderChecklist(items) {
  const container = document.getElementById('checklistItemsList');
  if (!container) return;

  const total = items.length;
  const booked = items.filter(it => it.status === 'Booked').length;
  const pending = items.filter(it => it.status === 'Call pending').length;
  const unbooked = items.filter(it => it.status === 'Not booked').length;

  document.getElementById('chkTotalCount').textContent = total;
  document.getElementById('chkBookedCount').textContent = booked;
  document.getElementById('chkPendingCount').textContent = pending;
  document.getElementById('chkUnbookedCount').textContent = unbooked;

  const bar = document.getElementById('chkProgressBar');
  if (bar) bar.style.width = total > 0 ? `${(booked / total) * 100}%` : '0%';

  const tabBadge = document.getElementById('checklistTabBadge');
  if (tabBadge) tabBadge.textContent = `${booked}/${total}`;

  container.innerHTML = items.map(item => {
    const statusClass = item.status === 'Booked' ? 'booked' : item.status === 'Call pending' ? 'pending' : 'unbooked';
    const bo = item.bookingOptions || {};
    const links = bo.links || [];

    const linkBtns = links.map(l => `
      <a href="${l.url}" target="_blank" rel="noopener noreferrer" class="partner-btn ${l.provider}">
        ${l.label}
      </a>
    `).join('');

    return `
      <div class="checklist-card ${statusClass}" id="chkCard-${item.id}">
        <div class="chk-top-row">
          <div>
            <h4 style="font-size:1.1rem;font-weight:700;">${item.stopName}</h4>
            <span style="font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;font-weight:600;">
              ${item.stopType} • ${bo.ticketInfo || bo.openingHours || 'Stop in Itinerary'}
            </span>
          </div>

          <select class="chk-status-select" id="chkStatus-${item.id}">
            <option value="Not booked" ${item.status === 'Not booked' ? 'selected' : ''}>🔴 Not booked</option>
            <option value="Call pending" ${item.status === 'Call pending' ? 'selected' : ''}>🟡 Call pending</option>
            <option value="Booked" ${item.status === 'Booked' ? 'selected' : ''}>🟢 Booked</option>
          </select>
        </div>

        <div class="chk-inputs-row">
          <div class="chk-input-wrap">
            <label>Confirmation / Ref #</label>
            <input type="text" id="chkRef-${item.id}" placeholder="e.g. MMT-9821 / Confirmed" value="${item.referenceNumber || ''}">
          </div>
          <div class="chk-input-wrap">
            <label>Notes & Instructions</label>
            <input type="text" id="chkNotes-${item.id}" placeholder="e.g. Table reserved under Rahul, Deluxe room" value="${item.notes || ''}">
          </div>
          <button type="button" class="chk-save-btn" onclick="window.saveChecklistItem(${item.id})">
            <i data-lucide="check" style="width:16px;height:16px;"></i> Save
          </button>
        </div>

        <div class="chk-actions-toolbar">
          ${bo.phone ? `<a href="tel:${bo.phone}" class="partner-btn call"><i data-lucide="phone"></i> Call (${bo.phone})</a>` : ''}
          ${bo.phone ? `<button type="button" class="partner-btn" onclick="window.copyToClipboard('${bo.phone}')"><i data-lucide="copy"></i> Copy</button>` : ''}
          ${linkBtns}
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

export async function saveChecklistItem(id) {
  const select = document.getElementById(`chkStatus-${id}`);
  const ref = document.getElementById(`chkRef-${id}`);
  const notes = document.getElementById(`chkNotes-${id}`);

  if (!select) return;

  const payload = {
    status: select.value,
    referenceNumber: ref ? ref.value : '',
    notes: notes ? notes.value : ''
  };

  try {
    await updateTripBookingStatusApi(state.currentTripId, id, payload);
    const card = document.getElementById(`chkCard-${id}`);
    if (card) {
      card.classList.remove('booked', 'pending', 'unbooked');
      card.classList.add(select.value === 'Booked' ? 'booked' : select.value === 'Call pending' ? 'pending' : 'unbooked');
    }
    showToast(`✓ Booking status updated to '${select.value}'!`, 'success');
    loadTripChecklist(state.currentTripId);
  } catch (e) {
    showToast(`Failed to update booking: ${e.message}`, 'error');
  }
}

/* ==========================================================================
   HOTELS, RESTAURANTS & ATTRACTIONS TABS
   ========================================================================== */
export function renderHotelsTab(selected, ranked) {
  const container = document.getElementById('hotelsContainer');
  if (!container) return;
  const list = [selected, ...(ranked || [])].filter(Boolean);
  container.innerHTML = list.map(h => `
    <div class="checklist-card" style="border-left-color:#F43F5E;">
      <div class="chk-top-row">
        <div>
          <h4>${h.name}</h4>
          <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">
            ₹${Math.round(h.pricePerNight).toLocaleString('en-IN')}/night • Rating: ⭐ ${h.rating || 4.2} • ${h.tier || 'Standard'}
          </p>
        </div>
      </div>
      <div class="chk-actions-toolbar">
        ${h.phone ? `<a href="tel:${h.phone}" class="partner-btn call"><i data-lucide="phone"></i> Call (${h.phone})</a>` : ''}
        ${h.bookingUrl ? `<a href="${h.bookingUrl}" target="_blank" rel="noopener noreferrer" class="partner-btn mmt">MakeMyTrip</a>` : ''}
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.name)}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="map-pin"></i> Google Maps</a>
      </div>
    </div>
  `).join('');
  if (window.lucide) window.lucide.createIcons();
}

export function renderRestaurantsTab(restaurants) {
  const container = document.getElementById('restaurantsContainer');
  if (!container) return;
  container.innerHTML = (restaurants || []).map(r => `
    <div class="checklist-card" style="border-left-color:#10B981;">
      <div class="chk-top-row">
        <div>
          <h4>${r.name}</h4>
          <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">
            ${r.cuisine || 'Regional Specialities'} • ~₹${Math.round(r.approxCostForTwo)} for two • Rating: ⭐ ${r.rating || 4.3}
          </p>
        </div>
      </div>
      <div class="chk-actions-toolbar">
        ${r.phone ? `<a href="tel:${r.phone}" class="partner-btn call"><i data-lucide="phone"></i> Call (${r.phone})</a>` : ''}
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name)}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="map-pin"></i> Google Maps</a>
        <a href="https://www.zomato.com" target="_blank" rel="noopener noreferrer" class="partner-btn zomato">Zomato</a>
      </div>
    </div>
  `).join('');
  if (window.lucide) window.lucide.createIcons();
}

export function renderAttractionsTab(attractions) {
  const container = document.getElementById('attractionsContainer');
  if (!container) return;
  container.innerHTML = (attractions || []).map(a => `
    <div class="checklist-card" style="border-left-color:#7C3AED;">
      <div class="chk-top-row">
        <div>
          <h4>${a.name}</h4>
          <p style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">
            ${a.category || 'Sightseeing'} • Hours: ${a.openingTime || '09:00'} - ${a.closingTime || '18:00'} • Entry: ₹${Math.round(a.ticketPrice || 0)}
          </p>
        </div>
      </div>
      <div class="chk-actions-toolbar">
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.name)}" target="_blank" rel="noopener noreferrer" class="partner-btn gmaps"><i data-lucide="navigation"></i> Directions</a>
        ${a.ticketPrice > 0 ? `<span class="partner-btn" style="background:#EDE9FE;color:#7C3AED;">🎟️ Tickets: ₹${Math.round(a.ticketPrice)}</span>` : '<span class="partner-btn" style="background:#D1FAE5;color:#065F46;">✓ Free Entry</span>'}
      </div>
    </div>
  `).join('');
  if (window.lucide) window.lucide.createIcons();
}

/* ==========================================================================
   TOAST & SHARE ACTIONS
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
  navigator.clipboard.writeText(text).then(() => {
    showToast(`✓ Copied: "${text}" to clipboard!`, 'success');
  });
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

  navigator.clipboard.writeText(text).then(() => {
    showToast("✓ Trip summary copied to clipboard!", "success");
  });
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

export function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  if (tabId === 'routesTab' && state.leafletMap) {
    setTimeout(() => state.leafletMap.invalidateSize(), 200);
  }
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
