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
