/**
 * Вложенные радиусы должны визуально совпадать:
 * inner = outer - inset
 */
export function innerRadiusPx(outerPx: number, insetPx: number): string {
  return `${Math.max(0, outerPx - insetPx)}px`;
}
