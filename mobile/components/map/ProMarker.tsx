import { View } from 'react-native';
import { useTheme } from '../../lib/theme';
import { ICON_FOR_TAG } from '../../lib/mock-data';
import { Icon } from '../ui/Icon';

export function ProMarker({ tag, selected }: { tag?: string; selected?: boolean }) {
  const { t } = useTheme();
  const iconName = tag ? (ICON_FOR_TAG[tag] || 'briefcase') : 'briefcase';
  const bg = selected ? t.accent : t.paper;
  const fg = selected ? '#ffffff' : t.accent;
  const ring = selected ? t.accent : t.accentSoft;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: selected ? 44 : 36,
        height: selected ? 44 : 36,
        borderRadius: 999,
        backgroundColor: bg,
        borderWidth: selected ? 2 : 3,
        borderColor: ring,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#040f0f',
        shadowOpacity: 0.18,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
      }}>
        <Icon name={iconName} size={selected ? 22 : 18} color={fg} />
      </View>
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6,
        borderLeftColor: 'transparent', borderRightColor: 'transparent',
        borderTopColor: ring,
        marginTop: -1,
      }} />
    </View>
  );
}
