// Ported from the Classical design system (project/_ds/classical-.../styles.css).
// Flattened for React Native: no color-mix(), so translucent text/dividers are
// pre-mixed against --color-bg (#f3f2f2) at the same percentages as the CSS.

export const color = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  text: '#201f1d',
  accent: '#b68235',
  divider: '#d6d3d2', // color-mix(text 16%, transparent) over bg

  neutral100: '#f8f4f4',
  neutral200: '#eae7e7',
  neutral300: '#d7d3d3',
  neutral400: '#bab6b6',
  neutral500: '#9b9797',
  neutral600: '#7d7979',
  neutral700: '#605d5d',
  neutral800: '#444141',
  neutral900: '#2d2b2b',

  accent100: '#fff3e4',
  accent200: '#ffe3bf',
  accent300: '#facb8d',
  accent400: '#e1ad66',
  accent500: '#c28d41',
  accent600: '#a06f24',
  accent700: '#7d5411',
  accent800: '#5a3b0a',
  accent900: '#3a270d',

  // text at reduced opacity, pre-mixed over --color-bg (#f3f2f2)
  textMuted50: '#8b8a89',
  textMuted55: '#84837f',
  textMuted58: '#807e7c',
  textMuted60: '#7d7c78',
  textMuted62: '#7a7975',
  textMuted65: '#77756d',
  textMuted70: '#716f66',
  textMuted72: '#6f6d64',
  textMuted75: '#6b695f',
};

export const font = {
  heading: 'CormorantGaramond_600SemiBold',
  body: 'Lora_400Regular',
};

export const space = {
  1: 4.6,
  2: 9.2,
  3: 13.8,
  4: 18.4,
  6: 27.6,
  8: 36.8,
};

export const radius = {
  sm: 2,
  md: 4,
  lg: 7,
};

export const shadow = {
  sm: {
    shadowColor: color.neutral900,
    shadowOpacity: 0.14,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  md: {
    shadowColor: color.neutral900,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  lg: {
    shadowColor: color.neutral900,
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
} as const;
