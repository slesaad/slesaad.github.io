import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseInitialState,
  buildSearchString,
  type ToggleState,
} from '../src/scripts/toggleState';

describe('parseInitialState', () => {
  it('defaults to work + light', () => {
    const state = parseInitialState({
      search: '',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state).toEqual({ mode: 'work', theme: 'light' });
  });

  it('reads ?mode=offclock from URL', () => {
    const state = parseInitialState({
      search: '?mode=offclock',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('offclock');
  });

  it('ignores invalid mode values', () => {
    const state = parseInitialState({
      search: '?mode=garbage',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('work');
  });

  it('respects prefers-color-scheme when no saved theme', () => {
    const state = parseInitialState({ search: '', savedTheme: null, prefersDark: true });
    expect(state.theme).toBe('dark');
  });

  it('saved theme takes precedence over prefers-color-scheme', () => {
    const state = parseInitialState({ search: '', savedTheme: 'light', prefersDark: true });
    expect(state.theme).toBe('light');
  });

  it('rejects invalid saved theme values', () => {
    const state = parseInitialState({ search: '', savedTheme: 'neon', prefersDark: false });
    expect(state.theme).toBe('light');
  });
});

describe('buildSearchString', () => {
  it('returns empty string when state matches defaults', () => {
    const out = buildSearchString({ mode: 'work', theme: 'light' });
    expect(out).toBe('');
  });

  it('includes mode when non-default', () => {
    const out = buildSearchString({ mode: 'offclock', theme: 'light' });
    expect(out).toBe('?mode=offclock');
  });

  it('omits theme from URL even when dark', () => {
    const out = buildSearchString({ mode: 'offclock', theme: 'dark' });
    expect(out).toContain('mode=offclock');
    expect(out).not.toContain('theme');
  });
});
