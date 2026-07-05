import { browser } from '$app/environment';

// Visitor-facing light/dark preference. Persisted so a choice survives reloads
// and page changes; applied to <html data-theme> by the root layout. An inline
// script in app.html sets the attribute pre-hydration to avoid a flash.
const KEY = 'slh-theme';

export type Theme = 'light' | 'dark';

function initial(): Theme {
	if (!browser) return 'light';
	try {
		return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light';
	} catch {
		return 'light';
	}
}

export const theme = $state<{ value: Theme }>({ value: initial() });

export function toggleTheme() {
	theme.value = theme.value === 'dark' ? 'light' : 'dark';
	if (browser) {
		try {
			localStorage.setItem(KEY, theme.value);
		} catch {
			// storage unavailable (private mode) — the choice just won't persist
		}
	}
}
