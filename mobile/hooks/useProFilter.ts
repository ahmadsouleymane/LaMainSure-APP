import { useEffect, useMemo, useRef, useState } from 'react';
import type { Pro } from '../lib/mock-data';
import { fetchProsNearby } from '../lib/api';
import type { Coords } from '../lib/location';

export type SortKey = 'distance' | 'rating' | 'price';

// Re-exported for backward compatibility; canonical definition lives in lib/mock-data.
export { SLUG_MAP } from '../lib/mock-data';

export function useProFilter(initialCat: string = 'all', userCoords?: Coords) {
  const [cat, setCat] = useState<string>(initialCat);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('distance');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [pros, setPros] = useState<Pro[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);

  // Fetch from the backend whenever the search inputs change (query debounced).
  useEffect(() => {
    if (!userCoords) return;
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    const handle = setTimeout(() => {
      fetchProsNearby({ coords: userCoords, categorySlug: cat, search: query })
        .then((list) => { if (id === reqId.current) setPros(list); })
        .catch((e) => { if (id === reqId.current) setError(e?.message ?? 'Erreur de chargement.'); })
        .finally(() => { if (id === reqId.current) setLoading(false); });
    }, query ? 300 : 0);
    return () => clearTimeout(handle);
  }, [cat, query, userCoords?.lat, userCoords?.lng]);

  const filtered = useMemo(() => {
    let list = pros;
    if (verifiedOnly) list = list.filter((p) => p.verified);
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === 'price') list = [...list].sort((a, b) => (a.services[0]?.price ?? 0) - (b.services[0]?.price ?? 0));
    // 'distance' keeps the backend order (already sorted by distance).
    return list;
  }, [pros, sort, verifiedOnly]);

  return { cat, setCat, query, setQuery, sort, setSort, verifiedOnly, setVerifiedOnly, filtered, loading, error };
}
