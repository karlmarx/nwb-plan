import { useState, useMemo } from 'react';
import { C } from '../theme';
import { EX } from '../data/exercises';
import { EQUIPMENT } from '../data/equipment';

const SEARCH_CATEGORIES = ['all', 'push', 'pull', 'legs', 'core'];

export default function WorkoutEditor({ workoutKey, exercises, onSave, onClose, equipment }) {
  const [list, setList] = useState([...exercises]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const allExerciseNames = useMemo(() => Object.keys(EX), []);

  const filtered = useMemo(() => {
    return allExerciseNames.filter((name) => {
      if (list.includes(name)) return false;
      if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
      if (catFilter !== 'all') {
        const cat = EX[name]?.category;
        if (cat !== catFilter) return false;
      }
      return true;
    });
  }, [allExerciseNames, list, search, catFilter]);

  function move(idx, dir) {
    const next = [...list];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setList(next);
  }

  function remove(idx) {
    setList(list.filter((_, i) => i !== idx));
  }

  function add(name) {
    setList([...list, name]);
    setSearch('');
  }

  const isUnavailable = (name) =>
    (EX[name]?.requires || []).some((r) => equipment[r] === false);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.card,
        border: '1px solid ' + C.border,
        borderRadius: '16px 16px 0 0',
        width: '100%',
        maxWidth: 600,
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Edit Workout</div>
            <button onClick={onClose} style={btnStyle}>✕</button>
          </div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>
            Drag-free: use ↑↓ to reorder. Changes saved to this device.
          </div>
        </div>

        {/* Current list */}
        <div style={{ overflowY: 'auto', flexGrow: 1, padding: '10px 16px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Exercises ({list.length})
          </div>
          {list.map((name, idx) => (
            <div
              key={name}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 10px', marginBottom: 4, borderRadius: 8,
                background: C.bg, border: '1px solid ' + C.border,
                opacity: isUnavailable(name) ? 0.5 : 1,
              }}
            >
              <div style={{ flex: 1, fontSize: 12, color: C.text }}>{name}</div>
              {isUnavailable(name) && (
                <span style={{ fontSize: 9, color: C.warning, padding: '1px 4px', borderRadius: 3, border: '1px solid ' + C.warning }}>NO EQUIP</span>
              )}
              <button onClick={() => move(idx, -1)} disabled={idx === 0} style={arrowBtn}>↑</button>
              <button onClick={() => move(idx, 1)} disabled={idx === list.length - 1} style={arrowBtn}>↓</button>
              <button onClick={() => remove(idx)} style={{ ...arrowBtn, color: C.danger }}>✕</button>
            </div>
          ))}

          {/* Add exercise */}
          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowAdd(!showAdd)}
              style={{
                width: '100%', padding: '8px', borderRadius: 8,
                background: 'transparent', border: '1px dashed ' + C.accent,
                color: C.accent, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              + Add exercise
            </button>

            {showAdd && (
              <div style={{ marginTop: 8 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search exercises…"
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8,
                    background: C.bg, border: '1px solid ' + C.border,
                    color: C.text, fontSize: 12, fontFamily: 'inherit',
                    outline: 'none', marginBottom: 6,
                  }}
                />
                {/* Category filter */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                  {SEARCH_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCatFilter(cat)}
                      style={{
                        fontSize: 10, padding: '3px 8px', borderRadius: 8,
                        background: catFilter === cat ? C.accent + '22' : 'transparent',
                        border: '1px solid ' + (catFilter === cat ? C.accent : C.border),
                        color: catFilter === cat ? C.accent : C.textMuted,
                        cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {filtered.slice(0, 40).map((name) => (
                    <div
                      key={name}
                      onClick={() => add(name)}
                      style={{
                        padding: '7px 10px', marginBottom: 3, borderRadius: 7,
                        background: C.bg, border: '1px solid ' + C.border,
                        cursor: 'pointer', fontSize: 12, color: C.text,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                    >
                      <span>{name}</span>
                      {isUnavailable(name) && (
                        <span style={{ fontSize: 9, color: C.textMuted }}>missing equip</span>
                      )}
                    </div>
                  ))}
                  {filtered.length === 0 && (
                    <div style={{ fontSize: 11, color: C.textMuted, padding: '8px 0' }}>No matches</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid ' + C.border, display: 'flex', gap: 8, flexShrink: 0 }}>
          <button onClick={onClose} style={{ ...footerBtn, background: 'transparent', color: C.textMuted, border: '1px solid ' + C.border }}>
            Cancel
          </button>
          <button
            onClick={() => { onSave(list); onClose(); }}
            style={{ ...footerBtn, background: C.accent + '22', color: C.accent, border: '1px solid ' + C.accent, flex: 2 }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

const btnStyle = {
  background: 'transparent', border: 'none', color: C.textMuted,
  cursor: 'pointer', fontSize: 14, padding: '2px 6px',
};
const arrowBtn = {
  background: 'transparent', border: '1px solid ' + C.border, color: C.textMuted,
  cursor: 'pointer', fontSize: 11, padding: '2px 6px', borderRadius: 4,
  fontFamily: 'inherit', lineHeight: 1,
};
const footerBtn = {
  flex: 1, padding: '10px', borderRadius: 10,
  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
};
