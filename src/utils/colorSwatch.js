export const COLOR_SWATCHES = {
  beige: '#d8c3a5',
  black: '#111111',
  blue: '#2f5f8f',
  brown: '#6f4e37',
  burgundy: '#6b1f2b',
  camel: '#c19a6b',
  charcoal: '#36454f',
  cream: '#f5f0df',
  gold: '#c9a35a',
  gray: '#8c8982',
  grey: '#8c8982',
  green: '#2f6f4e',
  ivory: '#fffff0',
  khaki: '#bdb76b',
  lavender: '#b497bd',
  navy: '#17243c',
  olive: '#708238',
  orange: '#d96f32',
  pink: '#d98cae',
  purple: '#6f42c1',
  red: '#9f2f2f',
  silver: '#c0c0c0',
  tan: '#d2b48c',
  'light blue': '#9fbed6',
  turquoise: '#40b5ad',
  white: '#f4efe3',
  yellow: '#d9b44a',
};

export const getColorSwatch = (color) => (
  COLOR_SWATCHES[color?.toLowerCase()] || '#8c8982'
);
