export interface FitResult {
  width: number;
  height: number;
  scale: number;
}

/**
 * Maior tamanho que cabe no espaço disponível mantendo a proporção.
 * Quando cabe pelo menos 1×, usa escala inteira (pixel art nítida);
 * abaixo disso, reduz proporcionalmente.
 */
export function computeIntegerFit(
  availableWidth: number,
  availableHeight: number,
  baseWidth: number,
  baseHeight: number,
): FitResult {
  if (availableWidth <= 0 || availableHeight <= 0) return { width: 0, height: 0, scale: 0 };
  const raw = Math.min(availableWidth / baseWidth, availableHeight / baseHeight);
  const scale = raw >= 1 ? Math.floor(raw) : raw;
  return { width: Math.floor(baseWidth * scale), height: Math.floor(baseHeight * scale), scale };
}
