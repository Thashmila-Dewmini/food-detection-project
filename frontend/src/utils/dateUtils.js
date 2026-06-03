// frontend/src/utils/dateUtils.js

// Format an ISO date string into separate date and time
// strings for display in history and meal detail screens.

// Returns:
//   date — "YYYY-MM-DD"
//   time — locale-formatted "HH:MM"
export function formatDateTime(isoString) {
  const d = new Date(isoString);

  const date = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");

  const time = d.toLocaleTimeString([], {
    hour:   "2-digit",
    minute: "2-digit",
  });

  return { date, time };
}