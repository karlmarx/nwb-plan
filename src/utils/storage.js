export const SCHEMA_VERSION = 4;

export function loadState(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}

export function saveState(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {}
}

export function initSchema() {
  const storedVersion = localStorage.getItem('nwb_schema_version');
  if (!storedVersion) {
    localStorage.setItem('nwb_schema_version', SCHEMA_VERSION);
  }
}
