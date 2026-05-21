import * as Lucide from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

export type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

// kebab-case → PascalCase (e.g. "map-pin" → "MapPin").
function toPascal(name: string): string {
  return name.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

// Aliases for names used in the codebase that don't map 1:1 to lucide-react-native.
const ALIASES: Record<string, string> = {
  paint: 'Paintbrush',
  message: 'MessageCircle',
  grid: 'Grid3x3',
  'circle-check': 'CircleCheck',
  'circle-pause': 'CirclePause',
  'circle-help': 'CircleHelp',
};

function resolve(name: string): LucideIcon {
  const aliased = ALIASES[name];
  const key = aliased ?? toPascal(name);
  const Cmp = (Lucide as unknown as Record<string, LucideIcon>)[key];
  return Cmp ?? Lucide.CircleHelp;
}

export function Icon({ name, size = 20, color = '#000', strokeWidth = 2 }: IconProps) {
  const Cmp = resolve(name);
  return <Cmp size={size} color={color} strokeWidth={strokeWidth} />;
}
