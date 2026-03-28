import { useState, useEffect } from 'react';
import { C } from '../theme';
import { PROG_START, PROG_DURATION, PROG_END, fmtMs, pad } from '../utils/dates';

export default function ProgramClock() {
  const [now, setNow] = useState(() => new Date());
  const [countdown, setCountdown] = useState(false);
  const [flash, setFlash] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 20) setMinimized(true);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const elapsed = now - PROG_START;
  const remaining = PROG_END - now;
  const progress = Math.min(1, Math.max(0, elapsed / PROG_DURATION));
  const pct = Math.round(progress * 100);
  const weekNum = Math.min(6, Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000)) + 1);
  const totalDayNum = Math.min(42, Math.floor(elapsed / (24 * 60 * 60 * 1000)) + 1);

  const t = fmtMs(countdown ? remaining : elapsed);

  // Color shifts green → blue → amber as program progresses
  const clr = progress < 0.33 ? C.safe : progress < 0.66 ? C.accent : C.warning;

  function handleClick() {
    if (minimized) {
      setMinimized(false);
      return;
    }
    setCountdown((v) => !v);
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  }

  const unitStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 46 };
  const numStyle = { fontSize: 28, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: clr, lineHeight: 1, letterSpacing: '-1px' };
  const lblStyle = { fontSize: 8, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1.5px' };
  const sepStyle = { fontSize: 24, fontWeight: 300, color: clr + '66', alignSelf: 'flex-start', marginTop: 4, lineHeight: 1 };
  const pctDisplay = countdown ? (100 - pct) + '% remaining' : pct + '% complete';

  if (minimized) {
    return (
      <div
        onClick={handleClick}
        style={{
          cursor: 'pointer',
          marginBottom: 12,
          borderRadius: 10,
          padding: '6px 12px',
          background: '#111827',
          border: '1px solid ' + clr + '33',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: clr }}>
          W{weekNum}·D{totalDayNum}
        </span>
        <span style={{ fontSize: 10, color: C.textMuted, fontVariantNumeric: 'tabular-nums' }}>
          {t.d > 0
            ? t.d + 'd ' + pad(t.h) + 'h ' + pad(t.m) + 'm'
            : pad(t.h) + ':' + pad(t.m) + ':' + pad(t.s)}
          {' · ' + pctDisplay + ' '}
          {countdown ? '↓' : '↑'}
        </span>
        <span style={{ fontSize: 9, color: C.textMuted }}>tap to expand</span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        marginBottom: 16,
        borderRadius: 14,
        background: flash ? clr + '18' : 'linear-gradient(135deg, #111827 0%, #0d1424 100%)',
        border: '1px solid ' + clr + '55',
        boxShadow: '0 0 24px ' + clr + '18, inset 0 1px 0 ' + clr + '22',
        transition: 'background 0.25s, box-shadow 0.25s',
        overflow: 'hidden'
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: clr,
              boxShadow: '0 0 6px ' + clr,
              animation: 'pulse 2s infinite'
            }}
          />
          <span style={{ fontSize: 10, fontWeight: 700, color: clr, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {progress >= 1 ? 'Program Complete' : 'Week ' + weekNum + ' · Day ' + totalDayNum + ' of 42'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {countdown ? 'remaining' : 'elapsed'}
          </span>
          <div style={{ padding: '2px 7px', borderRadius: 4, background: clr + '22', border: '1px solid ' + clr + '44', fontSize: 9, fontWeight: 700, color: clr }}>
            {countdown ? '↓' : '↑'}
          </div>
        </div>
      </div>
      {/* Time display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '10px 14px 8px' }}>
        {t.d > 0 && (
          <div style={unitStyle}>
            <div style={numStyle}>{t.d}</div>
            <div style={lblStyle}>days</div>
          </div>
        )}
        {t.d > 0 && <div style={sepStyle}>:</div>}
        <div style={unitStyle}>
          <div style={numStyle}>{pad(t.h)}</div>
          <div style={lblStyle}>hrs</div>
        </div>
        <div style={sepStyle}>:</div>
        <div style={unitStyle}>
          <div style={numStyle}>{pad(t.m)}</div>
          <div style={lblStyle}>min</div>
        </div>
        <div style={sepStyle}>:</div>
        <div style={unitStyle}>
          <div style={numStyle}>{pad(t.s)}</div>
          <div style={lblStyle}>sec</div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ position: 'relative', height: 6, background: C.border, margin: '0 0 0' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: pct + '%',
            background: 'linear-gradient(90deg, ' + clr + '99, ' + clr + ')',
            borderRadius: '0 3px 3px 0',
            boxShadow: '0 0 8px ' + clr + '66',
            transition: 'width 1s linear'
          }}
        />
        {pct > 0 && pct < 100 && (
          <div
            style={{
              position: 'absolute',
              top: -1,
              width: 4,
              height: 8,
              borderRadius: 2,
              background: clr,
              boxShadow: '0 0 6px ' + clr,
              left: 'calc(' + pct + '% - 2px)',
              transition: 'left 1s linear'
            }}
          />
        )}
      </div>
      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px 9px' }}>
        <span style={{ fontSize: 9, color: C.textMuted }} />
        <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
          {pctDisplay} · tap to toggle
        </span>
        <span style={{ fontSize: 9, color: C.textMuted }} />
      </div>
    </div>
  );
}
