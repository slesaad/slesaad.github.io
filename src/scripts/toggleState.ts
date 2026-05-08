export type Mode = 'work' | 'offclock';
export type Reading = 'designed' | 'plain';
export type Theme = 'light' | 'dark';

export interface ToggleState {
  mode: Mode;
  reading: Reading;
  theme: Theme;
}

interface InitialInputs {
  search: string;          // window.location.search
  savedTheme: string | null; // localStorage.getItem('theme')
  prefersDark: boolean;    // matchMedia result
}

const VALID_MODES: Mode[] = ['work', 'offclock'];
const VALID_READING: Reading[] = ['designed', 'plain'];
const VALID_THEMES: Theme[] = ['light', 'dark'];

function isValid<T extends string>(allowed: readonly T[], value: string | null): value is T {
  return value != null && (allowed as readonly string[]).includes(value);
}

export function parseInitialState(inputs: InitialInputs): ToggleState {
  const params = new URLSearchParams(inputs.search);
  const rawMode = params.get('mode');
  const rawReading = params.get('reading');

  const mode: Mode = isValid(VALID_MODES, rawMode) ? rawMode : 'work';
  const reading: Reading = isValid(VALID_READING, rawReading) ? rawReading : 'designed';

  let theme: Theme;
  if (isValid(VALID_THEMES, inputs.savedTheme)) {
    theme = inputs.savedTheme;
  } else {
    theme = inputs.prefersDark ? 'dark' : 'light';
  }

  return { mode, reading, theme };
}

export function buildSearchString(state: ToggleState): string {
  const params = new URLSearchParams();
  if (state.mode !== 'work') params.set('mode', state.mode);
  if (state.reading !== 'designed') params.set('reading', state.reading);
  const s = params.toString();
  return s ? `?${s}` : '';
}

/**
 * Apply state to <html> by setting data-* attributes.
 * Only writes — caller is responsible for reading current state.
 */
export function applyState(html: HTMLElement, state: ToggleState): void {
  html.setAttribute('data-mode', state.mode);
  html.setAttribute('data-reading', state.reading);
  html.setAttribute('data-theme', state.theme);
}
