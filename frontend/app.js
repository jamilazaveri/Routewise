/**
 * Routewise Frontend Application
 * Interacts with Spring Boot (http://localhost:8080/api)
 * Supports dynamic budget reallocation, greedy itinerary generation, and cost breakdown
 */

const API_BASE = "http://localhost:8080/api";
const PYTHON_API = "http://localhost:8000";

// Global trip state
let currentPlan = null;
let reallocateTimer = null;

document.addEventListener("DOMContentLoaded", () => {
  initDefaults();
  setupEventListeners();
  checkServicesHealth();
});

function initDefaults() {
  // Set default start date to next Saturday
  const today = new Date();
  const nextSat = new Date();
  nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
  const dateInput = document.getElementById("startDate");
  if (dateInput) {
    dateInput.value = nextSat.toISOString().split("T")[0];
  }
  updateSliderLabels();
}

function setupEventListeners() {
  // Trip submission form
  const form = document.getElementById("tripForm");
  if (form) {
    form.addEventListener("submit", handleTripSubmit);
  }

  // City swap button
  const swapBtn = document.getElementById("swapCitiesBtn");
  if (swapBtn) {
    swapBtn.addEventListener("click", swapCities);
  }

  // Budget slider dynamic listeners
  const sliders = document.querySelectorAll(".cat-slider");
  sliders.forEach(slider => {
    slider.addEventListener("input", onSliderChange);
  });

  // Total budget input listener
  const budgetInput = document.getElementById("totalBudgetMax");
  if (budgetInput) {
    budgetInput.addEventListener("input", () => {
      updateSliderLabels();
    });
  }
}

function swapCities() {
  const startSelect = document.getElementById("startCity");
  const destSelect = document.getElementById("destinationCity");
  const temp = startSelect.value;
  startSelect.value = destSelect.value;
  destSelect.value = temp;
}

function stepNumber(inputId, delta) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const current = parseInt(input.value, 10) || 1;
  const min = parseInt(input.min, 10) || 1;
  const max = parseInt(input.max, 10) || 50;
  const next = Math.max(min, Math.min(max, current + delta));
  input.value = next;
}

function setBudget(val) {
  const budgetInput = document.getElementById("totalBudgetMax");
  if (budgetInput) {
    budgetInput.value = val;
    updateSliderLabels();
  }
}

/**
 * Feature 5: Budget Re-allocation logic
 * Triggered on slider drag with debounce
 */
function onSliderChange(e) {
  const changedCategory = e.target.getAttribute("data-category");
  const newShare = parseFloat(e.target.value);

  clearTimeout(reallocateTimer);
  reallocateTimer = setTimeout(() => {
    performReallocation(changedCategory, newShare);
  }, 100);
}

async function performReallocation(changedCategory, newShare) {
  const totalBudget = parseFloat(document.getElementById("totalBudgetMax").value) || 18000;
  
  const currentShares = {
    accommodation: parseFloat(document.getElementById("sliderAccommodation").value),
    food: parseFloat(document.getElementById("sliderFood").value),
    transport: parseFloat(document.getElementById("sliderTransport").value),
    sightseeing: parseFloat(document.getElementById("sliderSightseeing").value)
  };

  const payload = {
    changedCategory: changedCategory,
    newShare: newShare,
    currentShares: currentShares,
    totalBudgetMax: totalBudget
  };

  try {
    // Attempt backend API call to Spring Boot (which routes to FastAPI)
    const res = await fetch(`${API_BASE}/trips/reallocate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      applyReallocationResults(data.newShares, data.categoryBudgets, data.explanation);
      return;
    }
  } catch (err) {
    console.warn("Backend reallocate call failed, using client fallback:", err);
  }

  // Client-side fallback calculation
  clientSideReallocate(changedCategory, newShare, totalBudget);
}

function clientSideReallocate(cat, newShare, totalBudget) {
  const sliders = {
    accommodation: document.getElementById("sliderAccommodation"),
    food: document.getElementById("sliderFood"),
    transport: document.getElementById("sliderTransport"),
    sightseeing: document.getElementById("sliderSightseeing")
  };

  const categories = ["accommodation", "food", "transport", "sightseeing"];
  const otherCats = categories.filter(c => c !== cat);
  const remainingShare = 100.0 - newShare;

  const otherCurrentSum = otherCats.reduce((acc, c) => acc + parseFloat(sliders[c].value), 0);
  const ratio = otherCurrentSum > 0 ? (remainingShare / otherCurrentSum) : (1 / 3);

  otherCats.forEach(c => {
    const val = Math.round(parseFloat(sliders[c].value) * ratio * 10) / 10;
    sliders[c].value = val;
  });

  updateSliderLabels();

  const msgDiv = document.getElementById("reallocationMsg");
  if (msgDiv) {
    msgDiv.textContent = `Adjusted ${cat} to ${newShare}%. Remaining ${remainingShare.toFixed(1)}% redistributed.`;
  }
}

function applyReallocationResults(newShares, catBudgets, explanation) {
  if (newShares.accommodation !== undefined) document.getElementById("sliderAccommodation").value = newShares.accommodation;
  if (newShares.food !== undefined) document.getElementById("sliderFood").value = newShares.food;
  if (newShares.transport !== undefined) document.getElementById("sliderTransport").value = newShares.transport;
  if (newShares.sightseeing !== undefined) document.getElementById("sliderSightseeing").value = newShares.sightseeing;

  updateSliderLabels(catBudgets);

  const msgDiv = document.getElementById("reallocationMsg");
  if (msgDiv && explanation) {
    msgDiv.textContent = explanation;
  }
}

function updateSliderLabels(customBudgets = null) {
  const total = parseFloat(document.getElementById("totalBudgetMax").value) || 18000;
  
  const acc = parseFloat(document.getElementById("sliderAccommodation").value);
  const food = parseFloat(document.getElementById("sliderFood").value);
  const trans = parseFloat(document.getElementById("sliderTransport").value);
  const sight = parseFloat(document.getElementById("sliderSightseeing").value);

  const accAmt = customBudgets ? customBudgets.accommodation : Math.round(total * (acc / 100));
  const foodAmt = customBudgets ? customBudgets.food : Math.round(total * (food / 100));
  const transAmt = customBudgets ? customBudgets.transport : Math.round(total * (trans / 100));
  const sightAmt = customBudgets ? customBudgets.sightseeing : Math.round(total * (sight / 100));

  document.getElementById("shareAccVal").textContent = `${acc}% (₹${accAmt.toLocaleString("en-IN")})`;
  document.getElementById("shareFoodVal").textContent = `${food}% (₹${foodAmt.toLocaleString("en-IN")})`;
  document.getElementById("shareTransVal").textContent = `${trans}% (₹${transAmt.toLocaleString("en-IN")})`;
  document.getElementById("shareSightVal").textContent = `${sight}% (₹${sightAmt.toLocaleString("en-IN")})`;

  const totalShare = Math.round(acc + food + trans + sight);
  const pill = document.getElementById("totalSharesPill");
  if (pill) {
    pill.textContent = `Total: ${totalShare}%`;
    pill.style.background = (totalShare === 100) ? "#dcfce7" : "#fee2e2";
    pill.style.color = (totalShare === 100) ? "#166534" : "#991b1b";
  }
}

/**
 * Handle Trip Generation Submission
 */
async function handleTripSubmit(e) {
  e.preventDefault();

  const startCity = document.getElementById("startCity").value;
  const destCity = document.getElementById("destinationCity").value;

  if (startCity.toLowerCase() === destCity.toLowerCase()) {
    alert("Start location and destination city cannot be identical. Please select different cities.");
    return;
  }

  const numDays = parseInt(document.getElementById("numDays").value, 10);
  const numTravellers = parseInt(document.getElementById("numTravellers").value, 10);
  const transportMode = document.querySelector('input[name="transportMode"]:checked').value;
  const totalBudgetMax = parseFloat(document.getElementById("totalBudgetMax").value);
  const totalBudgetMin = Math.round(totalBudgetMax * 0.7);

  const payload = {
    startCity: startCity,
    destinationCity: destCity,
    numDays: numDays,
    numTravellers: numTravellers,
    transportMode: transportMode,
    totalBudgetMin: totalBudgetMin,
    totalBudgetMax: totalBudgetMax,
    shareAccommodation: parseFloat(document.getElementById("sliderAccommodation").value),
    shareFood: parseFloat(document.getElementById("sliderFood").value),
    shareTransport: parseFloat(document.getElementById("sliderTransport").value),
    shareSightseeing: parseFloat(document.getElementById("sliderSightseeing").value)
  };

  showLoading(true);

  try {
    const res = await fetch(`${API_BASE}/trips/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: "Server error" }));
      throw new Error(errData.message || `Request failed with code ${res.status}`);
    }

    const data = await res.json();
    currentPlan = data;
    renderTripPlan(data);
  } catch (err) {
    console.error("Trip planning error:", err);
    alert(`Could not generate trip plan: ${err.message}. Ensure backend is running.`);
  } finally {
    showLoading(false);
  }
}

function showLoading(isLoading) {
  const emptyState = document.getElementById("emptyState");
  const loadingState = document.getElementById("loadingState");
  const planContent = document.getElementById("planContent");

  if (isLoading) {
    emptyState.classList.add("hidden");
    planContent.classList.add("hidden");
    loadingState.classList.remove("hidden");
  } else {
    loadingState.classList.add("hidden");
  }
}

/**
 * Render the optimized trip response
 */
function renderTripPlan(data) {
  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("planContent").classList.remove("hidden");

  // 1. Feasibility Banner
  const banner = document.getElementById("feasibilityBanner");
  const bannerTitle = document.getElementById("feasibilityTitle");
  const bannerMsg = document.getElementById("feasibilityMsg");
  const altCard = document.getElementById("cheapestAlternativeCard");

  if (data.isFeasible) {
    banner.className = "banner banner-success";
    banner.querySelector(".banner-icon").textContent = "✓";
    bannerTitle.textContent = "Itinerary Fits Within Budget!";
    bannerMsg.textContent = data.statusMessage || "All estimated costs fit comfortably within your allocated budget.";
    altCard.classList.add("hidden");
  } else {
    // Feature 6: Warning if budget is too low
    banner.className = "banner banner-warning";
    banner.querySelector(".banner-icon").textContent = "⚠️";
    bannerTitle.textContent = "Warning: Budget is Lower than Estimated Costs";
    bannerMsg.textContent = data.statusMessage || "Estimated trip expenses exceed your maximum budget limit.";

    // Render Cheapest Feasible Alternative
    if (data.cheapestAlternative) {
      altCard.classList.remove("hidden");
      const alt = data.cheapestAlternative;
      document.getElementById("altPrice").textContent = `Min Feasible: ₹${Math.round(alt.suggestedBudget).toLocaleString("en-IN")}`;
      document.getElementById("altSummary").textContent = 
        `To make this trip feasible, consider switching to ${alt.transportMode.toUpperCase()} transport and staying at '${alt.hotelName}' (${alt.hotelTier} tier).`;

      const tipsList = document.getElementById("altTipsList");
      tipsList.innerHTML = (alt.savingsTips || []).map(tip => `<li>${tip}</li>`).join("");
    } else {
      altCard.classList.add("hidden");
    }
  }

  // 2. Cost Breakdown Statistics
  const cb = data.costBreakdown || {};
  const totalCost = cb.total || 0;
  const budgetMax = cb.budgetMax || data.totalBudgetMax || 0;
  const amountLeft = cb.amountLeft !== undefined ? cb.amountLeft : (budgetMax - totalCost);

  document.getElementById("totalCostDisplay").textContent = `₹${Math.round(totalCost).toLocaleString("en-IN")}`;
  document.getElementById("budgetMaxDisplay").textContent = `₹${Math.round(budgetMax).toLocaleString("en-IN")}`;

  const leftDisplay = document.getElementById("amountLeftDisplay");
  leftDisplay.textContent = `₹${Math.round(amountLeft).toLocaleString("en-IN")}`;
  if (amountLeft < 0) {
    leftDisplay.className = "stat-value text-danger";
    document.getElementById("amountLeftLabel").textContent = "Budget Deficit";
  } else {
    leftDisplay.className = "stat-value text-success";
    document.getElementById("amountLeftLabel").textContent = "Amount Left";
  }

  // Route pills
  document.getElementById("routeDistance").textContent = `${data.routeDistanceKm || 0} km (one-way)`;
  document.getElementById("routeToll").textContent = `₹${Math.round(data.routeTollCost || 0).toLocaleString("en-IN")} one-way`;
  document.getElementById("routeHighway").textContent = data.highwayName || "National Highway";
  document.getElementById("travellersDisplay").textContent = data.numTravellers || 1;
  document.getElementById("roomsDisplay").textContent = data.roomsNeeded || 1;

  // Category breakdown cards
  document.getElementById("costAcc").textContent = `₹${Math.round(cb.accommodation || 0).toLocaleString("en-IN")}`;
  document.getElementById("hotelNameSub").textContent = data.selectedHotel ? data.selectedHotel.name : "Budget Stay";

  document.getElementById("costFood").textContent = `₹${Math.round(cb.food || 0).toLocaleString("en-IN")}`;
  document.getElementById("costTransport").textContent = `₹${Math.round((cb.fuel || 0) + (cb.tolls || 0)).toLocaleString("en-IN")}`;
  document.getElementById("transSub").textContent = `Fuel ₹${Math.round(cb.fuel || 0)} + Tolls ₹${Math.round(cb.tolls || 0)}`;

  document.getElementById("costSight").textContent = `₹${Math.round(cb.sightseeing || 0).toLocaleString("en-IN")}`;
  document.getElementById("costMisc").textContent = `₹${Math.round(cb.miscellaneous || 0).toLocaleString("en-IN")}`;

  // 3. Render Day-by-Day Itinerary Timeline
  renderItineraryTimeline(data.itinerary || []);

  // 4. Render Hotels
  renderHotelsTab(data.selectedHotel, data.rankedHotels || []);

  // 5. Render Restaurants
  renderRestaurantsTab(data.recommendedRestaurants || []);

  // 6. Render Attractions
  renderAttractionsTab(data.recommendedAttractions || []);

  // 7. Load Route Styles & Map for this Trip
  if (data.tripId) {
    loadRouteOptionsForTrip(data.tripId);
  }

  // Reset tab to Itinerary
  switchTab("itineraryTab");
}

function renderItineraryTimeline(days) {
  const container = document.getElementById("itineraryTimeline");
  if (!days || days.length === 0) {
    container.innerHTML = "<p>No itinerary items available.</p>";
    return;
  }

  container.innerHTML = days.map(day => `
    <div class="day-container">
      <div class="day-header">
        <span class="day-title">📅 ${day.dateLabel || `Day ${day.dayNumber}`}</span>
        <span class="day-cost-tag">Day Total: ₹${Math.round(day.dayTotalCost || 0).toLocaleString("en-IN")}</span>
      </div>
      <div class="events-list">
        ${(day.items || []).map(item => `
          <div class="event-card">
            <div class="event-time">
              ${formatTime(item.startTime)} - ${formatTime(item.endTime)}
            </div>
            <div class="event-info">
              <h5>${getItemIcon(item.itemType)} ${item.title}</h5>
              <p>${item.notes || ""}</p>
            </div>
            <div class="event-cost-pill">
              ${item.cost > 0 ? `₹${Math.round(item.cost).toLocaleString("en-IN")}` : `<span style="color:#10b981;font-weight:700">Free</span>`}
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function formatTime(t) {
  if (!t) return "00:00";
  return t.substring(0, 5);
}

function getItemIcon(type) {
  switch (type) {
    case "travel": return "🚗";
    case "hotel_checkin": return "🏨";
    case "meal": return "🍽️";
    case "attraction": return "🏛️";
    default: return "📍";
  }
}

function renderHotelsTab(selectedHotel, rankedHotels) {
  const container = document.getElementById("hotelsList");
  const list = (rankedHotels && rankedHotels.length > 0) 
    ? rankedHotels.map(rh => rh.hotel) 
    : (selectedHotel ? [selectedHotel] : []);

  if (list.length === 0) {
    container.innerHTML = "<p>No hotel data available for this destination.</p>";
    return;
  }

  container.innerHTML = list.map(h => {
    const isSelected = selectedHotel && selectedHotel.id === h.id;
    return `
      <div class="rec-card ${isSelected ? "selected" : ""}">
        <div class="rec-badge-row">
          <span class="tag-badge">${h.tier || "Standard"}</span>
          <span class="rating-badge">★ ${h.rating}</span>
        </div>
        <div class="rec-body">
          <h4>${h.name} ${isSelected ? "<span style='color:var(--primary);font-size:0.8rem'>(Selected)</span>" : ""}</h4>
          <p>${h.amenities || "WiFi, AC, Clean Rooms"}</p>
          <p style="margin-top:4px;font-size:0.75rem;color:#64748b;">📍 ${h.address || ""}</p>
        </div>
        <div class="rec-footer">
          <div>
            <span class="rec-price-label">Price per night</span>
            <div class="rec-price">₹${Math.round(h.pricePerNight).toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function renderRestaurantsTab(restaurants) {
  const container = document.getElementById("restaurantsList");
  if (!restaurants || restaurants.length === 0) {
    container.innerHTML = "<p>No restaurant recommendations found.</p>";
    return;
  }

  container.innerHTML = restaurants.map(r => `
    <div class="rec-card">
      <div class="rec-badge-row">
        <span class="tag-badge">${r.mealType || "All Meals"}</span>
        <span class="rating-badge">★ ${r.rating}</span>
      </div>
      <div class="rec-body">
        <h4>${r.name}</h4>
        <p>Cuisine: <strong>${r.cuisine}</strong></p>
        <p style="margin-top:4px;font-size:0.75rem;color:#64748b;">📍 ${r.address || ""}</p>
      </div>
      <div class="rec-footer">
        <div>
          <span class="rec-price-label">Avg cost / person</span>
          <div class="rec-price">₹${Math.round(r.avgCostPerPerson).toLocaleString("en-IN")}</div>
        </div>
      </div>
    </div>
  `).join("");
}

function renderAttractionsTab(attractions) {
  const container = document.getElementById("attractionsList");
  if (!attractions || attractions.length === 0) {
    container.innerHTML = "<p>No attractions found.</p>";
    return;
  }

  container.innerHTML = attractions.map(a => `
    <div class="rec-card">
      <div class="rec-badge-row">
        <span class="tag-badge">${a.category || "Sightseeing"}</span>
        <span class="rating-badge">★ ${a.rating}</span>
      </div>
      <div class="rec-body">
        <h4>${a.name}</h4>
        <p>${a.description || ""}</p>
        <p style="margin-top:6px;font-size:0.75rem;color:#475569;">
          🕒 Timings: ${formatTime(a.openingTime)} - ${formatTime(a.closingTime)} • Duration: ${a.avgVisitDurationMins || 90}m
        </p>
      </div>
      <div class="rec-footer">
        <div>
          <span class="rec-price-label">Ticket Entry</span>
          <div class="rec-price">${a.ticketPrice > 0 ? `₹${Math.round(a.ticketPrice).toLocaleString("en-IN")}` : "<span style='color:#10b981'>Free</span>"}</div>
        </div>
      </div>
    </div>
  `).join("");
}

function switchTab(tabId) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  const targetPane = document.getElementById(tabId);
  if (targetPane) targetPane.classList.add("active");

  const matchingBtn = Array.from(document.querySelectorAll(".tab-btn")).find(b => b.getAttribute("onclick")?.includes(tabId));
  if (matchingBtn) matchingBtn.classList.add("active");

  if (tabId === "historyTab") {
    loadSavedTrips();
  }

  if (tabId === "routesTab") {
    setTimeout(() => {
      if (leafletMap) {
        leafletMap.invalidateSize();
      }
    }, 150);
  }
}

async function loadSavedTrips() {
  const list = document.getElementById("savedTripsList");
  list.innerHTML = "<p>Loading past trips...</p>";

  try {
    const res = await fetch(`${API_BASE}/trips`);
    if (!res.ok) throw new Error("Could not fetch trips");
    const trips = await res.json();

    if (!trips || trips.length === 0) {
      list.innerHTML = "<p>No saved trips found yet. Generate your first trip!</p>";
      return;
    }

    list.innerHTML = trips.map(t => `
      <div class="trip-item-card">
        <div>
          <h4 style="font-weight:700;">${t.tripName}</h4>
          <p style="font-size:0.8rem;color:#64748b;">
            ${t.startCity?.name || "Origin"} ➔ ${t.destinationCity?.name || "Destination"} • ${t.numDays} Days • ${t.numTravellers} Travellers (${t.transportMode.toUpperCase()})
          </p>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800;color:var(--primary);">₹${Math.round(t.totalEstimatedCost || 0).toLocaleString("en-IN")}</div>
          <span style="font-size:0.72rem;color:${t.isFeasible ? '#10b981' : '#f59e0b'};font-weight:700;">
            ${t.isFeasible ? "✓ Feasible" : "⚠️ Over Budget"}
          </span>
        </div>
      </div>
    `).join("");
  } catch (err) {
    list.innerHTML = `<p style="color:#ef4444;">Failed to load saved trips: ${err.message}</p>`;
  }
}

async function checkServicesHealth() {
  // Check Spring Boot
  const backendBadge = document.getElementById("backendStatus");
  try {
    const res = await fetch(`${API_BASE}/cities`, { method: "GET" });
    if (res.ok) {
      backendBadge.classList.add("online");
    }
  } catch (e) {
    backendBadge.classList.remove("online");
  }

  // Check Python
  const pythonBadge = document.getElementById("pythonStatus");
  try {
    const res = await fetch(`${PYTHON_API}/health`, { method: "GET" });
    if (res.ok) {
      pythonBadge.classList.add("online");
    }
  } catch (e) {
    pythonBadge.classList.remove("online");
  }
}


/* =========================================================
   Route Planning, Multi-Style Routing & Leaflet Map Logic
   ========================================================= */

let currentMultiRoutes = null;
let currentSelectedRouteType = "fastest";
let leafletMap = null;
let mapMarkersGroup = null;
let mapPolylineGroup = null;

const ROUTE_FORMULAS = {
  fastest: "Optimization Objective: Minimum Travel Time via express highways & bypasses (Weight = travel_time)",
  shortest: "Optimization Objective: Minimum Physical Distance (Weight = road_distance)",
  cheapest: "Optimization Objective: Minimum Fuel & Toll Cost, strictly avoiding toll roads (Weight = fuel + tolls)",
  scenic: "Optimization Objective: Coastal roads, lakes, parks & heritage quarters (Weight = distance × (1 - scenic_score), max 25% detour cap)",
  easiest: "Optimization Objective: Fewer turns, fewer complex junctions, wider main avenues (Weight = travel_time + turn_penalty + congestion_penalty)"
};

const ROUTE_COLORS = {
  fastest: "#2563eb",   // Blue
  shortest: "#059669",  // Emerald
  cheapest: "#d97706",  // Amber
  scenic: "#0284c7",    // Sea Blue / Cyan
  easiest: "#7c3aed"    // Purple
};

/**
 * Loads route options for a trip from backend
 */
async function loadRouteOptionsForTrip(tripId) {
  if (!tripId && currentPlan) {
    tripId = currentPlan.tripId;
  }
  if (!tripId) return;

  try {
    const res = await fetch(`${API_BASE}/trips/routes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: tripId })
    });

    if (!res.ok) {
      console.warn("Could not load route options from backend, status:", res.status);
      return;
    }

    const data = await res.json();
    currentMultiRoutes = data;

    // Update Route Type Cards metrics
    updateRouteCardsUI(data);

    // Update Side-by-Side Comparison Table
    updateRouteComparisonTable(data.comparison || []);

    // Select the currently chosen route type or default to 'fastest'
    selectRouteType(currentSelectedRouteType || "fastest");
  } catch (err) {
    console.error("Error loading route options:", err);
  }
}

/**
 * Updates top cards for all 5 styles
 */
function updateRouteCardsUI(multiRoutes) {
  if (!multiRoutes || !multiRoutes.routes) return;

  const routes = multiRoutes.routes;
  const types = ["fastest", "shortest", "cheapest", "scenic", "easiest"];

  types.forEach(type => {
    const r = routes[type];
    if (r) {
      const tagEl = document.getElementById(`tag-${type}`);
      const timeEl = document.getElementById(`card-time-${type}`);
      const distEl = document.getElementById(`card-dist-${type}`);
      const costEl = document.getElementById(`card-cost-${type}`);

      if (tagEl && r.tag) tagEl.textContent = r.tag.replace(/^[^\w]+/, "").trim() || r.tag;
      if (timeEl) timeEl.textContent = `${r.totalTimeMins} mins`;
      if (distEl) distEl.textContent = `${r.totalDistanceKm} km`;
      if (costEl) costEl.textContent = `₹${Math.round(r.totalCost)}`;
    }
  });
}

/**
 * Updates the side-by-side comparison table
 */
function updateRouteComparisonTable(comparisons) {
  const tbody = document.getElementById("comparisonTableBody");
  if (!tbody) return;

  if (!comparisons || comparisons.length === 0) {
    tbody.innerHTML = "<tr><td colspan='10'>No route comparison data available.</td></tr>";
    return;
  }

  tbody.innerHTML = comparisons.map(c => `
    <tr id="comp-row-${c.routeType}" class="${c.routeType === currentSelectedRouteType ? 'active-row' : ''}">
      <td><strong>${c.title || c.routeType.toUpperCase()}</strong></td>
      <td><span class="rtc-tag">${c.routeType.toUpperCase()}</span></td>
      <td>${c.distanceKm} km</td>
      <td>${c.timeMins} mins</td>
      <td>₹${Math.round(c.fuelCost)}</td>
      <td>₹${Math.round(c.tollCost)}</td>
      <td><strong>₹${Math.round(c.totalCost)}</strong></td>
      <td><span style="color:#0284c7;font-weight:700;">★ ${(c.scenicScore || 0.5).toFixed(2)}</span></td>
      <td>${c.stopsCount} stops</td>
      <td>
        <button type="button" class="table-btn" onclick="selectRouteType('${c.routeType}')">View Route</button>
      </td>
    </tr>
  `).join("");
}

/**
 * Switch active route type and re-render map, timeline, and banners
 */
function selectRouteType(type) {
  currentSelectedRouteType = type;

  // Toggle active card
  document.querySelectorAll(".route-type-card").forEach(c => {
    if (c.getAttribute("data-type") === type) {
      c.classList.add("active");
    } else {
      c.classList.remove("active");
    }
  });

  // Toggle active table row
  document.querySelectorAll(".route-comparison-table tr").forEach(r => r.classList.remove("active-row"));
  const activeRow = document.getElementById(`comp-row-${type}`);
  if (activeRow) activeRow.classList.add("active-row");

  if (!currentMultiRoutes || !currentMultiRoutes.routes || !currentMultiRoutes.routes[type]) {
    return;
  }

  const route = currentMultiRoutes.routes[type];

  // Update Active Route Summary bar
  const tagEl = document.getElementById("activeRouteTag");
  const statsEl = document.getElementById("arsStats");
  const formulaEl = document.getElementById("arsFormula");

  if (tagEl) tagEl.textContent = route.tag || `${type.toUpperCase()} ROUTE`;
  if (statsEl) {
    statsEl.textContent = `Total: ${route.totalDistanceKm} km • ${route.totalTimeMins} mins driving • ₹${Math.round(route.totalCost)} (Fuel ₹${Math.round(route.fuelCost)} + Tolls ₹${Math.round(route.tollCost)}) • Scenic Score: ${(route.scenicScore || 0.5).toFixed(2)} / 1.0`;
  }
  if (formulaEl) {
    formulaEl.textContent = ROUTE_FORMULAS[type] || route.summary;
  }

  // Check for closing time warnings
  checkAndRenderClosingTimeWarnings(route);

  // Render Leaflet Map
  renderLeafletMap(route);

  // Render Ordered Timeline
  renderRouteTimeline(route);
}

/**
 * Closing time warning banner
 */
function checkAndRenderClosingTimeWarnings(route) {
  const banner = document.getElementById("routeWarningBanner");
  const textEl = document.getElementById("routeWarningText");
  if (!banner || !textEl) return;

  const warnings = route.warnings || [];
  if (route.legs) {
    route.legs.forEach(leg => {
      if (leg.closingTimeWarning) {
        warnings.push(leg.closingTimeWarning);
      }
    });
  }

  const uniqueWarnings = Array.from(new Set(warnings)).filter(Boolean);

  if (uniqueWarnings.length > 0) {
    banner.classList.remove("hidden");
    textEl.innerHTML = uniqueWarnings.map(w => `<div>• ${w}</div>`).join("");
  } else {
    banner.classList.add("hidden");
  }
}

/**
 * Initializes and renders Leaflet Map with colored markers and OSRM geometry
 */
function renderLeafletMap(route) {
  const mapContainer = document.getElementById("routeMap");
  if (!mapContainer) return;

  // Initialize Leaflet if not already initialized
  if (!leafletMap) {
    leafletMap = L.map("routeMap", {
      scrollWheelZoom: true
    }).setView([13.0827, 80.2707], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors"
    }).addTo(leafletMap);

    mapMarkersGroup = L.layerGroup().addTo(leafletMap);
    mapPolylineGroup = L.layerGroup().addTo(leafletMap);
  }

  mapMarkersGroup.clearLayers();
  mapPolylineGroup.clearLayers();

  const legs = route.legs || [];
  const stops = route.orderedStops || [];
  const allCoords = [];
  const bounds = [];

  // 1. Draw Polyline from Legs Geometry
  const routeColor = ROUTE_COLORS[route.routeType] || "#2563eb";

  legs.forEach(leg => {
    let legPoints = [];
    if (leg.geometry && Array.isArray(leg.geometry) && leg.geometry.length > 0) {
      legPoints = leg.geometry;
    } else if (leg.fromLat && leg.fromLng && leg.toLat && leg.toLng) {
      legPoints = [
        [parseFloat(leg.fromLat), parseFloat(leg.fromLng)],
        [parseFloat(leg.toLat), parseFloat(leg.toLng)]
      ];
    }

    if (legPoints.length > 0) {
      allCoords.push(...legPoints);
      legPoints.forEach(pt => bounds.push(pt));

      const polyline = L.polyline(legPoints, {
        color: routeColor,
        weight: 5,
        opacity: 0.85,
        smoothFactor: 1.0
      });

      polyline.bindTooltip(`Hop ${leg.seq}: ${leg.fromStopName} ➔ ${leg.toStopName}<br><b>${leg.distanceKm} km (~${leg.durationMins} mins)</b>`, {
        sticky: true
      });

      polyline.addTo(mapPolylineGroup);
    }
  });

  // 2. Draw Numbered Markers for each stop
  let markerList = stops;
  if (!markerList || markerList.length === 0) {
    // Reconstruct unique stops from legs
    markerList = [];
    legs.forEach((l, idx) => {
      if (idx === 0) {
        markerList.push({
          name: l.fromStopName,
          type: l.fromStopType,
          latitude: l.fromLat,
          longitude: l.fromLng
        });
      }
      markerList.push({
        name: l.toStopName,
        type: l.toStopType,
        latitude: l.toLat,
        longitude: l.toLng,
        arrivalTime: l.arrivalTime,
        departureTime: l.departureTime,
        stayDurationMins: l.stayDurationMins
      });
    });
  }

  markerList.forEach((stop, index) => {
    const lat = parseFloat(stop.latitude);
    const lng = parseFloat(stop.longitude);

    if (isNaN(lat) || isNaN(lng)) return;
    bounds.push([lat, lng]);

    const stopType = (stop.type || stop.stopType || "attraction").toLowerCase();
    const typeLabel = stopType.charAt(0).toUpperCase() + stopType.slice(1);
    const stopNumber = index + 1;

    // Custom numbered HTML marker
    const customIcon = L.divIcon({
      className: "",
      html: `<div class="custom-leaflet-marker ${stopType}">${stopNumber}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });

    const marker = L.marker([lat, lng], { icon: customIcon });

    const popupHtml = `
      <div style="font-family:inherit;min-width:210px;padding:4px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
          <span style="font-size:12px;font-weight:800;color:#ffffff;background:${stopType === 'hotel' ? '#2563eb' : stopType === 'restaurant' ? '#ea580c' : '#9333ea'};padding:2px 6px;border-radius:9999px;">
            #${stopNumber} ${typeLabel}
          </span>
          <span style="font-size:12px;color:#f59e0b;font-weight:700;">★ ${stop.rating || 4.5}</span>
        </div>
        <h4 style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1e293b;">${stop.name}</h4>
        ${stop.openingTime ? `<div style="font-size:12px;color:#64748b;margin-bottom:3px;">🕒 Hours: ${stop.openingTime} - ${stop.closingTime}</div>` : ""}
        ${stop.ticketPrice !== undefined ? `<div style="font-size:12px;color:#10b981;font-weight:700;">Entry: ${stop.ticketPrice > 0 ? `₹${stop.ticketPrice}` : "Free"}</div>` : ""}
        ${stop.scenicScore ? `<div style="font-size:12px;color:#0284c7;font-weight:600;">🌊 Scenic Rating: ${(stop.scenicScore * 10).toFixed(1)}/10</div>` : ""}
        <button type="button" style="margin-top:8px;width:100%;padding:4px 8px;font-size:11px;font-weight:700;background:#2563eb;color:#ffffff;border:none;border-radius:4px;cursor:pointer;" onclick="showStopDetailsModal('${stop.name.replace(/'/g, "\\'")}')">
          View Stop Details
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.addTo(mapMarkersGroup);
  });

  // Fit bounds to show all markers and polyline
  if (bounds.length > 0) {
    try {
      leafletMap.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } catch (e) {
      console.warn("fitBounds failed:", e);
    }
  }

  setTimeout(() => {
    if (leafletMap) leafletMap.invalidateSize();
  }, 100);
}

/**
 * Renders chronological stop timeline with arrival, stay, departure, and leg distance
 */
function renderRouteTimeline(route) {
  const container = document.getElementById("routeTimelineList");
  if (!container) return;

  const legs = route.legs || [];
  if (legs.length === 0) {
    container.innerHTML = "<p>No timeline legs available for this route.</p>";
    return;
  }

  let html = "";

  legs.forEach((leg, idx) => {
    // If first leg, render the origin stop first
    if (idx === 0) {
      const fromType = (leg.fromStopType || "hotel").toLowerCase();
      html += `
        <div class="timeline-stop-card" onclick="showStopDetailsModal('${leg.fromStopName.replace(/'/g, "\\'")}')">
          <div class="stop-seq-badge ${fromType}">1</div>
          <div class="stop-info">
            <div class="stop-title-row">
              <h5>${leg.fromStopName}</h5>
              <span class="stop-type-pill ${fromType}">${fromType}</span>
            </div>
            <div class="stop-timing-row">
              <span class="timing-pill">🏁 <strong>Origin / Departure:</strong> 09:00</span>
              <span class="timing-pill">📍 Lat: ${parseFloat(leg.fromLat).toFixed(4)}, Lng: ${parseFloat(leg.fromLng).toFixed(4)}</span>
            </div>
          </div>
        </div>
      `;
    }

    // Leg hop connector
    html += `
      <div class="timeline-leg-indicator">
        <span>🚗 Leg ${leg.seq}: </span>
        <span class="leg-metric">${leg.distanceKm} km</span>
        <span>•</span>
        <span class="leg-metric">${leg.durationMins} mins travel</span>
        <span>•</span>
        <span>Fuel ₹${Math.round(leg.fuelCost)}</span>
        ${leg.tollCost > 0 ? `<span>• Toll ₹${Math.round(leg.tollCost)}</span>` : ""}
        <span>(${leg.instructions || "Drive along arterial road"})</span>
      </div>
    `;

    // To stop card
    const toType = (leg.toStopType || "attraction").toLowerCase();
    const stopNumber = idx + 2;
    const hasWarning = !!leg.closingTimeWarning;

    html += `
      <div class="timeline-stop-card ${hasWarning ? 'has-warning' : ''}" onclick="showStopDetailsModal('${leg.toStopName.replace(/'/g, "\\'")}')">
        <div class="stop-seq-badge ${toType}">${stopNumber}</div>
        <div class="stop-info">
          <div class="stop-title-row">
            <h5>${leg.toStopName}</h5>
            <span class="stop-type-pill ${toType}">${toType}</span>
            ${hasWarning ? `<span style="font-size:0.68rem;background:#fef3c7;color:#b45309;padding:1px 6px;border-radius:4px;font-weight:700;">⚠️ Arrives Late</span>` : ""}
          </div>
          <div class="stop-timing-row">
            <span class="timing-pill">🕒 <strong>Arrival:</strong> ${leg.arrivalTime || "--"}</span>
            <span class="timing-pill">⏳ <strong>Time Spent:</strong> ${leg.stayDurationMins || 60} mins</span>
            <span class="timing-pill">🛫 <strong>Departure:</strong> ${leg.departureTime || "--"}</span>
          </div>
          ${hasWarning ? `<div style="color:#b45309;font-size:0.75rem;margin-top:4px;">${leg.closingTimeWarning}</div>` : ""}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Stop details modal
 */
function showStopDetailsModal(stopName) {
  const modal = document.getElementById("stopDetailsModal");
  if (!modal) return;

  // Search stop data across currentPlan or multiRoutes
  let stopData = null;

  if (currentPlan) {
    if (currentPlan.selectedHotel && currentPlan.selectedHotel.name === stopName) {
      stopData = { ...currentPlan.selectedHotel, type: "hotel" };
    }
    if (!stopData && currentPlan.recommendedRestaurants) {
      const r = currentPlan.recommendedRestaurants.find(x => x.name === stopName);
      if (r) stopData = { ...r, type: "restaurant" };
    }
    if (!stopData && currentPlan.recommendedAttractions) {
      const a = currentPlan.recommendedAttractions.find(x => x.name === stopName);
      if (a) stopData = { ...a, type: "attraction" };
    }
  }

  if (!stopData && currentMultiRoutes && currentMultiRoutes.routes) {
    for (const rKey in currentMultiRoutes.routes) {
      const r = currentMultiRoutes.routes[rKey];
      if (r.orderedStops) {
        const found = r.orderedStops.find(s => s.name === stopName);
        if (found) {
          stopData = found;
          break;
        }
      }
    }
  }

  const nameEl = document.getElementById("sdName");
  const badgesEl = document.getElementById("sdBadges");
  const addrEl = document.getElementById("sdAddress");
  const hoursEl = document.getElementById("sdHours");
  const priceEl = document.getElementById("sdPrice");
  const ratingEl = document.getElementById("sdRating");
  const scenicEl = document.getElementById("sdScenic");
  const descEl = document.getElementById("sdDescription");

  nameEl.textContent = stopName;

  if (stopData) {
    const sType = (stopData.type || stopData.stopType || "attraction").toLowerCase();
    badgesEl.innerHTML = `
      <span class="stop-type-pill ${sType}">${sType.toUpperCase()}</span>
      ${stopData.category ? `<span class="tag-badge">${stopData.category}</span>` : ""}
      ${stopData.mealType ? `<span class="tag-badge">${stopData.mealType}</span>` : ""}
    `;
    addrEl.textContent = stopData.address ? `📍 ${stopData.address}` : "📍 Central Destination Zone";
    hoursEl.textContent = (stopData.openingTime && stopData.closingTime) ? `${stopData.openingTime} - ${stopData.closingTime}` : "09:00 - 20:00 (Daily)";
    priceEl.textContent = stopData.ticketPrice !== undefined ? (stopData.ticketPrice > 0 ? `₹${stopData.ticketPrice}` : "Free Admission") :
                          stopData.pricePerNight ? `₹${stopData.pricePerNight} / night` :
                          stopData.avgCostPerPerson ? `₹${stopData.avgCostPerPerson} / meal` : "Included";
    ratingEl.textContent = `★ ${stopData.rating || 4.5} / 5.0`;
    scenicEl.textContent = stopData.scenicScore ? `★ ${(stopData.scenicScore * 10).toFixed(1)} / 10` : "7.5 / 10";
    descEl.textContent = stopData.description || stopData.amenities || stopData.notes || "High-rated destination point featured in your itinerary.";
  } else {
    badgesEl.innerHTML = `<span class="stop-type-pill attraction">STOP</span>`;
    addrEl.textContent = "📍 Prime Route Stop";
    hoursEl.textContent = "09:00 - 20:00";
    priceEl.textContent = "Standard Rates";
    ratingEl.textContent = "★ 4.5 / 5.0";
    scenicEl.textContent = "7.5 / 10";
    descEl.textContent = "Selected stop on your itinerary.";
  }

  modal.classList.remove("hidden");
}

function closeStopModal() {
  const modal = document.getElementById("stopDetailsModal");
  if (modal) modal.classList.add("hidden");
}
