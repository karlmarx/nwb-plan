import { C } from '../theme';
import { EQUIPMENT } from '../data/equipment';
import { SCHED } from '../data/program';
import Section from './Section';
import Callout from './Callout';

const CATEGORIES = {
  weights: 'Weights',
  machines: 'Machines',
  functional: 'Functional',
  cardio: 'Cardio Equipment',
  basic: 'Basic Gear',
  home: 'Home Equipment',
};

const START_DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EquipmentTab({
  equipment,
  setEquipment,
  startDay,
  setStartDay,
  openSections,
  onToggleSection,
}) {
  function getWorkoutForDay(dayIdx) {
    const rotationIdx = (dayIdx - startDay + 7) % 7;
    return SCHED[rotationIdx];
  }

  return (
    <div>
      <Section
        title="Week Start Day"
        icon="📅"
        isOpen={!!openSections['week-start']}
        onToggle={() => onToggleSection('week-start')}
      >
        <div style={{ fontSize: 11, color: C.textDim, marginBottom: 10 }}>
          Shift the PPL rotation to start on a different day. Push A always begins on your chosen
          start day.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {START_DAY_NAMES.map((d, i) => {
            const isCurrent = i === startDay;
            return (
              <button
                key={'sd-' + i}
                onClick={() => setStartDay(i)}
                style={{
                  padding: '10px 2px',
                  borderRadius: 8,
                  background: isCurrent ? C.accent + '22' : C.bg,
                  border: '1px solid ' + (isCurrent ? C.accent : C.border),
                  color: isCurrent ? C.accent : C.textMuted,
                  fontSize: 11,
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {d}
              </button>
            );
          })}
        </div>
        {startDay !== 0 && (
          <div style={{ marginTop: 10, fontSize: 11, color: C.textDim, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: C.accent, marginBottom: 4 }}>
              Current rotation:
            </div>
            {START_DAY_NAMES.map((d, i) => {
              const workout = getWorkoutForDay(i);
              return (
                <span
                  key={'rot-' + i}
                  style={{ display: 'inline-block', marginRight: 6, marginBottom: 2 }}
                >
                  {d}={workout.t}
                  {i < 6 ? ' →' : ''}
                </span>
              );
            })}
          </div>
        )}
      </Section>

      <Callout type="info">
        Toggle equipment ON/OFF. Exercises that need unavailable equipment will show alternatives.
      </Callout>

      {Object.keys(CATEGORIES).map((cat) => {
        const items = Object.keys(EQUIPMENT).filter((k) => EQUIPMENT[k].category === cat);
        return (
          <Section
            key={cat}
            title={CATEGORIES[cat]}
            icon="🏋️"
            isOpen={!!openSections['eq-' + cat]}
            onToggle={() => onToggleSection('eq-' + cat)}
          >
            {items.map((eqKey) => {
              const eq = EQUIPMENT[eqKey];
              const isOn = equipment[eqKey] !== false;
              return (
                <div
                  key={eqKey}
                  onClick={() =>
                    setEquipment((prev) => {
                      const n = Object.assign({}, prev);
                      n[eqKey] = !isOn;
                      return n;
                    })
                  }
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 8px',
                    borderRadius: 8,
                    background: isOn ? C.safeBg : C.bg,
                    border: '1px solid ' + (isOn ? C.safeBorder : C.border),
                    marginBottom: 4,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: isOn ? C.safe : C.textMuted + '44',
                      position: 'relative',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 8,
                        background: C.white,
                        position: 'absolute',
                        top: 2,
                        left: isOn ? 18 : 2,
                        transition: 'left 0.2s',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 15 }}>{eq.icon}</span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isOn ? C.text : C.textMuted,
                    }}
                  >
                    {eq.name}
                  </span>
                </div>
              );
            })}
          </Section>
        );
      })}

      <Section
        title="Gym Bag Essentials"
        icon="🎒"
        isOpen={!!openSections['gym-bag']}
        onToggle={() => onToggleSection('gym-bag')}
      >
        {[
          {
            n: 'Furniture Slider',
            d: 'Mandatory for single-leg rowing intervals. Gyms don\'t have these.',
          },
          { n: 'Thick Exercise Mat', d: 'For floor presses and seated battle rope intervals.' },
          {
            n: 'Light Resistance Band',
            d: 'For Pallof presses and Thrower\'s Ten prehab if no cables.',
          },
          {
            n: 'Parallettes (optional)',
            d: 'For L-sits. Can use hex dumbbells at gym instead.',
          },
        ].map((item, i) => (
          <div
            key={'bag-' + i}
            style={{
              padding: 10,
              marginBottom: 5,
              borderRadius: 8,
              background: C.bg,
              borderLeft: '3px solid ' + C.accent,
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 12, color: C.accent }}>{item.n}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{item.d}</div>
          </div>
        ))}
      </Section>
    </div>
  );
}
