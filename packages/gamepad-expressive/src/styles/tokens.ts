/**
 * Material Design 3 Expressive Tokens for Gamepad Expressive
 */

export const GP_THEME = {
  // MD3 Semantic Colors (with adaptive fallbacks)
  primary: 'var(--md-sys-color-primary, #c8f000)',
  onPrimary: 'var(--md-sys-color-on-primary, #273000)',
  primaryContainer: 'var(--md-sys-color-primary-container, #e7f6a8)',
  onPrimaryContainer: 'var(--md-sys-color-on-primary-container, #262b1c)',

  secondary: 'var(--md-sys-color-secondary, #62652f)',
  secondaryContainer: 'var(--md-sys-color-secondary-container, #e6e3cd)',
  onSecondaryContainer: 'var(--md-sys-color-on-secondary-container, #343831)',

  surface: 'var(--md-sys-color-surface, #f2f0e8)',
  surfaceContainerLowest: 'var(--md-sys-color-surface-container-lowest, #fbfaf4)',
  surfaceContainerLow: 'var(--md-sys-color-surface-container-low, #eae8de)',
  surfaceContainer: 'var(--md-sys-color-surface-container, #e4e2d6)',
  surfaceContainerHigh: 'var(--md-sys-color-surface-container-high, #dedccf)',
  surfaceContainerHighest: 'var(--md-sys-color-surface-container-highest, #d4d3c5)',

  onSurface: 'var(--md-sys-color-on-surface, #343831)',
  onSurfaceVariant: 'var(--md-sys-color-on-surface-variant, #5c6054)',
  outline: 'var(--md-sys-color-outline, #777c6d)',
  outlineVariant: 'var(--md-sys-color-outline-variant, #c5c8b9)',

  error: 'var(--md-sys-color-error, #a72d3b)',

  // Platform Brand Accents
  xboxGreen: '#56c271',
  xboxRed: '#f45342',
  xboxBlue: '#388bfd',
  xboxYellow: '#f5a623',

  psCross: '#58a6ff',
  psCircle: '#f85149',
  psSquare: '#f06292',
  psTriangle: '#3fb950',
  psLightbar: '#2e86de',

  nintendoRed: '#e60012',
  nintendoCyan: '#00c3e3',

  // Springs & Motion
  springDefault: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  springFast: 'cubic-bezier(0.2, 0, 0, 1)',
  springTactile: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
} as const
