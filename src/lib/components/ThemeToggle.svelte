<script lang="ts">
	import { theme, toggleTheme } from '$lib/theme.svelte';
</script>

<button
	class="theme-toggle"
	onclick={toggleTheme}
	aria-label="Switch between light and dark theme"
	aria-pressed={theme.value === 'dark'}
>
	<span class="opt" class:active={theme.value === 'light'}>Light</span>
	<span class="slash">/</span>
	<span class="opt" class:active={theme.value === 'dark'}>Dark</span>
</button>

<style>
	/* Mirrors the site nav's language: the active choice is italic, the rest
	   muted — a type-only switch rather than an icon, to sit quietly in the
	   footer. Colours are tokens so the control themes with everything else. */
	.theme-toggle {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		font-family: var(--font-sans);
		font-weight: 450;
		font-size: 12px;
		line-height: 16px;
		letter-spacing: 0.01em;
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
		color: var(--color-primary);
	}

	.opt {
		color: var(--color-muted);
		transition: color 0.2s ease;
	}

	.opt.active {
		color: var(--color-primary);
		font-style: italic;
	}

	.slash {
		color: var(--color-structural);
	}
</style>
