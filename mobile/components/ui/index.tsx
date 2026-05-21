import { ReactNode } from 'react';
import {
  ActivityIndicator, Image, Pressable, ScrollView, StyleProp, Text, TextInput, TextStyle, View, ViewStyle,
} from 'react-native';
import { useTheme, fonts } from '../../lib/theme';
import { Icon } from './Icon';
import { ICON_FOR_TAG } from '../../lib/mock-data';

// ─── Theme-aware text styles ───
export function useType() {
  const { t } = useTheme();
  return {
    display: { fontFamily: fonts.display, color: t.ink, letterSpacing: -0.5 },
    h1: { fontSize: 28, fontFamily: fonts.sansBold, color: t.ink },
    h2: { fontSize: 22, fontFamily: fonts.sansBold, color: t.ink },
    body: { fontSize: 14, fontFamily: fonts.sansRegular, color: t.ink },
    label: { fontSize: 13, fontFamily: fonts.sansRegular, color: t.fg2 },
  };
}

// ─── Button ───
type ButtonProps = {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ children, onPress, variant = 'primary', size = 'md', loading, disabled, style }: ButtonProps) {
  const { t } = useTheme();
  const variants: Record<string, { bg: string; color: string; border?: string }> = {
    primary: { bg: t.ink, color: t.paper },
    accent: { bg: t.accent, color: '#fff' },
    danger: { bg: t.danger, color: '#fff' },
    outline: { bg: 'transparent', color: t.ink, border: t.ink },
    ghost: { bg: t.paperSoft, color: t.ink },
  };
  const v = variants[variant];
  const py = size === 'sm' ? 10 : 14;
  const fs = size === 'sm' ? 14 : 16;
  const isDisabled = !!(loading || disabled);
  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [{
        backgroundColor: v.bg,
        borderRadius: 10,
        paddingVertical: py,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: v.border ? 1 : 0,
        borderColor: v.border,
        opacity: isDisabled ? 0.6 : pressed ? 0.7 : 1,
      }, style as ViewStyle]}>
      {loading
        ? <ActivityIndicator color={v.color} />
        : <Text style={{ color: v.color, fontFamily: fonts.sansSemibold, fontSize: fs }}>{children}</Text>}
    </Pressable>
  );
}

// ─── TextField ───
export function TextField(props: {
  value: string; onChangeText: (s: string) => void;
  placeholder?: string; secureTextEntry?: boolean; error?: boolean; editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean; numberOfLines?: number; style?: StyleProp<TextStyle>;
}) {
  const { t } = useTheme();
  return (
    <TextInput
      value={props.value}
      onChangeText={props.onChangeText}
      placeholder={props.placeholder}
      placeholderTextColor={t.fg3}
      secureTextEntry={props.secureTextEntry}
      editable={props.editable !== false}
      keyboardType={props.keyboardType}
      autoCapitalize={props.autoCapitalize}
      multiline={props.multiline}
      numberOfLines={props.numberOfLines}
      style={[{
        borderWidth: 1,
        borderColor: props.error ? t.danger : t.line,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: fonts.sansRegular,
        color: t.ink,
        backgroundColor: t.paper,
        minHeight: props.multiline ? 110 : undefined,
        textAlignVertical: props.multiline ? 'top' : 'auto',
      }, props.style]}
    />
  );
}

// ─── TextLink ───
export function TextLink({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: StyleProp<TextStyle> }) {
  const { t } = useTheme();
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Text style={[{ color: t.link, fontSize: 14, fontFamily: fonts.sansMedium }, style]}>{children}</Text>
    </Pressable>
  );
}

// ─── BrandMark / Wordmark ───
const MARK_DARK = require('../../assets/brand/brand-mark-dark.png');
const MARK_LIGHT = require('../../assets/brand/brand-mark-light.png');
const WORDMARK_DARK = require('../../assets/brand/brand-wordmark-dark.png');
const WORDMARK_TEAL = require('../../assets/brand/brand-wordmark-teal.png');

export function BrandMark({ size = 48, onDark = false }: { size?: number; onDark?: boolean }) {
  return <Image source={onDark ? MARK_DARK : MARK_LIGHT} style={{ width: size, height: size, resizeMode: 'contain' }} />;
}

export function Wordmark({ height = 36, onDark = false }: { height?: number; onDark?: boolean }) {
  const aspect = 2131 / 820;
  return <Image source={onDark ? WORDMARK_TEAL : WORDMARK_DARK} style={{ height, width: height * aspect, resizeMode: 'contain' }} />;
}

// ─── AppHeader ───
export function AppHeader({ title, onBack, right }: { title?: string; onBack?: () => void; right?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, minHeight: 44, backgroundColor: t.paper,
    }}>
      <View style={{ width: 32 }}>
        {onBack && (
          <Pressable onPress={onBack} hitSlop={10}>
            <Icon name="chevron-left" size={28} color={t.ink} />
          </Pressable>
        )}
      </View>
      <Text style={{ fontSize: 17, fontFamily: fonts.sansSemibold, color: t.ink }}>{title}</Text>
      <View style={{ minWidth: 32, flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>{right}</View>
    </View>
  );
}

// ─── Display ───
export function Display({ children, size = 28, color, style }: { children: ReactNode; size?: number; color?: string; style?: StyleProp<TextStyle> }) {
  const { t } = useTheme();
  return (
    <Text style={[{
      fontFamily: fonts.display, fontSize: size,
      color: color ?? t.ink, letterSpacing: -0.5, textTransform: 'uppercase',
    }, style]}>{children}</Text>
  );
}

// ─── SectionTitle ───
export function SectionTitle({ title, right }: { title: string; right?: ReactNode }) {
  const { t } = useTheme();
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text style={{ fontSize: 16, fontFamily: fonts.sansSemibold, color: t.ink }}>{title}</Text>
      {right}
    </View>
  );
}

// ─── Badge ───
type Tone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) {
  const { t } = useTheme();
  const tones: Record<Tone, { c: string; bg: string }> = {
    success: { c: t.success, bg: t.successBg },
    warning: { c: t.warning, bg: t.warningBg },
    danger: { c: t.danger, bg: t.dangerBg },
    info: { c: t.link, bg: t.isDark ? 'rgba(10,102,194,0.18)' : 'rgba(10,102,194,0.10)' },
    accent: { c: t.accentInk, bg: t.accentSoft },
    neutral: { c: t.ink, bg: t.paperSoft },
  };
  const x = tones[tone];
  return (
    <View style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: x.bg, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontFamily: fonts.sansSemibold, color: x.c, letterSpacing: 0.2, textTransform: 'uppercase' }}>{children}</Text>
    </View>
  );
}

// ─── CategoryChip ───
export function CategoryChip({ icon, label, active, onPress }: { icon?: string; label: string; active?: boolean; onPress?: () => void }) {
  const { t } = useTheme();
  return (
    <Pressable onPress={onPress} style={{
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999,
      backgroundColor: active ? t.ink : t.paper,
      borderWidth: 1, borderColor: active ? t.ink : t.line,
    }}>
      {icon && <Icon name={icon} size={14} color={active ? t.paper : t.ink} />}
      <Text style={{ fontSize: 13, fontFamily: fonts.sansMedium, color: active ? t.paper : t.ink }}>{label}</Text>
    </Pressable>
  );
}

// ─── Avatar ───
export function Avatar({ name, size = 44, accent, image }: { name: string; size?: number; accent?: boolean; image?: string }) {
  const { t } = useTheme();
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
  if (image) {
    return (
      <Image
        source={{ uri: image }}
        style={{ width: size, height: size, borderRadius: 999, backgroundColor: t.paperSoft }}
      />
    );
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: 999,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: accent ? t.accent : t.ink,
    }}>
      <Text style={{ color: '#fff', fontFamily: fonts.sansBold, fontSize: Math.round(size * 0.36) }}>{initials}</Text>
    </View>
  );
}

// ─── Rating ───
export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  const { t } = useTheme();
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Icon key={i} name="star" size={size} color={i < filled ? t.rating : t.line} />
        ))}
      </View>
      <Text style={{ fontSize: 13, fontFamily: fonts.sansSemibold, color: t.ink }}>
        {value.toString().replace('.', ',')}
      </Text>
      {count != null && <Text style={{ fontSize: 13, fontFamily: fonts.sansRegular, color: t.fg3 }}>({count} avis)</Text>}
    </View>
  );
}

// ─── PortfolioTile ───
export function PortfolioTile({ tag, size }: { tag?: string; size?: number }) {
  const { t } = useTheme();
  const iconName = tag ? (ICON_FOR_TAG[tag] || 'image') : 'image';
  return (
    <View style={{
      aspectRatio: 1,
      width: size,
      height: size,
      borderRadius: 10,
      backgroundColor: t.accentSoft,
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name={iconName} size={24} color={t.accent} />
    </View>
  );
}

// ─── ProCard ───
export function ProCard({ pro, onPress, divider = true }: { pro: import('../../lib/mock-data').Pro; onPress?: () => void; divider?: boolean }) {
  const { t } = useTheme();
  const iconName = ICON_FOR_TAG[pro.tags[0]] || 'briefcase';
  const bg = pro.accent ? t.accent : t.ink;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: t.paper, paddingVertical: 14,
        flexDirection: 'row', gap: 12,
        borderBottomWidth: divider ? 1 : 0, borderBottomColor: t.lineSoft,
        opacity: pressed ? 0.7 : 1,
      })}>
      <View style={{
        width: 72, height: 72, borderRadius: 10, backgroundColor: bg,
        alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {pro.avatar ? (
          <Image source={{ uri: pro.avatar }} style={{ width: 72, height: 72 }} />
        ) : (
          <Icon name={iconName} size={28} color="rgba(255,255,255,0.5)" />
        )}
        {pro.verified && (
          <View style={{
            position: 'absolute', bottom: 6, left: 6,
            backgroundColor: t.paper, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
          }}>
            <Text style={{ color: t.success, fontSize: 10, fontFamily: fonts.sansSemibold }}>Vérifié</Text>
          </View>
        )}
      </View>
      <View style={{ flex: 1, justifyContent: 'space-between' }}>
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <Text numberOfLines={1} style={{ fontSize: 15, fontFamily: fonts.sansSemibold, color: t.ink, flexShrink: 1 }}>{pro.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Icon name="star" size={13} color={t.ink} />
              <Text style={{ fontSize: 13, fontFamily: fonts.sansSemibold, color: t.ink }}>{pro.rating.toString().replace('.', ',')}</Text>
              <Text style={{ fontSize: 13, fontFamily: fonts.sansRegular, color: t.fg3 }}>·{pro.reviews}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, fontFamily: fonts.sansRegular, color: t.fg2, marginTop: 2 }}>{pro.tags.join(' · ')}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.sansRegular, color: t.fg2 }}>{pro.neighborhood || pro.city} · {pro.distance} km</Text>
          <Text style={{ fontSize: 13, fontFamily: fonts.sansSemibold, color: t.ink }}>
            dès {pro.services[0].price.toLocaleString('fr-FR')} FCFA
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── TabBar (presentational, used by manual layouts) ───
export type TabDef = { id: string; icon: string; label: string; badge?: number };

export function TabBar({ tabs, active, onChange }: { tabs: TabDef[]; active: string; onChange: (id: string) => void }) {
  const { t } = useTheme();
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-around',
      paddingTop: 6, paddingBottom: 10,
      backgroundColor: t.paper, borderTopWidth: 1, borderTopColor: t.lineSoft,
    }}>
      {tabs.map((tab) => {
        const a = tab.id === active;
        return (
          <Pressable key={tab.id} onPress={() => onChange(tab.id)} style={{ flex: 1, alignItems: 'center', paddingVertical: 4, gap: 3 }}>
            <View>
              <Icon name={tab.icon} size={22} color={a ? t.ink : t.fg3} />
              {tab.badge ? (
                <View style={{
                  position: 'absolute', top: -4, right: -10,
                  backgroundColor: t.accent, paddingHorizontal: 4,
                  minWidth: 16, height: 16, borderRadius: 999,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontFamily: fonts.sansBold }}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={{ fontSize: 10, color: a ? t.ink : t.fg3, fontFamily: a ? fonts.sansSemibold : fonts.sansMedium }}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── ToggleSwitch ───
export function ToggleSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  const { t } = useTheme();
  return (
    <Pressable onPress={() => onChange(!on)} style={{
      width: 44, height: 26, borderRadius: 999,
      backgroundColor: on ? t.ink : t.line, padding: 2, justifyContent: 'center',
    }}>
      <View style={{
        width: 22, height: 22, borderRadius: 999, backgroundColor: '#fff',
        transform: [{ translateX: on ? 18 : 0 }],
      }} />
    </Pressable>
  );
}

// ─── Screen wrapper ───
export function Screen({ children, scroll = false, padded = false, style }: {
  children: ReactNode; scroll?: boolean; padded?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const { t } = useTheme();
  const base: ViewStyle = { flex: 1, backgroundColor: t.paper };
  const pad: ViewStyle = padded ? { paddingHorizontal: 20 } : {};
  if (scroll) {
    return (
      <ScrollView style={[base, style as ViewStyle]} contentContainerStyle={pad} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    );
  }
  return <View style={[base, pad, style as ViewStyle]}>{children}</View>;
}

export { Icon };
