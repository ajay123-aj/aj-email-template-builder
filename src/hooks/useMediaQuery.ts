import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  // Default true for min-width so desktop layout shows immediately (no flash of mobile layout)
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return query.startsWith('(min-width:') ? true : false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const m = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener('change', handler);
    setMatches(m.matches);
    return () => m.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
