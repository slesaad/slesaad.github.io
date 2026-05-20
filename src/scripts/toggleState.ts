export type Mode = 'work' | 'offclock';
export type Theme = 'light' | 'dark';

export interface ToggleState {
  mode: Mode;
  theme: Theme;
}

interface InitialInputs {
  search: string;          // window.location.search
  savedTheme: string | null; // localStorage.getItem('theme')
  prefersDark: boolean;    // matchMedia result
}

const VALID_MODES: Mode[] = ['work', 'offclock'];
const VALID_THEMES: Theme[] = ['light', 'dark'];

function isValid<T extends string>(allowed: readonly T[], value: string | null): value is T {
  return value != null && (allowed as readonly string[]).includes(value);
}

export function parseInitialState(inputs: InitialInputs): ToggleState {
  const params = new URLSearchParams(inputs.search);
  const rawMode = params.get('mode');

  const mode: Mode = isValid(VALID_MODES, rawMode) ? rawMode : 'work';

  let theme: Theme;
  if (isValid(VALID_THEMES, inputs.savedTheme)) {
    theme = inputs.savedTheme;
  } else {
    theme = inputs.prefersDark ? 'dark' : 'light';
  }

  return { mode, theme };
}

export function buildSearchString(state: ToggleState): string {
  const params = new URLSearchParams();
  if (state.mode !== 'work') params.set('mode', state.mode);
  const s = params.toString();
  return s ? `?${s}` : '';
}

/**
 * Apply state to <html> by setting data-* attributes.
 * Only writes — caller is responsible for reading current state.
 */
export function applyState(html: HTMLElement, state: ToggleState): void {
  html.setAttribute('data-mode', state.mode);
  html.setAttribute('data-theme', state.theme);
}
