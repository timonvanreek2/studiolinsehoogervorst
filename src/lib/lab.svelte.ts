import { browser } from '$app/environment';

// ─── Design Lab ───────────────────────────────────────────────────────────
// Throwaway scaffolding for trying client-feedback variants live. NOT part of
// the real site: the panel only surfaces behind a `?lab` URL flag (or Shift+L),
// and these flags default OFF so a normal visitor sees the shipped design.
// Remove this module (and its imports) before launch.

const KEY = 'slh-lab';

export type LabFlags = {
	/** Master switch: is the lab present in this browser at all. */
	enabled: boolean;
	/** Panel minimised to its launcher pill (still active, just out of the way). */
	collapsed: boolean;
	/** Homepage hero: open the image inset with margin rather than full-bleed cover. */
	heroInset: boolean;
	/** Inset opening width as a % of the viewport (heroInset only). */
	heroInsetScale: number;
	/** Detail page: which orientation the framed spread opens on (the hero image). */
	framedOpen: 'landscape' | 'portrait';
	/** Detail page (mobile only): swap the vertical rhythm for a swipeable image carousel. */
	mobileCarousel: boolean;
};

const DEFAULTS: LabFlags = {
	enabled: false,
	collapsed: false,
	heroInset: true,
	heroInsetScale: 64,
	framedOpen: 'landscape',
	mobileCarousel: false
};

// Which keys reset returns to default — everything except the lab's own
// presence (enabled) and whether the panel is open (collapsed).
const VARIANT_KEYS = [
	'heroInset',
	'heroInsetScale',
	'framedOpen',
	'mobileCarousel'
] as const;

function initial(): LabFlags {
	if (!browser) return { ...DEFAULTS };
	try {
		return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
	} catch {
		return { ...DEFAULTS };
	}
}

export const lab = $state<LabFlags>(initial());

/** Persist the current flags. Call after any change. */
export function saveLab() {
	if (browser) localStorage.setItem(KEY, JSON.stringify(lab));
}

/** Restore every variant to its default, leaving the panel open. */
export function resetLab() {
	for (const k of VARIANT_KEYS) {
		// indexed assignment from a same-typed source — safe to widen for the loop
		(lab as Record<string, unknown>)[k] = DEFAULTS[k];
	}
}
