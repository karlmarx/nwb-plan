/** Standards-based alpha overlay for CSS custom properties. */
export function cssAlpha(cssVar: string, percent: number): string {
  return `color-mix(in srgb, ${cssVar} ${percent}%, transparent)`;
}
