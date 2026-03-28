import { C } from '../theme';

export default function Section({ title, icon, children, isOpen, onToggle, accent, count }) {
  const ac = accent || C.accent;
  return (
    <div
      style={{
        marginBottom: 10,
        borderRadius: 10,
        border: '1px solid ' + (isOpen ? ac + '44' : C.border),
        background: C.card,
        overflow: 'hidden'
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '13px 14px',
          background: 'none',
          border: 'none',
          color: C.text,
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'inherit'
        }}
      >
        <span style={{ fontSize: 17 }}>{icon}</span>
        <span style={{ flex: 1 }}>{title}</span>
        {count != null && (
          <span style={{ fontSize: 11, color: C.textMuted, marginRight: 8 }}>
            {count} exercises
          </span>
        )}
        <span
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            fontSize: 11,
            color: C.textMuted
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: '0 14px 14px', lineHeight: 1.6 }}>{children}</div>
      )}
    </div>
  );
}
