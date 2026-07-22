// Pure geometry for the scroll-driven Road-to-F1 rail. Kept DOM-free so the
// node-activation logic unit-tests without a browser.

/** Fractional positions (0..1) of `count` nodes spread evenly along the rail. */
export function nodePositions(count: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  return Array.from({ length: count }, (_, i) => i / (count - 1));
}

/** A node at fraction `at` is reached once scroll progress passes it. */
export function isReached(at: number, progress: number): boolean {
  return progress >= at;
}

/** How many of `positions` are reached at the given progress. */
export function reachedCount(positions: number[], progress: number): number {
  return positions.filter((at) => isReached(at, progress)).length;
}
