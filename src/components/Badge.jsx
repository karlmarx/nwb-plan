export default function Badge({ color, children }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 7px',
        borderRadius: 4,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        background: color + '22',
        color: color,
        border: '1px solid ' + color + '44'
      }}
    >
      {children}
    </span>
  );
}
