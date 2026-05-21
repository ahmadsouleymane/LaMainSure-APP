import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentName = 'brand' | 'terracotta' | 'indigo' | 'honey';

export type Tokens = {
  // Surfaces
  ink: string;
  inkPure: string;
  paper: string;
  paperSoft: string;
  fg2: string;
  fg3: string;
  line: string;
  lineSoft: string;
  surfaceTint: string;
  // Semantic
  link: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  warning: string;
  warningBg: string;
  rating: string;
  // Accent
  accent: string;
  accentInk: string;
  accentSoft: string;
  // Shadow opacity for elevation prop adapters
  isDark: boolean;
};

const LIGHT_BASE = {
  ink: '#040f0f',
  inkPure: '#000000',
  paper: '#ffffff',
  paperSoft: '#f4f6f6',
  fg2: '#5a6464',
  fg3: '#8e9696',
  line: '#d8dcdc',
  lineSoft: '#ebedee',
  surfaceTint: 'rgba(4,15,15,0.03)',
};

const DARK_BASE = {
  ink: '#f4f6f6',
  inkPure: '#ffffff',
  paper: '#0d1414',
  paperSoft: '#161e1e',
  fg2: '#9aa4a4',
  fg3: '#6a7474',
  line: '#283030',
  lineSoft: '#1d2424',
  surfaceTint: 'rgba(255,255,255,0.04)',
};

const SEMANTIC = {
  link: '#0a66c2',
  success: '#0a7a3c',
  warning: '#b56a00',
  danger: '#cc0000',
  rating: '#f0a500',
};

const SEMANTIC_BG_LIGHT = {
  successBg: '#e8f5ed',
  warningBg: '#fdf3e1',
  dangerBg: '#fdecec',
};
const SEMANTIC_BG_DARK = {
  successBg: '#0e2e1d',
  warningBg: '#2e2410',
  dangerBg: '#2e1414',
};

const ACCENTS: Record<AccentName, { light: { accent: string; accentInk: string; accentSoft: string }; dark: { accent: string; accentInk: string; accentSoft: string } }> = {
  brand: {
    light: { accent: '#00b295', accentInk: '#024c3f', accentSoft: '#d6f0eb' },
    dark: { accent: '#2dd1b3', accentInk: '#c6f4ea', accentSoft: '#0a3a30' },
  },
  terracotta: {
    light: { accent: '#c7522a', accentInk: '#5a2410', accentSoft: '#f6e6dd' },
    dark: { accent: '#e07a4f', accentInk: '#ffd9c7', accentSoft: '#3d1f12' },
  },
  indigo: {
    light: { accent: '#2e3a8c', accentInk: '#1a205c', accentSoft: '#e1e4f3' },
    dark: { accent: '#6a78d6', accentInk: '#d6dbf5', accentSoft: '#1a1e3d' },
  },
  honey: {
    light: { accent: '#b8841f', accentInk: '#5a3f0a', accentSoft: '#f5e9d0' },
    dark: { accent: '#e0aa44', accentInk: '#f5e0b6', accentSoft: '#3a2a0d' },
  },
};

export const spacing = { s1: 4, s2: 8, s3: 12, s4: 16, s5: 24, s6: 32, s7: 48 } as const;
export const radius = { sm: 8, md: 10, lg: 12, xl: 16, pill: 999 } as const;
export const fonts = {
  display: 'RobotoMono_700Bold',
  displayRegular: 'RobotoMono_400Regular',
  displayMedium: 'RobotoMono_500Medium',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export function sansFontFor(weight?: '400' | '500' | '600' | '700' | string) {
  switch (weight) {
    case '700': return fonts.sansBold;
    case '600': return fonts.sansSemibold;
    case '500': return fonts.sansMedium;
    default: return fonts.sansRegular;
  }
}

export const type = {
  display: { fontFamily: fonts.display, fontWeight: '700' as const, letterSpacing: -0.5 },
  sans: { fontFamily: fonts.sansRegular as string | undefined },
};
export const motion = { fast: 150, base: 200, slow: 280 };

function buildTokens(isDark: boolean, accentName: AccentName): Tokens {
  const base = isDark ? DARK_BASE : LIGHT_BASE;
  const semBg = isDark ? SEMANTIC_BG_DARK : SEMANTIC_BG_LIGHT;
  const a = ACCENTS[accentName][isDark ? 'dark' : 'light'];
  return { ...base, ...SEMANTIC, ...semBg, ...a, isDark };
}

type Ctx = {
  t: Tokens;
  mode: ThemeMode;
  accent: AccentName;
  setMode: (m: ThemeMode) => void;
  setAccent: (a: AccentName) => void;
};

const ThemeCtx = createContext<Ctx | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [accent, setAccent] = useState<AccentName>('brand');
  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const t = useMemo(() => buildTokens(isDark, accent), [isDark, accent]);
  const value = useMemo(() => ({ t, mode, accent, setMode, setAccent }), [t, mode, accent]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
