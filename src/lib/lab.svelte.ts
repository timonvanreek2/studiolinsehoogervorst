import { browser } from '$app/environment';

// ─── Design Lab ───────────────────────────────────────────────────────────
// Throwaway scaffolding for trying client-feedback variants live. NOT part of
// the real site: the panel only surfaces behind a `?lab` URL flag (or Shift+L),
// and these flags default OFF so a normal visitor sees the shipped design.
// Remove this module (and its imports) before launch.

const KEY = 'slh-lab';

// ─── Desktop grid-spacing presets ──────────────────────────────────────────
// Discrete "versions" to compare in the lab, instead of free sliders — easier
// to judge a handful of considered options (and to show a client) than to fish
// for values on three tracks. Each is a distinct CHARACTER of whitespace, not
// just a uniform scale: the column / row / side-padding ratio is what gives a
// grid its feel. Values are px and only bite above 1024px — below that the grid
// falls back to fixed spacing, so this is purely the desktop design statement.
// Ordered generous → tight. Default is the current (most generous) treatment;
// the rest step the grid progressively denser, since the open question is how
// far in from "current" we can go before it reads as an Instagram grid rather
// than an editorial one. Row gap runs a touch over column gap throughout, to
// keep a vertical rhythm as things tighten.
export const SPACING_PRESETS = {
	default: { label: 'Default', hint: 'current', col: 160, row: 160, padding: 180 },
	roomy: { label: 'Roomy', hint: 'slightly tighter', col: 120, row: 128, padding: 152 },
	balanced: { label: 'Balanced', hint: 'medium density', col: 84, row: 96, padding: 120 },
	compact: { label: 'Compact', hint: 'dense, grid-forward', col: 48, row: 64, padding: 88 },
	snug: { label: 'Snug', hint: 'tightest, gallery wall', col: 20, row: 36, padding: 56 }
} as const;

export type SpacingPresetKey = keyof typeof SPACING_PRESETS;

export type LabFlags = {
	/** Master switch: is the lab present in this browser at all. */
	enabled: boolean;
	/** Panel minimised to its launcher pill (still active, just out of the way). */
	collapsed: boolean;
	/** Invert the whole site to a black background. */
	dark: boolean;
	/** Homepage hero: open the image inset with margin rather than full-bleed cover. */
	heroInset: boolean;
	/** Inset opening width as a % of the viewport (heroInset only). */
	heroInsetScale: number;
	/** Which desktop grid-spacing version is active (see SPACING_PRESETS). */
	gridPreset: SpacingPresetKey;
	/** Detail page: which orientation the framed spread opens on (the hero image). */
	framedOpen: 'landscape' | 'portrait';
};

const DEFAULTS: LabFlags = {
	enabled: false,
	collapsed: false,
	dark: false,
	heroInset: false,
	heroInsetScale: 78,
	gridPreset: 'default',
	framedOpen: 'landscape'
};

// Which keys reset returns to default — everything except the lab's own
// presence (enabled) and whether the panel is open (collapsed).
const VARIANT_KEYS = ['dark', 'heroInset', 'heroInsetScale', 'gridPreset', 'framedOpen'] as const;

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
