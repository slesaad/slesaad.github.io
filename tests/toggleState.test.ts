import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseInitialState,
  buildSearchString,
  type ToggleState,
} from '../src/scripts/toggleState';

describe('parseInitialState', () => {
  it('defaults to work + designed + light', () => {
    const state = parseInitialState({
      search: '',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state).toEqual({ mode: 'work', reading: 'designed', theme: 'light' });
  });

  it('reads ?mode=offclock from URL', () => {
    const state = parseInitialState({
      search: '?mode=offclock',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('offclock');
  });

  it('reads ?reading=plain from URL', () => {
    const state = parseInitialState({
      search: '?reading=plain',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.reading).toBe('plain');
  });

  it('combines mode and reading params', () => {
    const state = parseInitialState({
      search: '?mode=offclock&reading=plain',
      savedTheme: null,
      prefersDark: false,
    });
    expect(state.mode).toBe('offclock');
    expect(state.reading).toBe('plain');
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
    const out = buildSearchString({ mode: 'work', reading: 'designed', theme: 'light' });
    expect(out).toBe('');
  });

  it('includes only non-default keys', () => {
    const out = buildSearchString({ mode: 'offclock', reading: 'designed', theme: 'light' });
    expect(out).toBe('?mode=offclock');
  });

  it('includes both mode and reading when both non-default', () => {
    const out = buildSearchString({ mode: 'offclock', reading: 'plain', theme: 'dark' });
    // theme is NOT in URL — only mode and reading
    expect(out).toContain('mode=offclock');
    expect(out).toContain('reading=plain');
    expect(out).not.toContain('theme');
  });
});
