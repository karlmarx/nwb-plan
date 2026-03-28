import { C } from '../theme';
import { EQUIPMENT } from '../data/equipment';
import { MUSCLE_TAGS, EX } from '../data/exercises';
import { DIAGRAMS } from './DiagramModal';
import Badge from './Badge';

export default function ExerciseCard({
  name,
  ex,
  phase,
  isExpanded,
  onToggle,
  onSwap,
  onDiagram,
  unavailable,
  equipment,
  variantData,
  selectedVariant,
  onVariantChange,
  supersetInfo
}) {
  if (!ex) return null;

  const sc = ex.safety === 'caution' ? C.warning : ex.safety === 'danger' ? C.danger : C.safe;
  const s = ex.sets[phase] || ex.sets[0];
  let effectiveSetup = ex.setup;
  if (variantData && variantData.variantSetup && selectedVariant && variantData.variantSetup[selectedVariant]) {
    effectiveSetup = variantData.variantSetup[selectedVariant];
  }

  return (
    <div
      style={{
        marginBottom: 6,
        borderRadius: 8,
        background: isExpanded ? '#0f1629' : C.bg,
        borderLeft: '3px solid ' + (unavailable ? C.danger : sc),
        opacity: unavailable ? 0.5 : 1,
        overflow: 'hidden'
      }}
    >
      <div onClick={onToggle} style={{ padding: '10px 12px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 7, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', flex: 1 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: unavailable ? C.danger : C.text }}>{name}</span>
            {ex.safety === 'caution' && <Badge color={C.warning}>MODIFIED</Badge>}
            {ex.phase != null && phase < ex.phase && <Badge color={C.textMuted}>Wk {ex.phase * 2 + 1}+</Badge>}
            {unavailable && <Badge color={C.danger}>NO EQUIP</Badge>}
            {MUSCLE_TAGS[name] &&
              !isExpanded &&
              MUSCLE_TAGS[name].map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: 8,
                    padding: '1px 4px',
                    borderRadius: 3,
                    background: C.border,
                    color: C.textMuted,
                    fontWeight: 600,
                    letterSpacing: '0.3px'
                  }}
                >
                  {m}
                </span>
              ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isExpanded && <span style={{ fontSize: 11, color: C.textDim }}>{s[0] + '\u00d7' + s[1]}</span>}
            <span style={{ fontSize: 10, color: C.accent }}>{isExpanded ? '\u25b2' : '\u24d8'}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div style={{ padding: '0 12px 12px' }}>
          <div
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 12,
              padding: '8px 0',
              borderBottom: '1px solid ' + C.border
            }}
          >
            <div>
              <div style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>Sets \u00d7 Reps</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{s[0] + ' \u00d7 ' + s[1]}</div>
            </div>
            {ex.rest > 0 && (
              <div>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase' }}>Rest</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{ex.rest + 's'}</div>
              </div>
            )}
          </div>

          {variantData && variantData.variants && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {variantData.variants.map((v) => {
                const isSel = v.id === selectedVariant;
                return (
                  <button
                    key={v.id}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onVariantChange && onVariantChange(v.id);
                    }}
                    style={{
                      fontSize: 10,
                      padding: '5px 10px',
                      borderRadius: 12,
                      background: isSel ? C.accent + '22' : 'transparent',
                      border: '1px solid ' + (isSel ? C.accent : C.border),
                      color: isSel ? C.accent : C.textMuted,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: isSel ? 700 : 400,
                      transition: 'all 0.15s'
                    }}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: 11, lineHeight: 1.7 }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: C.accent, marginBottom: 4, fontSize: 10 }}>
                \ud83d\udccd SETUP & POSITION
              </div>
              <div style={{ color: C.textDim }}>{effectiveSetup}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: C.safe, marginBottom: 4, fontSize: 10 }}>
                \ud83d\udd04 HOW TO EXECUTE
              </div>
              <div style={{ color: C.textDim }}>{ex.execution}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: C.warning, marginBottom: 4, fontSize: 10 }}>
                \ud83d\udee1\ufe0f NWB SAFETY CUES
              </div>
              <div style={{ color: C.textDim }}>{ex.nwbCues}</div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontWeight: 700, color: C.text, marginBottom: 4, fontSize: 10 }}>
                \ud83c\udfaf WHY THIS EXERCISE
              </div>
              <div style={{ color: C.textDim }}>{ex.why}</div>
            </div>

            {ex.diagram && DIAGRAMS[ex.diagram] && (
              <div style={{ marginBottom: 10 }}>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onDiagram(ex.diagram);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 8,
                    background: '#161616',
                    border: '1px solid ' + C.accent + '44',
                    color: C.accent,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  \ud83d\udcd0 View Movement Diagram
                </button>
              </div>
            )}

            {ex.visual && !ex.diagram && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 700, color: C.accent, marginBottom: 4, fontSize: 10 }}>
                  \ud83d\udcd0 VISUAL GUIDE
                </div>
                <pre
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 11,
                    whiteSpace: 'pre',
                    overflowX: 'auto',
                    background: '#0a0f1a',
                    padding: '10px 12px',
                    borderRadius: 8,
                    color: C.textDim,
                    border: '1px solid ' + C.border,
                    margin: 0
                  }}
                >
                  {ex.visual}
                </pre>
              </div>
            )}

            {ex.tempo && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>
                  TEMPO
                </span>
                <span style={{ fontSize: 12, color: C.accent, fontWeight: 600, fontFamily: 'monospace' }}>
                  {ex.tempo}
                </span>
              </div>
            )}

            {ex.amp && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9, color: C.textMuted, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
                  \ud83d\udd25 AMPLIFICATION TIERS
                </div>
                {ex.amp.map((level, i) => {
                  const colors = [C.safe, C.warning, C.danger];
                  return (
                    <div
                      key={'amp-' + i}
                      style={{
                        padding: '6px 8px',
                        marginBottom: 3,
                        borderRadius: 6,
                        background: colors[i] + '11',
                        borderLeft: '3px solid ' + colors[i] + '66',
                        fontSize: 11,
                        color: C.textDim,
                        lineHeight: 1.5
                      }}
                    >
                      {level}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {ex.requires.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
              {ex.requires.map((eq) => {
                const eqData = EQUIPMENT[eq];
                const has = equipment[eq] !== false;
                return (
                  <span
                    key={eq}
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: has ? C.safeBg : C.dangerBg,
                      color: has ? C.safe : C.danger,
                      border: '1px solid ' + (has ? C.safeBorder : C.dangerBorder)
                    }}
                  >
                    {(eqData ? eqData.icon : '') + ' ' + (eqData ? eqData.name : eq)}
                  </span>
                );
              })}
            </div>
          )}

          {ex.swaps && ex.swaps.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase' }}>
                Swap for:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ex.swaps.map((sw) => {
                  const swEx = EX[sw];
                  const swAvail = swEx && swEx.requires.every((r) => equipment[r] !== false);
                  return (
                    <button
                      key={sw}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onSwap(sw);
                      }}
                      style={{
                        fontSize: 11,
                        padding: '6px 10px',
                        borderRadius: 6,
                        background: swAvail ? C.accent + '22' : C.bg,
                        color: swAvail ? C.accent : C.textMuted,
                        border: '1px solid ' + (swAvail ? C.accent + '44' : C.border),
                        cursor: 'pointer',
                        fontFamily: 'inherit'
                      }}
                    >
                      {sw + (swAvail ? ' \u2713' : ' \u2717')}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {ex.rest > 0 && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onSwap('__timer__' + ex.rest);
              }}
              style={{
                marginTop: 10,
                width: '100%',
                padding: '10px',
                borderRadius: 8,
                background: C.accent + '22',
                border: '1px solid ' + C.accent + '44',
                color: C.accent,
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              \u23f1 Start {ex.rest}s Rest Timer
            </button>
          )}

          {supersetInfo && (
            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 8,
                background: '#14b8a611',
                border: '1px solid #14b8a633',
                borderLeft: '3px solid #14b8a6'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    background: '#14b8a622',
                    border: '1px solid #14b8a644',
                    textAlign: 'center',
                    lineHeight: '20px',
                    fontSize: 11,
                    fontWeight: 800,
                    color: '#14b8a6'
                  }}
                >
                  L
                </span>
                <span style={{ fontWeight: 700, fontSize: 12, color: '#14b8a6' }}>{supersetInfo.title}</span>
                <span style={{ fontSize: 11, color: C.textDim, marginLeft: 4 }}>{supersetInfo.sets}</span>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginBottom: 4 }}>
                {supersetInfo.instruction}
              </div>
              <div style={{ fontSize: 10, color: '#14b8a6' }}>\ud83d\udee1\ufe0f {supersetInfo.safety}</div>
              {supersetInfo.note && (
                <div style={{ fontSize: 10, color: C.warning, marginTop: 4 }}>
                  \u26a0\ufe0f {supersetInfo.note}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
