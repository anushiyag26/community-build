// Persists settings, theme preference and message history in localStorage.
const PREFIX = "communityhub:";

export function saveLocal(key, val) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(val));
    return true;
  } catch (err) {
    console.warn("localStorage unavailable:", err);
    return false;
  }
}

export function loadLocal(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    console.warn("localStorage read failed:", err);
    return fallback;
  }
}

export function removeLocal(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch (err) {
    console.warn("localStorage remove failed:", err);
  }
}
