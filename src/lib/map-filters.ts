/**
 * Map filter state contract (RECOVERY-1):
 *
 * - `[]` (empty array) means "all layers visible".
 * - Any other value is the id of an active layer
 *   (an event type or "shelter").
 * - The 'all' button resets to [].
 *
 * RiskMap treats `filters.length === 0` as "show everything", so the
 * initial state ([] → all) makes markers visible on first load.
 */

export function toggleMapFilter(prev: string[], filter: string): string[] {
  if (filter === 'all') return [];
  return prev.includes(filter)
    ? prev.filter((f) => f !== filter)
    : [...prev, filter];
}

export function isMapFilterAll(prev: string[]): boolean {
  return prev.length === 0;
}
