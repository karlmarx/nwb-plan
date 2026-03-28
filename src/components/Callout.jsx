import { C } from '../theme';

const cfg = {
  danger: { bg: C.dangerBg, border: C.dangerBorder, color: C.danger, icon: '🚫' },
  warning: { bg: C.warningBg, border: C.warningBorder, color: C.warning, icon: '⚠️' },
  safe: { bg: C.safeBg, border: C.safeBorder, color: C.safe, icon: '✅' },
  info: { bg: C.accentDim + '44', border: C.accentDim, color: C.accent, icon: '💡' }
};

export default function Callout({ type, children }) {
  const c = cfg[type] || cfg.info;
  return (
    <div
      style={{
        padding: '11px 13px',
        borderRadius: 8,
        background: c.bg,
        border: '1px solid ' + c.border,
        marginBottom: 10,
        fontSize: 12,
        lineHeight: 1.6,
        color: c.color
      }}
    >
      {c.icon} {children}
    </div>
  );
}
