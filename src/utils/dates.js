export function getTodayKey() {
  const d = new Date();
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

// Program start: last Tuesday (Mar 17, 2026) at noon EDT = 16:00 UTC
export const PROG_START = new Date('2026-03-17T16:00:00Z');
export const PROG_DURATION = 42 * 24 * 60 * 60 * 1000; // 6 weeks in ms
export const PROG_END = new Date(PROG_START.getTime() + PROG_DURATION);

export function fmtMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60
  };
}

export function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}
