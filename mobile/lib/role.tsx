import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useProfile } from './profile';

export type Role = 'client' | 'pro';

type Ctx = {
  role: Role;
  /** true when the signed-in user is allowed to act as a pro (KYC-enabled). */
  canBePro: boolean;
  setRole: (r: Role) => void;
  toggle: () => void;
};

const RoleCtx = createContext<Ctx | undefined>(undefined);

export function RoleProvider({ children, initial = 'client' as Role }: { children: ReactNode; initial?: Role }) {
  const { profile } = useProfile();
  const [role, setRole] = useState<Role>(initial);
  const syncedFor = useRef<string | null>(null);

  // Initialise the active view from the DB profile once per signed-in user.
  // A pro can still switch to the client view afterwards (browse as client).
  useEffect(() => {
    if (!profile) { syncedFor.current = null; return; }
    if (syncedFor.current === profile.id) return;
    syncedFor.current = profile.id;
    setRole(profile.role === 'pro' && profile.is_pro_enabled ? 'pro' : 'client');
  }, [profile]);

  const canBePro = !!(profile && profile.role === 'pro' && profile.is_pro_enabled);

  const value = useMemo<Ctx>(() => ({
    role,
    canBePro,
    setRole,
    toggle: () => setRole((r) => (r === 'client' ? 'pro' : 'client')),
  }), [role, canBePro]);
  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
