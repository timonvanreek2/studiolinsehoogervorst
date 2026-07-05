<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import Footer from '$lib/components/Footer.svelte';
	import LabPanel from '$lib/components/LabPanel.svelte';
	import { lab } from '$lib/lab.svelte';

	let { children, data } = $props();

	// Project detail pages render as a fixed full-viewport overlay (.fr) with their
	// own bar + Close, so shared chrome would only sit hidden behind them.
	let isDetail = $derived(page.url.pathname.startsWith('/projects/'));

	// ─── Design Lab wiring (dev/preview scaffolding — gated, removable) ───
	// A ?lab URL flag opens the panel (shareable preview link).
	$effect(() => {
		if (page.url.searchParams.has('lab')) {
			lab.enabled = true;
			lab.collapsed = false;
		}
	});

	// Root-level variant: the dark-theme toggle.
	$effect(() => {
		if (!browser) return;
		const root = document.documentElement;
		if (lab.dark) root.setAttribute('data-theme', 'dark');
		else root.removeAttribute('data-theme');
	});

	// Shift+L toggles the panel from anywhere.
	$effect(() => {
		if (!browser) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
				lab.enabled = !lab.enabled;
				// Turning the lab on always brings up the full panel, never the
				// stranded pill — collapse is only reachable via the × button.
				if (lab.enabled) lab.collapsed = false;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<div class="page-shell">
	{@render children()}
</div>

{#if !isDetail}
	<Footer studio={data.studio} />
{/if}

<LabPanel />

<style>
	.page-shell {
		position: relative;
	}
</style>
