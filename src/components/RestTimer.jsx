import { useState, useEffect, useRef } from 'react';
import { C } from '../theme';

export default function RestTimer({ seconds, onClose }) {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [seconds]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  return (
    <div className="rest-timer">
      <div
        className="time"
        style={remaining === 0 ? { color: C.safe, animation: 'pulse 1s infinite' } : {}}
      >
        {remaining === 0
          ? 'GO!'
          : (mins > 0 ? mins + ':' : '') +
            (secs < 10 && mins > 0 ? '0' : '') +
            secs}
      </div>
      <button onClick={onClose}>✕ Close</button>
    </div>
  );
}
