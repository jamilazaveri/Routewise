/**
 * Routewise Frontend - Wizard & Interactive Donut Chart Module
 */

import { state } from './state.js';
import { reallocateBudgetApi } from './api.js';

let reallocateTimer = null;
let activeDragHandle = null;

export function initWizard() {
  initDefaultDates();
  setupAutocomplete();
  setupSteppers();
  setupTransportCards();
  setupBudgetControls();
  renderDonutChart();
  updateStepperUI();
}

function initDefaultDates() {
  const today = new Date();
  const nextSat = new Date();
  nextSat.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
  const dateInput = document.getElementById('startDateInput');
  if (dateInput) {
    const formatted = nextSat.toISOString().split('T')[0];
    dateInput.value = formatted;
    dateInput.min = today.toISOString().split('T')[0];
    state.wizard.startDate = formatted;
  }
}

export function goToStep(stepNumber) {
  if (stepNumber < 1 || stepNumber > 4) return;

  // Validate before moving forward
  if (stepNumber > state.wizard.currentStep) {
    if (!validateCurrentStep()) return;
  }

  state.wizard.currentStep = stepNumber;
  updateStepperUI();
}

function validateCurrentStep() {
  const s = state.wizard.currentStep;
  if (s === 1) {
    if (!state.wizard.startCity || !state.wizard.destinationCity) {
      alert("Please select both a start location and destination city.");
      return false;
    }
    if (state.wizard.startCity.toLowerCase() === state.wizard.destinationCity.toLowerCase()) {
      alert("Start location and destination city cannot be identical. Please pick different cities.");
      return false;
    }
  }
  return true;
}

function updateStepperUI() {
  const current = state.wizard.currentStep;

  // Update Progress Bar (25%, 50%, 75%, 100%)
  const bar = document.getElementById('stepperProgressBar');
  if (bar) bar.style.width = `${current * 25}%`;

  // Update Step Circles
  document.querySelectorAll('.step-item').forEach((item) => {
    const stepNum = parseInt(item.dataset.step, 10);
    item.classList.remove('active', 'completed');
    if (stepNum === current) {
      item.classList.add('active');
    } else if (stepNum < current) {
      item.classList.add('completed');
    }
  });

  // Show/Hide Panels
  document.querySelectorAll('.wizard-panel').forEach((panel) => {
    const panelNum = parseInt(panel.dataset.step, 10);
    panel.classList.toggle('active', panelNum === current);
  });

  // Footer Navigation Buttons
  const backBtn = document.getElementById('wizardBackBtn');
  const nextBtn = document.getElementById('wizardNextBtn');
  const planBtn = document.getElementById('wizardSubmitBtn');

  if (backBtn) backBtn.style.visibility = current === 1 ? 'hidden' : 'visible';
  if (nextBtn) nextBtn.style.display = current === 4 ? 'none' : 'inline-flex';
  if (planBtn) planBtn.style.display = current === 4 ? 'inline-flex' : 'none';

  if (window.lucide) window.lucide.createIcons();
}

/* ==========================================================================
   STEP 1: AUTOCOMPLETE & SWAP
   ========================================================================== */
function setupAutocomplete() {
  const startInput = document.getElementById('startCityInput');
  const destInput = document.getElementById('destinationCityInput');
  const startDrop = document.getElementById('startCityDropdown');
  const destDrop = document.getElementById('destinationCityDropdown');
  const swapBtn = document.getElementById('citySwapBtn');

  if (startInput && destInput) {
    bindCityInput(startInput, startDrop, 'startCity');
    bindCityInput(destInput, destDrop, 'destinationCity');
  }

  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = state.wizard.startCity;
      state.wizard.startCity = state.wizard.destinationCity;
      state.wizard.destinationCity = temp;
      startInput.value = state.wizard.startCity;
      destInput.value = state.wizard.destinationCity;
    });
  }

  // Quick Chips
  document.querySelectorAll('.city-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const city = chip.dataset.city;
      if (state.wizard.startCity !== city) {
        state.wizard.destinationCity = city;
        destInput.value = city;
      }
    });
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function bindCityInput(input, dropdown, stateKey) {
  input.value = state.wizard[stateKey];

  const debouncedRender = debounce(() => renderDropdown(input, dropdown, stateKey), 180);

  input.addEventListener('focus', () => renderDropdown(input, dropdown, stateKey));
  input.addEventListener('input', debouncedRender);

  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });
}

function renderDropdown(input, dropdown, stateKey) {
  const val = input.value.trim().toLowerCase();
  const filtered = state.cities.filter(c => 
    c.name.toLowerCase().includes(val) || c.state.toLowerCase().includes(val)
  );

  if (filtered.length === 0) {
    dropdown.innerHTML = `<div class="autocomplete-item" style="color:var(--text-muted);cursor:default;">No matching South Indian city found</div>`;
  } else {
    dropdown.innerHTML = filtered.map(c => `
      <div class="autocomplete-item" data-name="${c.name}">
        <i data-lucide="${c.icon || 'map-pin'}" style="width:16px;height:16px;color:#7C3AED;"></i>
        <strong>${c.name}</strong>
        <span class="autocomplete-item-state">${c.state} (${c.code})</span>
      </div>
    `).join('');
  }

  dropdown.classList.add('open');
  if (window.lucide) window.lucide.createIcons();

  dropdown.querySelectorAll('.autocomplete-item[data-name]').forEach(item => {
    item.addEventListener('click', () => {
      const selected = item.dataset.name;
      state.wizard[stateKey] = selected;
      input.value = selected;
      dropdown.classList.remove('open');
    });
  });
}

/* ==========================================================================
   STEP 2: STEPPERS & WHEN/WHO
   ========================================================================== */
function setupSteppers() {
  const daysVal = document.getElementById('numDaysVal');
  const travVal = document.getElementById('numTravellersVal');
  const dateInput = document.getElementById('startDateInput');

  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      state.wizard.startDate = e.target.value;
    });
  }

  window.stepDays = (delta) => {
    let next = state.wizard.numDays + delta;
    if (next < 1) next = 1;
    if (next > 10) next = 10;
    state.wizard.numDays = next;
    if (daysVal) daysVal.textContent = next;
    const sub = document.getElementById('daysSubtext');
    if (sub) {
      sub.textContent = next <= 2 ? 'Weekend Getaway' : next <= 5 ? 'Extended Vacation' : 'Grand Road Trip';
    }
  };

  window.stepTravellers = (delta) => {
    let next = state.wizard.numTravellers + delta;
    if (next < 1) next = 1;
    if (next > 20) next = 20;
    state.wizard.numTravellers = next;
    if (travVal) travVal.textContent = next;
    const sub = document.getElementById('travellersSubtext');
    if (sub) {
      sub.textContent = next === 1 ? 'Solo Adventurer' : next === 2 ? 'Couple' : next <= 4 ? 'Small Group' : 'Tour Party';
    }
  };
}

/* ==========================================================================
   STEP 3: TRANSPORT MODE CARDS
   ========================================================================== */
function setupTransportCards() {
  document.querySelectorAll('.transport-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.transport-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      state.wizard.transportMode = card.dataset.mode;
    });
  });
}

/* ==========================================================================
   STEP 4: BUDGET & INTERACTIVE DONUT CHART
   ========================================================================== */
function setupBudgetControls() {
  const budgetRange = document.getElementById('totalBudgetRange');
  const budgetDisplay = document.getElementById('totalBudgetBigDisplay');

  if (budgetRange) {
    budgetRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      setTotalBudgetValue(val);
    });
  }

  // Quick Presets
  document.querySelectorAll('.budget-preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const val = parseInt(chip.dataset.amount, 10);
      setTotalBudgetValue(val);
      document.querySelectorAll('.budget-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  // Category Slider Inputs
  ['accommodation', 'food', 'transport', 'sightseeing'].forEach(cat => {
    const slider = document.getElementById(`slider-${cat}`);
    if (slider) {
      slider.addEventListener('input', (e) => {
        handleSliderRebalance(cat, parseFloat(e.target.value));
      });
    }
  });

  setupDonutInteractions();
}

export function setTotalBudgetValue(val) {
  state.wizard.totalBudgetMax = val;
  state.wizard.totalBudgetMin = Math.round(val * 0.7);

  const budgetRange = document.getElementById('totalBudgetRange');
  if (budgetRange) {
    budgetRange.value = val;
    const pct = ((val - 5000) / (60000 - 5000)) * 100;
    budgetRange.style.setProperty('--budget-progress', `${pct}%`);
  }

  const budgetDisplay = document.getElementById('totalBudgetBigDisplay');
  if (budgetDisplay) {
    budgetDisplay.textContent = val.toLocaleString('en-IN');
  }

  renderDonutChart();
  updateCategorySliderDisplays();
}

function handleSliderRebalance(changedCat, newShare) {
  const currentShares = { ...state.wizard.shares };
  const oldShare = currentShares[changedCat];
  const delta = newShare - oldShare;

  const otherCats = Object.keys(currentShares).filter(c => c !== changedCat);
  const otherSum = otherCats.reduce((sum, c) => sum + currentShares[c], 0);

  if (otherSum > 0) {
    otherCats.forEach(c => {
      const prop = currentShares[c] / otherSum;
      let adjusted = currentShares[c] - (delta * prop);
      if (adjusted < 5) adjusted = 5;
      currentShares[c] = Math.round(adjusted * 10) / 10;
    });
  }
  currentShares[changedCat] = newShare;

  // Normalize so total is strictly 100%
  const total = Object.values(currentShares).reduce((a, b) => a + b, 0);
  const diff = 100 - total;
  currentShares[otherCats[0]] = Math.round((currentShares[otherCats[0]] + diff) * 10) / 10;

  state.wizard.shares = currentShares;
  renderDonutChart();
  updateCategorySliderDisplays();

  // Debounced API call if backend reallocate is desired
  clearTimeout(reallocateTimer);
  reallocateTimer = setTimeout(() => {
    triggerReallocateApi(changedCat, newShare);
  }, 400);
}

async function triggerReallocateApi(category, share) {
  try {
    const payload = {
      changedCategory: category,
      newShare: share,
      totalBudgetMax: state.wizard.totalBudgetMax,
      currentShares: state.wizard.shares
    };
    const res = await reallocateBudgetApi(payload);
    if (res && res.shares) {
      state.wizard.shares = res.shares;
      renderDonutChart();
      updateCategorySliderDisplays();
    }
  } catch (e) {
    // Graceful fallback to client-side
  }
}

function updateCategorySliderDisplays() {
  const budget = state.wizard.totalBudgetMax;
  const categories = [
    { key: 'accommodation', name: 'Stay (Hotels)' },
    { key: 'food', name: 'Food & Dining' },
    { key: 'transport', name: 'Fuel & Tolls' },
    { key: 'sightseeing', name: 'Sightseeing & Tickets' }
  ];

  categories.forEach(cat => {
    const share = Math.round(state.wizard.shares[cat.key]);
    const amount = Math.round(budget * (share / 100));
    
    const slider = document.getElementById(`slider-${cat.key}`);
    const pctLabel = document.getElementById(`pct-${cat.key}`);
    const amtLabel = document.getElementById(`amt-${cat.key}`);

    if (slider) slider.value = share;
    if (pctLabel) pctLabel.textContent = `${share}%`;
    if (amtLabel) amtLabel.textContent = `₹${amount.toLocaleString('en-IN')}`;
  });
}

/* ==========================================================================
   INTERACTIVE DONUT CHART (SVG)
   ========================================================================== */
function renderDonutChart() {
  const svg = document.getElementById('donutSvg');
  if (!svg) return;

  const budget = state.wizard.totalBudgetMax;
  const shares = state.wizard.shares;
  const cats = [
    { key: 'accommodation', label: 'Stay', color: '#F43F5E', share: shares.accommodation },
    { key: 'food', label: 'Food', color: '#10B981', share: shares.food },
    { key: 'transport', label: 'Transport', color: '#0284C7', share: shares.transport },
    { key: 'sightseeing', label: 'Sightseeing', color: '#7C3AED', share: shares.sightseeing }
  ];

  const R = 75;
  const circumference = 2 * Math.PI * R; // ~471.24
  let accumulatedShare = 0;

  const slicesGroup = document.getElementById('donutSlicesGroup') || svg;

  let slicesHtml = '';
  cats.forEach(c => {
    const strokeDash = (c.share / 100) * circumference;
    const strokeOffset = -((accumulatedShare / 100) * circumference);

    slicesHtml += `
      <circle class="donut-slice"
        cx="100" cy="100" r="${R}"
        stroke="${c.color}"
        stroke-dasharray="${strokeDash} ${circumference}"
        stroke-dashoffset="${strokeOffset}"
        data-category="${c.key}"
        data-label="${c.label}"
        data-pct="${Math.round(c.share)}"
        data-amount="${Math.round(budget * (c.share / 100))}"
      />
    `;
    accumulatedShare += c.share;
  });

  slicesGroup.innerHTML = slicesHtml;

  // Bind Hover events on slices
  svg.querySelectorAll('.donut-slice').forEach(slice => {
    slice.addEventListener('mouseenter', () => {
      updateDonutCenter(slice.dataset.label, `₹${parseInt(slice.dataset.amount).toLocaleString('en-IN')}`, `${slice.dataset.pct}%`);
    });
    slice.addEventListener('mouseleave', () => {
      resetDonutCenter();
    });
  });

  resetDonutCenter();
}

function updateDonutCenter(title, amount, pct) {
  const titleEl = document.getElementById('donutCenterTitle');
  const amountEl = document.getElementById('donutCenterAmount');
  const pctEl = document.getElementById('donutCenterPct');

  if (titleEl) titleEl.textContent = title;
  if (amountEl) amountEl.textContent = amount;
  if (pctEl) pctEl.textContent = pct;
}

function resetDonutCenter() {
  const budget = state.wizard.totalBudgetMax;
  updateDonutCenter('Total Budget', `₹${budget.toLocaleString('en-IN')}`, '100%');
}

function setupDonutInteractions() {
  // Setup mousewheel or click adjustments on Donut chart
  const svg = document.getElementById('donutSvg');
  if (svg) {
    svg.addEventListener('click', (e) => {
      const slice = e.target.closest('.donut-slice');
      if (slice) {
        const cat = slice.dataset.category;
        const current = state.wizard.shares[cat];
        handleSliderRebalance(cat, Math.min(60, current + 5));
      }
    });
  }
}
