import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';
import { CITY_CENTERS } from './mock-data';

export type Coords = { lat: number; lng: number };
export type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export type UserLocation = {
  coords: Coords;
  isFallback: boolean;
  inService: boolean;
  status: LocationStatus;
  error: string | null;
  /** Nom de la ville détectée (reverse geocoding), null tant qu'inconnu. */
  cityName: string | null;
  retry: () => void;
};

// Bounding box du continent africain (inclut îles : Cabo Verde, Madagascar, Maurice, Seychelles).
// Source : approx. continent boundaries. Non parfait mais suffisant pour gate le service.
export const AFRICA_BBOX = {
  minLat: -35.0, // Cap de Bonne-Espérance
  maxLat: 37.5,  // côte tunisienne
  minLng: -25.5, // Cabo Verde ouest
  maxLng: 63.5,  // Maurice / Seychelles est
};

export function isInAfrica(c: Coords): boolean {
  return (
    c.lat >= AFRICA_BBOX.minLat && c.lat <= AFRICA_BBOX.maxLat &&
    c.lng >= AFRICA_BBOX.minLng && c.lng <= AFRICA_BBOX.maxLng
  );
}

// Fallback : centre d'Abidjan (Cocody) si la géoloc est refusée ou indisponible.
const FALLBACK: Coords = CITY_CENTERS.abidjan;

// Reverse geocode coords → city name (best-effort, silent on failure).
async function lookupCity(c: Coords): Promise<string | null> {
  try {
    const res = await Location.reverseGeocodeAsync({ latitude: c.lat, longitude: c.lng });
    const r = res[0];
    return r?.city || r?.subregion || r?.region || null;
  } catch {
    return null;
  }
}

// Shared across the whole app via <LocationProvider> so the GPS fetch +
// reverse-geocode happen once, not once per screen that needs the position.
const LocationContext = createContext<UserLocation | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const value = useLocationState();
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useUserLocation(): UserLocation {
  const ctx = useContext(LocationContext);
  if (ctx) return ctx;
  // Fallback for any screen rendered outside the provider (defensive).
  return useLocationState();
}

function useLocationState(): UserLocation {
  const [coords, setCoords] = useState<Coords>(FALLBACK);
  const [isFallback, setIsFallback] = useState(true);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [inService, setInService] = useState(true);
  const [cityName, setCityName] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setStatus('requesting');
    setError(null);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        setStatus('denied');
        setIsFallback(true);
        setCoords(FALLBACK);
        setInService(true); // fallback est Abidjan, donc dans la zone
        setCityName(await lookupCity(FALLBACK));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const real = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const ok = isInAfrica(real);
      const used = ok ? real : FALLBACK;
      setCoords(used);
      setIsFallback(!ok);
      setInService(ok);
      setStatus('granted');
      setCityName(await lookupCity(used));
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Erreur de localisation.');
      setIsFallback(true);
      setCoords(FALLBACK);
      setInService(true);
      setCityName(await lookupCity(FALLBACK));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return useMemo(
    () => ({ coords, isFallback, inService, status, error, cityName, retry: fetch }),
    [coords.lat, coords.lng, isFallback, inService, status, error, cityName, fetch]
  );
}

// Haversine — distance en km entre deux points.
export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatKm(km: number): string {
  if (km < 1) return Math.round(km * 1000) + ' m';
  return km.toFixed(1).replace('.', ',') + ' km';
}
