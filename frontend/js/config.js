/**
 * Routewise Frontend Runtime Configuration (config.js)
 * Automatically detects local development vs cloud production deployment.
 * Supports manual overrides via window.ROUTEWISE_CONFIG.
 */

const isLocalhost = Boolean(
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.endsWith('.local')
  )
);

// Optional runtime override injected via window.ROUTEWISE_CONFIG
const runtimeConfig = (typeof window !== 'undefined' && window.ROUTEWISE_CONFIG) ? window.ROUTEWISE_CONFIG : {};

// Production Service URLs on Render (Free Web Services)
// Update these with your deployed Render service URLs or specify in window.ROUTEWISE_CONFIG
export const DEFAULT_PROD_JAVA_URL = "https://routewise-backend-java.onrender.com";
export const DEFAULT_PROD_PYTHON_URL = "https://routewise-service-python.onrender.com";

export const API_BASE_URL = runtimeConfig.API_BASE_URL || (isLocalhost ? "http://localhost:8080" : DEFAULT_PROD_JAVA_URL);
export const PYTHON_SERVICE_URL = runtimeConfig.PYTHON_SERVICE_URL || (isLocalhost ? "http://localhost:8000" : DEFAULT_PROD_PYTHON_URL);

export const API_BASE = `${API_BASE_URL}/api`;
export const PYTHON_API = PYTHON_SERVICE_URL;

// Expose configuration on window for cross-module access
if (typeof window !== 'undefined') {
  window.ROUTEWISE_CONFIG = {
    API_BASE_URL,
    PYTHON_SERVICE_URL,
    API_BASE,
    PYTHON_API,
    isLocalhost
  };
}
