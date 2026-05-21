import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type Role = 'client' | 'pro';

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  toggle: () => void;
};

const RoleCtx = createContext<Ctx | undefined>(undefined);

export function RoleProvider({ children, initial = 'client' as Role }: { children: ReactNode; initial?: Role }) {
  const [role, setRole] = useState<Role>(initial);
  const value = useMemo<Ctx>(() => ({
    role,
    setRole,
    toggle: () => setRole((r) => (r === 'client' ? 'pro' : 'client')),
  }), [role]);
  return <RoleCtx.Provider value={value}>{children}</RoleCtx.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleCtx);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
