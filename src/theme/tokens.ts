import { TextStyle } from 'react-native';

// Minimal theme: warm paper ground, ink for text and primary actions, brass
// kept for small highlights (progress, best month). Text colours are chosen
// for at least 4.5:1 against `bg` and `surface`.

export const color = {
  bg: '#FAF9F7',
  surface: '#F1EFEB',
  card: '#FFFFFF',
  divider: '#E6E3DE',
  track: '#E2DED8',

  text: '#1C1B19',
  textSecondary: '#5F5C56',
  placeholder: '#8A867F', // placeholders and disabled only — too light for body copy

  ink: '#1C1B19',
  onInk: '#FFFFFF',

  accent: '#A8742A',
  accentSoft: 'rgba(168, 116, 42, 0.4)',
  accentText: '#7A5118',
  accentTint: '#F3EADB',

  danger: '#A23B2C',
  backdrop: 'rgba(28, 27, 25, 0.45)',

  // Dark screens (plaque, camera)
  night: '#171614',
  nightSurface: '#2A2825',
  nightText: '#F4F2EE',
  nightTextSecondary: '#ABA69E',
  nightBody: '#DEDAD3',
  nightAccent: '#D9B172',
  nightRing: '#8C6A3A',
};

// Custom fonts don't pick weights from fontWeight/fontStyle on Android, so
// every weight and the italic are separate families.
export const font = {
  serif: 'SourceSerif4_400Regular',
  serifSemiBold: 'SourceSerif4_600SemiBold',
  serifItalic: 'SourceSerif4_400Regular_Italic',
  sans: 'Figtree_400Regular',
  sansMedium: 'Figtree_500Medium',
  sansSemiBold: 'Figtree_600SemiBold',
};

export const type = {
  display: { fontFamily: font.serifSemiBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.4, color: color.text },
  title: { fontFamily: font.serifSemiBold, fontSize: 22, lineHeight: 28, color: color.text },
  bookTitle: { fontFamily: font.serifSemiBold, fontSize: 16, lineHeight: 21, color: color.text },
  inscription: { fontFamily: font.serifItalic, fontSize: 18, lineHeight: 29, color: color.text },
  body: { fontFamily: font.sans, fontSize: 16, lineHeight: 24, color: color.text },
  secondary: { fontFamily: font.sans, fontSize: 14, lineHeight: 20, color: color.textSecondary },
  section: { fontFamily: font.sansSemiBold, fontSize: 16, lineHeight: 22, color: color.text },
  label: { fontFamily: font.sansMedium, fontSize: 13, lineHeight: 18, color: color.textSecondary },
  caption: { fontFamily: font.sans, fontSize: 13, lineHeight: 18, color: color.textSecondary },
  button: { fontFamily: font.sansSemiBold, fontSize: 16, lineHeight: 22 },
  headerTitle: { fontFamily: font.sansSemiBold, fontSize: 17, lineHeight: 24, color: color.text },
} satisfies Record<string, TextStyle>;

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
};

// Horizontal page margin shared by every screen.
export const gutter = 24;

export const radius = {
  sm: 4,
  md: 10,
  lg: 12,
  xl: 20,
  pill: 9999,
};

export const shadow = {
  sm: {
    shadowColor: color.ink,
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: color.ink,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: color.ink,
    shadowOpacity: 0.16,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;
