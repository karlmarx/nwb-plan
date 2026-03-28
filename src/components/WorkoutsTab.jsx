import WorkoutView from './WorkoutView';

const WORKOUT_KEYS = ['Push A', 'Push B', 'Pull A', 'Pull B', 'Legs A', 'Legs B', 'Recovery'];

export default function WorkoutsTab({
  phase,
  openSections,
  onToggleSection,
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
  onTimer,
}) {
  return (
    <div>
      {WORKOUT_KEYS.map((k) => (
        <WorkoutView
          key={k}
          workoutKey={k}
          phase={phase}
          isOpen={!!openSections[k]}
          onToggle={() => onToggleSection(k)}
          hevyIds={hevyIds}
          expandedEx={expandedEx}
          onToggleEx={onToggleEx}
          equipment={equipment}
          swaps={swaps}
          onSwap={onSwap}
          onDiagram={onDiagram}
          supplementToggles={supplementToggles}
          onToggleSupplement={onToggleSupplement}
          variantSelections={variantSelections}
          onVariantChange={onVariantChange}
          onTimer={onTimer}
        />
      ))}
    </div>
  );
}
