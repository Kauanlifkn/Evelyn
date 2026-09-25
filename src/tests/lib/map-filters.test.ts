import { describe, it, expect } from 'vitest';
import { toggleMapFilter, isMapFilterAll } from '@/lib/map-filters';

describe('map-filters contract', () => {
  it('initial state (empty array) means all visible', () => {
    expect(isMapFilterAll([])).toBe(true);
  });

  it("'all' resets to empty (all visible) from any state", () => {
    expect(toggleMapFilter([], 'all')).toEqual([]);
    expect(toggleMapFilter(['flood', 'shelter'], 'all')).toEqual([]);
  });

  it('activating a layer starts from the all state', () => {
    expect(toggleMapFilter([], 'flood')).toEqual(['flood']);
  });

  it('combines multiple filters', () => {
    let state = toggleMapFilter([], 'flood');
    state = toggleMapFilter(state, 'shelter');
    expect(state).toEqual(['flood', 'shelter']);
    expect(isMapFilterAll(state)).toBe(false);
  });

  it('toggling an active filter removes it', () => {
    const state = toggleMapFilter(['flood', 'shelter'], 'flood');
    expect(state).toEqual(['shelter']);
  });

  it('removing the last active filter returns to all visible', () => {
    const state = toggleMapFilter(['flood'], 'flood');
    expect(state).toEqual([]);
    expect(isMapFilterAll(state)).toBe(true);
  });

  it('never contains the legacy "all" sentinel as a layer', () => {
    let state: string[] = [];
    state = toggleMapFilter(state, 'all');
    state = toggleMapFilter(state, 'river_flood');
    state = toggleMapFilter(state, 'all');
    expect(state).not.toContain('all');
  });
});
