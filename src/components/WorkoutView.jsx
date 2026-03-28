import { useMemo } from 'react';
import { C } from '../theme';
import { EX } from '../data/exercises';
import { WORKOUTS, CORE_FINISHERS } from '../data/program';
import { SUPPLEMENT_LEFT_LEG, SUPPLEMENT_CORE, EQ_VARIANTS, CABLE_SUPERSET } from '../data/supplements';
import Section from './Section';
import ExerciseCard from './ExerciseCard';
import Badge from './Badge';

function RemovedRow({ name, reason }) {
  return (
    <div
      style={{
        padding: '8px 11px',
        marginBottom: 4,
        borderRadius: 8,
        background: C.dangerBg,
        border: '1px solid ' + C.dangerBorder,
        opacity: 0.7
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{ textDecoration: 'line-through', color: C.danger, fontSize: 12, fontWeight: 600 }}>{name}</span>
        <Badge color={C.danger}>REMOVED</Badge>
      </div>
      <div style={{ fontSize: 11, color: C.danger, marginTop: 2 }}>⚠ {reason}</div>
    </div>
  );
}

function parseHevyId(input) {
  if (!input) return '';
  const match = input.match(/hevy\.com\/routine\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : input.trim();
}

export default function WorkoutView({
  workoutKey,
  phase,
  isOpen,
  onToggle,
  hevyIds,
  expandedEx,
  onToggleEx,
  equipment,
  swaps,
  onSwap,
  onDiagram,
  supplementToggles,
  onToggleSupplement,
  variantSelections,
  onVariantChange,
  onTimer
}) {
  const w = WORKOUTS[workoutKey];
  if (!w) return null;

  const hevyId = parseHevyId(hevyIds[workoutKey] || w.hevy);
  const isTrainingDay = SUPPLEMENT_CORE[workoutKey] != null;
  const isLegsDay = workoutKey === 'Legs A' || workoutKey === 'Legs B';

  const getExName = (origName) => {
    const key = workoutKey + ':' + origName;
    return swaps[key] || origName;
  };

  const isAvailable = (exName) => {
    const ex = EX[exName];
    if (!ex) return true;
    return ex.requires.every((r) => equipment[r] !== false);
  };

  const resetSwap = (origName) => {
    const key = workoutKey + ':' + origName;
    onSwap(workoutKey, origName, null); // null = reset
  };

  // Find first cable exercise
  const firstCableEx = useMemo(() => {
    for (let ci = 0; ci < w.exercises.length; ci++) {
      const cn = getExName(w.exercises[ci]);
      if (EQ_VARIANTS[cn] && EQ_VARIANTS[cn].isCable) return cn;
    }
    return null;
  }, [workoutKey, swaps, w.exercises]);

  // Build supplement pairings
  const { suppMap, coreSubtitle } = useMemo(() => {
    if (!isTrainingDay) return { suppMap: {}, coreSubtitle: '' };

    const llExercises = SUPPLEMENT_LEFT_LEG.base.slice();
    if (isLegsDay) llExercises.push(...SUPPLEMENT_LEFT_LEG.legsExtra);
    const coreExData = SUPPLEMENT_CORE[workoutKey].exercises;
    const subtitle = SUPPLEMENT_CORE[workoutKey].subtitle;

    const allSupps = [];
    const maxSL = Math.max(llExercises.length, coreExData.length);
    for (let si = 0; si < maxSL; si++) {
      if (si < llExercises.length) allSupps.push({ type: 'leftleg', name: llExercises[si] });
      if (si < coreExData.length) allSupps.push({ type: 'core', name: coreExData[si].name, region: coreExData[si].region });
    }

    const activeEx = w.exercises.filter((orig) => {
      const en = getExName(orig);
      const exd = EX[en];
      return exd && (exd.phase == null || phase >= exd.phase);
    });

    const map = {};
    for (let sj = 0; sj < allSupps.length; sj++) {
      const target = activeEx[sj % activeEx.length];
      if (!map[target]) map[target] = [];
      map[target].push(allSupps[sj]);
    }
    return { suppMap: map, coreSubtitle: subtitle };
  }, [workoutKey, phase, isTrainingDay, isLegsDay, swaps]);

  return (
    <Section
      title={w.title}
      icon={w.icon}
      accent={w.color}
      isOpen={isOpen}
      onToggle={onToggle}
      count={w.exercises.length}
    >
      {hevyId && (
        <div style={{ marginBottom: 10 }}>
          <a
            href={'https://hevy.com/routine/' + hevyId}
            target="_blank"
            rel="noopener"
            onClick={(ev) => ev.stopPropagation()}
            style={{
              display: 'block',
              textAlign: 'center',
              padding: '8px',
              borderRadius: 8,
              background: '#a78bfa22',
              border: '1px solid #a78bfa44',
              color: '#a78bfa',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            Open in HEVY
          </a>
        </div>
      )}

      {workoutKey === 'Recovery' && (
        <a
          href="https://nwb-yoga.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(ev) => ev.stopPropagation()}
          style={{
            display: 'block',
            marginBottom: 12,
            padding: '10px 14px',
            borderRadius: 8,
            background: '#1e293b',
            border: '1px solid #334155',
            textDecoration: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="#F5F0EB">
              <circle cx="12" cy="4.5" r="2.5" />
              <path d="M12 1.5c-2.5 0-4.5 1.5-5 3.5 0 .3.2.5.5.4C8.5 5 10.2 4.5 12 4.5s3.5.5 4.5.9c.3.1.5-.1.5-.4-.5-2-2.5-3.5-5-3.5z" opacity="0.6" />
              <path d="M10.5 7.5h3v4.5h-3z" />
              <path d="M10.5 9L7 12h2l1.5-2zM13.5 9L17 12h-2l-1.5-2z" />
              <path d="M5.5 17c0-2.8 2.9-5 6.5-5s6.5 2.2 6.5 5c0 1.5-1 2.8-2.5 3.5-1.2-.8-2.5-1.2-4-1.2s-2.8.4-4 1.2C6.5 19.8 5.5 18.5 5.5 17z" />
            </svg>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F0EB' }}>
                NWB Yoga — Companion App
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                3 guided tiers · 14 animated poses · built-in timer
              </div>
            </div>
            <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: 12 }}>→</span>
          </div>
        </a>
      )}

      {/* Supplement toggle controls */}
      {isTrainingDay && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
          <button
            onClick={(ev) => { ev.stopPropagation(); onToggleSupplement('leftLeg'); }}
            style={{
              fontSize: 10,
              padding: '4px 10px',
              borderRadius: 10,
              background: supplementToggles.leftLeg ? '#14b8a618' : 'transparent',
              border: '1px solid ' + (supplementToggles.leftLeg ? '#14b8a644' : C.border),
              color: supplementToggles.leftLeg ? '#14b8a6' : C.textMuted,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: supplementToggles.leftLeg ? 600 : 400
            }}
          >
            🦿 L-Leg Supersets {supplementToggles.leftLeg ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={(ev) => { ev.stopPropagation(); onToggleSupplement('core'); }}
            style={{
              fontSize: 10,
              padding: '4px 10px',
              borderRadius: 10,
              background: supplementToggles.core ? '#f9731618' : 'transparent',
              border: '1px solid ' + (supplementToggles.core ? '#f9731644' : C.border),
              color: supplementToggles.core ? '#f97316' : C.textMuted,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: supplementToggles.core ? 600 : 400
            }}
          >
            🎯 Core Supersets {supplementToggles.core ? 'ON' : 'OFF'}
            {coreSubtitle ? ' — ' + coreSubtitle : ''}
          </button>
        </div>
      )}

      {w.exercises.map((origName) => {
        const exName = getExName(origName);
        const ex = EX[exName];
        if (!ex) return null;
        if (ex.phase != null && phase < ex.phase) return null;

        const unavail = !isAvailable(exName);
        const vData = EQ_VARIANTS[exName] || null;
        const selVariant = vData ? (variantSelections[exName] || vData.variants[0].id) : null;

        // Equipment-specific superset
        let ssInfo = null;
        if (supplementToggles.leftLeg) {
          if (vData) {
            if (vData.isCable) {
              if (exName === firstCableEx) {
                ssInfo = {
                  title: CABLE_SUPERSET.title,
                  sets: CABLE_SUPERSET.sets,
                  instruction: CABLE_SUPERSET.instruction,
                  safety: CABLE_SUPERSET.safety
                };
                if (selVariant === 'lat-machine') {
                  ssInfo.note =
                    'No low cable available on this machine — do ankle dorsiflexion at nearest cable column between sets or save for next cable exercise.';
                }
              }
            } else if (vData.variantSuperset && vData.variantSuperset[selVariant]) {
              ssInfo = vData.variantSuperset[selVariant];
            } else if (vData.superset) {
              ssInfo = Object.assign({}, vData.superset);
              if (vData.variantSupersetNotes && vData.variantSupersetNotes[selVariant]) {
                ssInfo.note = vData.variantSupersetNotes[selVariant];
              }
            }
          }
        }

        const suppCards = suppMap[origName] || [];
        const activeSuppCards = suppCards.filter((supp) => {
          const isLL = supp.type === 'leftleg';
          return (isLL && supplementToggles.leftLeg) || (!isLL && supplementToggles.core);
        });
        const isExp = !!expandedEx[exName];

        const llExercises = isTrainingDay
          ? [...SUPPLEMENT_LEFT_LEG.base, ...(isLegsDay ? SUPPLEMENT_LEFT_LEG.legsExtra : [])]
          : [];
        const coreExData = isTrainingDay && SUPPLEMENT_CORE[workoutKey] ? SUPPLEMENT_CORE[workoutKey].exercises : [];

        return (
          <div key={origName}>
            {exName !== origName && (
              <div style={{ fontSize: 10, color: C.textMuted, padding: '2px 12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>↻ was: {origName}</span>
                <button
                  onClick={() => resetSwap(origName)}
                  style={{ fontSize: 10, color: C.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}
                >
                  undo
                </button>
              </div>
            )}
            <ExerciseCard
              name={exName}
              ex={ex}
              phase={phase}
              isExpanded={isExp}
              onToggle={() => onToggleEx(exName)}
              onSwap={(sw) => onSwap(workoutKey, origName, sw)}
              onDiagram={onDiagram}
              unavailable={unavail}
              equipment={equipment}
              variantData={vData}
              selectedVariant={selVariant}
              onVariantChange={(vid) => onVariantChange(exName, vid)}
              supersetInfo={ssInfo}
            />

            {/* Collapsed supplement indicator */}
            {!isExp && activeSuppCards.length > 0 && (
              <div
                onClick={() => onToggleEx(exName)}
                style={{
                  cursor: 'pointer',
                  margin: '-4px 0 4px',
                  padding: '4px 12px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'linear-gradient(90deg, #14b8a608, #f9731608)',
                  borderRadius: '0 0 8px 8px',
                  borderLeft: '3px solid transparent',
                  borderImage: 'linear-gradient(to bottom, #14b8a644, #f9731644) 1'
                }}
              >
                {activeSuppCards.map((supp, si) => {
                  const isLL = supp.type === 'leftleg';
                  const accent = isLL ? '#14b8a6' : '#f97316';
                  const label = isLL ? 'L' : 'C';
                  return (
                    <span key={'ind-' + si} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 14,
                          height: 14,
                          borderRadius: 3,
                          background: accent + '22',
                          border: '1px solid ' + accent + '44',
                          fontSize: 7,
                          fontWeight: 800,
                          color: accent
                        }}
                      >
                        {label}
                      </span>
                      <span style={{ fontSize: 9, color: accent, opacity: 0.8, fontWeight: 600 }}>
                        {supp.name.length > 20 ? supp.name.substring(0, 18) + '...' : supp.name}
                      </span>
                    </span>
                  );
                })}
                <span style={{ marginLeft: 'auto', fontSize: 8, color: C.textMuted }}>▼ tap to expand</span>
              </div>
            )}

            {/* Inline supplement superset cards (expanded) */}
            {isExp && suppCards.length > 0 && (
              <div style={{ padding: '0 4px 4px' }}>
                {suppCards.map((supp) => {
                  const isLL = supp.type === 'leftleg';
                  if (isLL && !supplementToggles.leftLeg) return null;
                  if (!isLL && !supplementToggles.core) return null;
                  const suppEx = EX[supp.name];
                  if (!suppEx) return null;
                  const accent = isLL ? '#14b8a6' : '#f97316';
                  const suppSets = suppEx.sets[phase] || suppEx.sets[0];
                  const suppExpKey = 'supp_' + supp.name;
                  const suppIsExp = !!expandedEx[suppExpKey];

                  const groupTotal = isLL ? llExercises.length : coreExData.length;
                  const groupIdx = isLL
                    ? llExercises.indexOf(supp.name) + 1
                    : coreExData.findIndex((c) => c.name === supp.name) + 1;
                  const groupLabel = groupIdx + '/' + groupTotal;

                  if (isLL) {
                    return (
                      <div
                        key={'supp-' + supp.name}
                        style={{
                          margin: '2px 0 4px',
                          borderRadius: 8,
                          background: '#14b8a609',
                          border: '1px solid #14b8a628',
                          borderLeft: '3px solid #14b8a6',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          onClick={() => onToggleEx(suppExpKey)}
                          style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              background: '#14b8a622',
                              border: '1px solid #14b8a644',
                              fontSize: 9,
                              fontWeight: 800,
                              color: '#14b8a6',
                              flexShrink: 0
                            }}
                          >
                            L
                          </span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#14b8a6', opacity: 0.7 }}>{groupLabel}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#14b8a6', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            Left Leg
                          </span>
                          <span style={{ fontWeight: 600, fontSize: 12, color: C.text, flex: 1 }}>{supp.name}</span>
                          <span style={{ fontSize: 10, color: C.textDim }}>{suppSets[0] + '×' + suppSets[1]}</span>
                          <span style={{ fontSize: 9, color: '#14b8a6', marginLeft: 4 }}>{suppIsExp ? '▲' : '▼'}</span>
                        </div>
                        {suppIsExp && (
                          <div style={{ padding: '0 10px 10px', fontSize: 11, lineHeight: 1.6 }}>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, color: '#14b8a6', fontSize: 10 }}>📍 Setup: </span>
                              <span style={{ color: C.textDim }}>{suppEx.setup}</span>
                            </div>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, color: C.safe, fontSize: 10 }}>🔄 Execute: </span>
                              <span style={{ color: C.textDim }}>{suppEx.execution}</span>
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, color: '#14b8a6', fontSize: 10 }}>🛡️ Safety: </span>
                              <span style={{ color: C.textDim }}>{suppEx.nwbCues}</span>
                            </div>
                            {suppEx.rest > 0 && (
                              <button
                                onClick={(ev) => { ev.stopPropagation(); onTimer(suppEx.rest); }}
                                style={{
                                  marginTop: 8,
                                  width: '100%',
                                  padding: '7px',
                                  borderRadius: 6,
                                  background: '#14b8a618',
                                  border: '1px solid #14b8a633',
                                  color: '#14b8a6',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                ⏱ Start {suppEx.rest}s Rest
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    const regionColors = { 'Upper Abs': '#f59e0b', 'Lower Abs': '#ec4899', Obliques: '#a78bfa' };
                    const regionColor = regionColors[supp.region] || '#f97316';
                    return (
                      <div
                        key={'supp-' + supp.name}
                        style={{
                          margin: '2px 0 4px',
                          borderRadius: 8,
                          overflow: 'hidden',
                          border: '1px dashed #f9731633',
                          background: 'linear-gradient(135deg, #f9731608 0%, #f9731603 100%)'
                        }}
                      >
                        <div style={{ height: 3, background: 'linear-gradient(90deg, ' + regionColor + ', ' + regionColor + '66)' }} />
                        <div
                          onClick={() => onToggleEx(suppExpKey)}
                          style={{ padding: '8px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: 20,
                              height: 20,
                              borderRadius: 10,
                              background: '#f9731622',
                              border: '1px solid #f9731644',
                              fontSize: 8,
                              fontWeight: 800,
                              color: '#f97316',
                              flexShrink: 0,
                              padding: '0 4px'
                            }}
                          >
                            {groupLabel}
                          </span>
                          <span
                            style={{
                              fontSize: 8,
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: 8,
                              background: regionColor + '22',
                              border: '1px solid ' + regionColor + '44',
                              color: regionColor,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              flexShrink: 0
                            }}
                          >
                            {supp.region || 'Core'}
                          </span>
                          <span style={{ fontWeight: 600, fontSize: 12, color: C.text, flex: 1 }}>{supp.name}</span>
                          <span style={{ fontSize: 10, color: C.textDim }}>{suppSets[0] + '×' + suppSets[1]}</span>
                          <span style={{ fontSize: 9, color: '#f97316', marginLeft: 4 }}>{suppIsExp ? '▲' : '▼'}</span>
                        </div>
                        {suppIsExp && (
                          <div style={{ padding: '0 10px 10px', fontSize: 11, lineHeight: 1.6 }}>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, color: '#f97316', fontSize: 10 }}>📍 Setup: </span>
                              <span style={{ color: C.textDim }}>{suppEx.setup}</span>
                            </div>
                            <div style={{ marginBottom: 6 }}>
                              <span style={{ fontWeight: 700, color: C.safe, fontSize: 10 }}>🔄 Execute: </span>
                              <span style={{ color: C.textDim }}>{suppEx.execution}</span>
                            </div>
                            <div>
                              <span style={{ fontWeight: 700, color: '#f97316', fontSize: 10 }}>🛡️ Safety: </span>
                              <span style={{ color: C.textDim }}>{suppEx.nwbCues}</span>
                            </div>
                            {suppEx.rest > 0 && (
                              <button
                                onClick={(ev) => { ev.stopPropagation(); onTimer(suppEx.rest); }}
                                style={{
                                  marginTop: 8,
                                  width: '100%',
                                  padding: '7px',
                                  borderRadius: 6,
                                  background: '#f9731618',
                                  border: '1px solid #f9731633',
                                  color: '#f97316',
                                  fontSize: 11,
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  fontFamily: 'inherit'
                                }}
                              >
                                ⏱ Start {suppEx.rest}s Rest
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                })}
              </div>
            )}
          </div>
        );
      })}

      {w.removed.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid ' + C.border }}>
          {w.removed.map((r) => <RemovedRow key={r.name} name={r.name} reason={r.reason} />)}
        </div>
      )}

      {CORE_FINISHERS[workoutKey] && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 10,
            borderTop: '1px dashed #334155',
            background: '#0d131f',
            borderRadius: 8,
            padding: 10,
            border: '1px solid #1e293b'
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 8, letterSpacing: 0.3 }}>
            🔥 Core Finisher — pick 1–2
          </div>
          {CORE_FINISHERS[workoutKey].map((name) => {
            const ex = EX[name];
            if (!ex) return null;
            return (
              <ExerciseCard
                key={'cf-' + name}
                name={name}
                ex={ex}
                phase={phase}
                isExpanded={!!expandedEx[name]}
                onToggle={() => onToggleEx(name)}
                onSwap={(sw) => {
                  if (sw.startsWith('__timer__')) onTimer(parseInt(sw.replace('__timer__', '')));
                }}
                onDiagram={onDiagram}
                unavailable={!isAvailable(name)}
                equipment={equipment}
              />
            );
          })}
        </div>
      )}
    </Section>
  );
}
