// frontend/src/constants/config.js

// API configuration
// Base URL should be set via environment variable in
// production. Hardcoded IP is acceptable for local dev.
export const API_BASE_URL = "http://192.168.8.105:8000";

export const API_ENDPOINTS = {
  analyze:      `${API_BASE_URL}/api/v1/analyze`,
  health:       `${API_BASE_URL}/api/v1/health`,
  feedback:     `${API_BASE_URL}/api/v1/feedback`,
  recalculate:  `${API_BASE_URL}/api/v1/recalculate/`
};

// Calorie impact badge colors
// Matches backend classification: Low / Medium / High
export const CALORIE_IMPACT_COLORS = {
  Low: "#4CAF50",
  Medium: "#FF9800",
  High: "#F44336",
};
