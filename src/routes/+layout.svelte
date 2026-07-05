<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import Footer from '$lib/components/Footer.svelte';
	import { theme } from '$lib/theme.svelte';

	let { children, data } = $props();

	// Project detail pages render as a fixed full-viewport overlay (.fr) with their
	// own bar + Close, so shared chrome would only sit hidden behind them.
	let isDetail = $derived(page.url.pathname.startsWith('/projects/'));

	// Apply the visitor's light/dark choice to the document root.
	$effect(() => {
		if (!browser) return;
		const root = document.documentElement;
		if (theme.value === 'dark') root.setAttribute('data-theme', 'dark');
		else root.removeAttribute('data-theme');
	});
</script>

<div class="page-shell">
	{@render children()}
</div>

{#if !isDetail}
	<Footer studio={data.studio} />
{/if}

<style>
	.page-shell {
		position: relative;
	}
</style>
