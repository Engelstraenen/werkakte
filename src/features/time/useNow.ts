import { useEffect, useState } from 'react';

/** Aktuelle Zeit, alle 10 s neu – für laufende Uhren. */
export function useNow(active = true) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}
