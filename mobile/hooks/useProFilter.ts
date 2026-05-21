import { useMemo, useState } from 'react';
import { PROS, type Pro } from '../lib/mock-data';
import { distanceKm, type Coords } from '../lib/location';

export type SortKey = 'distance' | 'rating' | 'price';

export const SLUG_MAP: Record<string, string> = {
  plomberie: 'Plomberie', electricite: 'Électricité', menuiserie: 'Menuiserie', peinture: 'Peinture',
  couture: 'Couture', coiffure: 'Coiffure', design: 'Design', 'dev-web': 'Dev',
  beatmaking: 'Beatmaking', photographie: 'Photographie',
};

export function useProFilter(initialCat: string = 'all', userCoords?: Coords) {
  const [cat, setCat] = useState<string>(initialCat);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('distance');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = useMemo(() => {
    let list: (Pro & { distanceKm?: number })[] = PROS.filter((p) => {
      if (cat !== 'all' && !p.tags.includes(SLUG_MAP[cat])) return false;
      if (query && !p.name.toLowerCase().includes(query.toLowerCase()) && !p.bio.toLowerCase().includes(query.toLowerCase())) return false;
      if (verifiedOnly && !p.verified) return false;
      return true;
    });
    if (userCoords) {
      list = list.map((p) => ({ ...p, distanceKm: distanceKm(userCoords, { lat: p.lat, lng: p.lng }) }));
    }
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === 'price') list = [...list].sort((a, b) => a.services[0].price - b.services[0].price);
    else if (sort === 'distance' && userCoords) list = [...list].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
    return list;
  }, [cat, query, sort, verifiedOnly, userCoords]);

  return { cat, setCat, query, setQuery, sort, setSort, verifiedOnly, setVerifiedOnly, filtered };
}
