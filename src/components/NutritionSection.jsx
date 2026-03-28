import { useState, useEffect } from 'react';
import { C } from '../theme';
import { loadState, saveState } from '../utils/storage';
import { getTodayKey } from '../utils/dates';
import { NUTRITION_ITEMS, SUPP_IDS, MEAL_IDS, CARDIO_TYPES } from '../data/nutrition';

const green = '#10b981';

export default function NutritionSection({ isOpen, onToggle }) {
  const todayKey = getTodayKey();

  const [data, setData] = useState(() => {
    const all = loadState('nwb_nutrition', {});
    return all[todayKey] || { checks: {}, notes: {}, cardioType: '', cardioDuration: '', cardioSkipped: false };
  });

  const [history, setHistory] = useState(() => {
    const loaded = loadState('nwb_nutrition_history', {});
    const keys = Object.keys(loaded);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const cutoffKey = cutoff.toISOString().slice(0, 10);
    keys.forEach((k) => {
      if (k < cutoffKey) delete loaded[k];
    });
    return loaded;
  });

  const [dismissed, setDismissed] = useState(() => loadState('nwb_nutrition_dismissed', {}));
  const [showHistory, setShowHistory] = useState(false);
  const [historyDetail, setHistoryDetail] = useState(null);

  useEffect(() => {
    const all = loadState('nwb_nutrition', {});
    all[todayKey] = data;
    saveState('nwb_nutrition', all);
    const checkedMeals = MEAL_IDS.filter((id) => data.checks[id]).length;
    const checkedSupps = SUPP_IDS.filter((id) => data.checks[id]).length;
    const perfect = checkedMeals >= 4 && checkedSupps >= 3;
    const partial = checkedMeals > 0 || checkedSupps > 0;
    setHistory((prev) => {
      const h = Object.assign({}, prev);
      h[todayKey] = { perfect, partial, meals: checkedMeals, supps: checkedSupps };
      saveState('nwb_nutrition_history', h);
      return h;
    });
  }, [data]);

  useEffect(() => {
    if (dismissed._date !== todayKey) {
      setDismissed({ _date: todayKey });
      saveState('nwb_nutrition_dismissed', { _date: todayKey });
    }
  }, []);

  const toggle = (id) => {
    setData((prev) => {
      const c = Object.assign({}, prev.checks);
      c[id] = !c[id];
      return Object.assign({}, prev, { checks: c });
    });
  };

  const setNote = (id, val) => {
    setData((prev) => {
      const n = Object.assign({}, prev.notes);
      n[id] = val;
      return Object.assign({}, prev, { notes: n });
    });
  };

  const setCardioType = (val) => {
    setData((prev) => Object.assign({}, prev, { cardioType: val }));
  };

  const setCardioDuration = (val) => {
    setData((prev) => Object.assign({}, prev, { cardioDuration: val }));
  };

  const skipCardio = () => {
    setData((prev) => Object.assign({}, prev, { cardioSkipped: !prev.cardioSkipped }));
  };

  const dismissAlert = (key) => {
    const d = Object.assign({}, dismissed);
    d[key] = true;
    d._date = todayKey;
    setDismissed(d);
    saveState('nwb_nutrition_dismissed', d);
  };

  const checkedMeals = MEAL_IDS.filter((id) => data.checks[id]).length;
  const checkedSupps = SUPP_IDS.filter((id) => data.checks[id]).length;
  const totalChecked = NUTRITION_ITEMS.filter((it) =>
    it.id === 'cardio' ? data.checks.cardio || data.cardioSkipped : data.checks[it.id]
  ).length;
  const totalItems = NUTRITION_ITEMS.length;

  // Streak calculation
  let streak = 0;
  let bestStreak = 0;
  const d2 = new Date();
  d2.setDate(d2.getDate() - 1);
  while (true) {
    const k =
      d2.getFullYear() +
      '-' +
      String(d2.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d2.getDate()).padStart(2, '0');
    if (history[k] && history[k].perfect) {
      streak++;
      d2.setDate(d2.getDate() - 1);
    } else break;
  }
  if (history[todayKey] && history[todayKey].perfect) streak++;
  const keys = Object.keys(history).sort();
  let run = 0;
  for (let si = 0; si < keys.length; si++) {
    if (history[keys[si]] && history[keys[si]].perfect) {
      run++;
      if (run > bestStreak) bestStreak = run;
    } else run = 0;
  }

  // Time-based alerts
  const now = new Date();
  const hour = now.getHours();
  const alerts = [];

  const uncheckedSupps = SUPP_IDS.filter((id) => !data.checks[id]).map(
    (id) => NUTRITION_ITEMS.find((it) => it.id === id).label.split(' \u2014 ')[0]
  );

  if (hour >= 20 && uncheckedSupps.length > 0 && !dismissed.supp_red) {
    alerts.push({
      key: 'supp_red',
      color: C.danger,
      bg: C.dangerBg,
      border: C.dangerBorder,
      text: "Still haven\u2019t taken: " + uncheckedSupps.join(', ')
    });
  } else if (hour >= 14 && uncheckedSupps.length > 0 && !dismissed.supp_yellow) {
    alerts.push({
      key: 'supp_yellow',
      color: C.warning,
      bg: C.warningBg,
      border: C.warningBorder,
      text: 'Don\u2019t forget your supplements: ' + uncheckedSupps.join(', ')
    });
  }

  if (hour >= 21 && checkedMeals < 4 && !dismissed.meal_red) {
    alerts.push({
      key: 'meal_red',
      color: C.danger,
      bg: C.dangerBg,
      border: C.dangerBorder,
      text:
        'Only ' +
        checkedMeals +
        ' protein meal' +
        (checkedMeals !== 1 ? 's' : '') +
        ' today \u2014 try to get one more in before bed'
    });
  } else if (hour >= 17 && checkedMeals < 3 && !dismissed.meal_orange) {
    alerts.push({
      key: 'meal_orange',
      color: '#f97316',
      bg: '#431407',
      border: '#7c2d12',
      text:
        'Only ' +
        checkedMeals +
        ' protein meal' +
        (checkedMeals !== 1 ? 's' : '') +
        ' logged \u2014 aim for at least 4 today'
    });
  }

  alerts.sort((a, b) => (a.color === C.danger ? -1 : b.color === C.danger ? 1 : 0));

  const last7 = [];
  const dayNames3 = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let di = 6; di >= 0; di--) {
    const dd = new Date();
    dd.setDate(dd.getDate() - di);
    const dk =
      dd.getFullYear() +
      '-' +
      String(dd.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(dd.getDate()).padStart(2, '0');
    last7.push({ key: dk, label: dayNames3[dd.getDay()], date: dd.getDate(), data: history[dk] || null, isToday: dk === todayKey });
  }

  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 10,
        border: '1px solid ' + (isOpen ? green + '44' : C.border),
        background: C.card,
        overflow: 'hidden'
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '13px 14px', cursor: 'pointer' }}
        onClick={onToggle}
      >
        <span style={{ fontSize: 17 }}>\ud83e\udd66</span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: green }}>Daily Nutrition & Recovery</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak > 0 && (
            <span style={{ fontSize: 11, fontWeight: 700, color: green }}>\ud83d\udd25 {streak}d streak</span>
          )}
          {streak === 0 && bestStreak > 0 && (
            <span style={{ fontSize: 10, color: C.textMuted }}>Best: {bestStreak}d</span>
          )}
          <span style={{ fontSize: 11, color: C.textMuted }}>
            {totalChecked}/{totalItems} \u2713
          </span>
        </div>
        <span
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: 11,
            color: C.textMuted,
            marginLeft: 6
          }}
        >
          \u25bc
        </span>
      </div>

      {isOpen && (
        <div style={{ padding: '0 14px 14px' }}>
          {/* Alerts */}
          {alerts.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              {alerts.map((a) => (
                <div
                  key={a.key}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: a.bg,
                    border: '1px solid ' + a.border,
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: a.color
                  }}
                >
                  <span>{a.text}</span>
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      dismissAlert(a.key);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: a.color,
                      cursor: 'pointer',
                      fontSize: 14,
                      padding: '0 4px',
                      fontFamily: 'inherit'
                    }}
                  >
                    \u2715
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* History toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Today\u2019s Checklist
            </div>
            <button
              onClick={() => { setShowHistory(!showHistory); setHistoryDetail(null); }}
              style={{
                fontSize: 10,
                padding: '3px 8px',
                borderRadius: 6,
                background: showHistory ? green + '22' : 'transparent',
                border: '1px solid ' + (showHistory ? green : C.border),
                color: showHistory ? green : C.textMuted,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {showHistory ? 'Hide History' : 'History'}
            </button>
          </div>

          {showHistory && (
            <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: C.bg, border: '1px solid ' + C.border }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: historyDetail ? 8 : 0 }}>
                {last7.map((day) => {
                  const clr = day.data ? (day.data.perfect ? green : '#f59e0b') : '#334155';
                  const isSel = historyDetail === day.key;
                  return (
                    <div
                      key={day.key}
                      onClick={() => setHistoryDetail(isSel ? null : day.key)}
                      style={{
                        textAlign: 'center',
                        padding: '6px 2px',
                        borderRadius: 6,
                        background: isSel ? clr + '22' : 'transparent',
                        border: '1px solid ' + (isSel ? clr : 'transparent'),
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: 9, fontWeight: 700, color: day.isToday ? green : C.textMuted }}>
                        {day.isToday ? 'Today' : day.label}
                      </div>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          background: clr,
                          margin: '4px auto',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {day.data && day.data.perfect && <span style={{ fontSize: 10, color: '#fff' }}>\u2713</span>}
                      </div>
                      <div style={{ fontSize: 8, color: C.textMuted }}>{day.date}</div>
                    </div>
                  );
                })}
              </div>
              {historyDetail && (() => {
                const hd = history[historyDetail];
                if (!hd) return (
                  <div style={{ fontSize: 11, color: C.textMuted, textAlign: 'center', padding: 8 }}>
                    No data recorded
                  </div>
                );
                return (
                  <div style={{ fontSize: 11, color: C.textDim, padding: '4px 0' }}>
                    <div>\u2022 Protein meals: {hd.meals}/4</div>
                    <div>\u2022 Supplements: {hd.supps}/3</div>
                    <div style={{ color: hd.perfect ? green : C.warning, fontWeight: 600, marginTop: 2 }}>
                      {hd.perfect ? '\u2713 Perfect day' : 'Partial completion'}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Checklist items */}
          {NUTRITION_ITEMS.map((item) => {
            const checked = !!data.checks[item.id];
            const isCardio = item.type === 'cardio';

            if (isCardio) {
              const skipped = data.cardioSkipped;
              return (
                <div
                  key={item.id}
                  style={{
                    padding: '8px 10px',
                    marginBottom: 4,
                    borderRadius: 8,
                    background: checked || skipped ? '#0f1629' : C.bg,
                    border: '1px solid ' + (checked ? green + '44' : skipped ? '#64748b33' : C.border),
                    opacity: skipped ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      onClick={() => { if (!skipped) toggle(item.id); }}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: '2px solid ' + (checked ? green : C.textMuted),
                        background: checked ? green : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>\u2713</span>}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: checked ? C.text : skipped ? '#64748b' : C.textDim,
                        flex: 1,
                        textDecoration: skipped ? 'line-through' : 'none'
                      }}
                    >
                      {item.label}
                    </span>
                    <button
                      onClick={skipCardio}
                      style={{
                        fontSize: 9,
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: skipped ? '#64748b22' : 'transparent',
                        border: '1px solid ' + (skipped ? '#64748b' : C.border),
                        color: skipped ? '#64748b' : C.textMuted,
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      {skipped ? 'Unskip' : 'Rest Day \u2014 Skip'}
                    </button>
                  </div>
                  {!skipped && checked && (
                    <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', paddingLeft: 26 }}>
                      {CARDIO_TYPES.map((ct) => {
                        const isSel = data.cardioType === ct;
                        return (
                          <button
                            key={ct}
                            onClick={() => setCardioType(ct)}
                            style={{
                              fontSize: 9,
                              padding: '3px 8px',
                              borderRadius: 10,
                              background: isSel ? green + '22' : 'transparent',
                              border: '1px solid ' + (isSel ? green : C.border),
                              color: isSel ? green : C.textMuted,
                              cursor: 'pointer',
                              fontFamily: 'inherit'
                            }}
                          >
                            {ct}
                          </button>
                        );
                      })}
                      <input
                        type="text"
                        placeholder="min"
                        value={data.cardioDuration || ''}
                        onChange={(ev) => setCardioDuration(ev.target.value)}
                        onClick={(ev) => ev.stopPropagation()}
                        style={{
                          width: 40,
                          fontSize: 10,
                          padding: '3px 6px',
                          borderRadius: 6,
                          border: '1px solid ' + C.border,
                          background: C.bg,
                          color: C.text,
                          fontFamily: 'inherit',
                          textAlign: 'center'
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={item.id}
                style={{
                  padding: '8px 10px',
                  marginBottom: 4,
                  borderRadius: 8,
                  background: checked ? '#0f1629' : C.bg,
                  border: '1px solid ' + (checked ? green + '44' : C.border),
                  opacity: item.optional && !checked ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    onClick={() => toggle(item.id)}
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      border: '2px solid ' + (checked ? green : C.textMuted),
                      background: checked ? green : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    {checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 800 }}>\u2713</span>}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: checked ? C.text : C.textDim }}>
                    {item.label + (item.optional ? ' (optional)' : '')}
                  </span>
                  {item.type === 'meal' && checked && (
                    <input
                      type="text"
                      placeholder="what did you eat?"
                      value={data.notes[item.id] || ''}
                      onChange={(ev) => setNote(item.id, ev.target.value)}
                      onClick={(ev) => ev.stopPropagation()}
                      style={{
                        flex: 1,
                        maxWidth: 160,
                        fontSize: 10,
                        padding: '3px 6px',
                        borderRadius: 6,
                        border: '1px solid ' + C.border,
                        background: 'transparent',
                        color: C.textMuted,
                        fontFamily: 'inherit'
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
