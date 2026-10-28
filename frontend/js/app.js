/**
 * Routewise Frontend - Main Application Entrypoint
 * Redesigned for Phase 3A: Premium Travel Aesthetic, Wizard & Animated Loader
 */

import { state, applyTheme } from './state.js';
import { checkServicesHealth, planTripApi } from './api.js';
import { initWizard, goToStep, setTotalBudgetValue } from './wizard.js';
import { 
  renderTripPlan, 
  switchTab, 
  selectRouteType, 
  saveChecklistItem, 
  copyToClipboard, 
  copyTripTextSummary,
  showToast 
} from './components.js';

// Expose necessary functions to window for HTML event handlers
window.goToStep = goToStep;
window.switchTab = switchTab;
window.selectRouteType = selectRouteType;
window.saveChecklistItem = saveChecklistItem;
window.copyToClipboard = copyToClipboard;
window.copyTripTextSummary = copyTripTextSummary;
window.setTotalBudgetValue = setTotalBudgetValue;
window.loadDemoTrip = loadDemoTrip;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme
  applyTheme(state.theme);
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  // 2. Initialize Wizard
  initWizard();

  // 3. Setup Step Navigation Buttons
  const nextBtn = document.getElementById('wizardNextBtn');
  const backBtn = document.getElementById('wizardBackBtn');
  const submitBtn = document.getElementById('wizardSubmitBtn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToStep(state.wizard.currentStep + 1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      goToStep(state.wizard.currentStep - 1);
    });
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', handleTripGeneration);
  }

  // 4. Setup Tabs Listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // 5. Setup Mobile Bottom Navigation
  setupBottomNav();

  // 6. Check Microservices & Database Health
  checkBackendHealth();

  // 7. Initialize Lucide Icons
  if (window.lucide) window.lucide.createIcons();
});

/* ==========================================================================
   TRIP GENERATION & PLAYFUL ANIMATED LOADER
   ========================================================================== */
let statusCycleInterval = null;

const STATUS_MESSAGES = [
  "Analyzing best travel corridors in South India...",
  "Finding high-rated boutique hotels within budget...",
  "Curating regional delicacies and authentic restaurants...",
  "Comparing Fastest, Shortest & Scenic route geometries...",
  "Balancing every rupee for optimal itinerary value..."
];

async function handleTripGeneration() {
  const wizardCard = document.getElementById('wizardCard');
  const loader = document.getElementById('generatingScreen');
  const statusPill = document.getElementById('generatingStatusText');

  // Switch to Generating Screen
  if (wizardCard) wizardCard.style.display = 'none';
  if (loader) loader.classList.add('active');

  // Cycle status messages
  let msgIdx = 0;
  if (statusPill) statusPill.textContent = STATUS_MESSAGES[0];
  statusCycleInterval = setInterval(() => {
    msgIdx = (msgIdx + 1) % STATUS_MESSAGES.length;
    if (statusPill) {
      statusPill.style.opacity = 0;
      setTimeout(() => {
        statusPill.textContent = STATUS_MESSAGES[msgIdx];
        statusPill.style.opacity = 1;
      }, 200);
    }
  }, 1600);

  const payload = {
    startCity: state.wizard.startCity,
    destinationCity: state.wizard.destinationCity,
    numDays: state.wizard.numDays,
    numTravellers: state.wizard.numTravellers,
    transportMode: state.wizard.transportMode,
    totalBudgetMin: state.wizard.totalBudgetMin,
    totalBudgetMax: state.wizard.totalBudgetMax,
    shareAccommodation: state.wizard.shares.accommodation,
    shareFood: state.wizard.shares.food,
    shareTransport: state.wizard.shares.transport,
    shareSightseeing: state.wizard.shares.sightseeing
  };

  try {
    const data = await planTripApi(payload);
    clearInterval(statusCycleInterval);

    setTimeout(() => {
      if (loader) loader.classList.remove('active');
      if (wizardCard) wizardCard.style.display = 'block';
      renderTripPlan(data);
      showToast("✨ Itinerary & Route Plan generated successfully!", "success");
    }, 1200);

  } catch (err) {
    clearInterval(statusCycleInterval);
    if (loader) loader.classList.remove('active');
    if (wizardCard) wizardCard.style.display = 'block';
    showToast(`Error: ${err.message}`, "error");
  }
}

export async function loadDemoTrip() {
  const payload = {
    startCity: "Bengaluru",
    destinationCity: "Chennai",
    numDays: 2,
    numTravellers: 2,
    transportMode: "car",
    totalBudgetMin: 8000,
    totalBudgetMax: 18000,
    shareAccommodation: 35,
    shareFood: 25,
    shareTransport: 20,
    shareSightseeing: 20
  };

  try {
    const data = await planTripApi(payload);
    renderTripPlan(data);
  } catch (e) {
    console.error("Demo trip loading failed:", e);
  }
}

/* ==========================================================================
   MOBILE BOTTOM NAVIGATION
   ========================================================================== */
function setupBottomNav() {
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const action = btn.dataset.action;
      if (action === 'plan') {
        const wizardCard = document.getElementById('wizardCard');
        if (wizardCard) {
          wizardCard.style.display = 'block';
          wizardCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (action === 'itinerary') {
        switchTab('itineraryTab');
        scrollToResults();
      } else if (action === 'routes') {
        switchTab('routesTab');
        scrollToResults();
      } else if (action === 'checklist') {
        switchTab('checklistTab');
        scrollToResults();
      } else if (action === 'theme') {
        const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      }
    });
  });
}

function scrollToResults() {
  const res = document.getElementById('resultsSection');
  if (res) res.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==========================================================================
   HEALTH CHECKS
   ========================================================================== */
async function checkBackendHealth() {
  const health = await checkServicesHealth();
  const javaBadge = document.getElementById('backendStatusBadge');
  const pythonBadge = document.getElementById('pythonStatusBadge');

  if (javaBadge) {
    javaBadge.classList.toggle('online', health.backend);
  }
  if (pythonBadge) {
    pythonBadge.classList.toggle('online', health.python);
  }
}
