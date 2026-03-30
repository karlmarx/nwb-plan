import NWBCoreGuide from '../../nwb-obliques';

export default function CoreDemoGuide({ onClose }) {
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          background: '#1a1a1a',
          border: '1px solid #444',
          color: '#aaa',
          borderRadius: 5,
          padding: '4px 12px',
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        ✕
      </button>
      <NWBCoreGuide />
    </div>
  );
}
