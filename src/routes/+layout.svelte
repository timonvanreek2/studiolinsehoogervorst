<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children } = $props();
	let isToolPage = $derived(page.url.pathname.startsWith('/tools/'));
	let isRichon = $derived(page.url.pathname.startsWith('/richon'));
	let isStudio = $derived(page.url.pathname.startsWith('/studio'));
	let isV2 = $derived(page.url.pathname.startsWith('/v2'));
</script>

{#if !isToolPage && !isRichon && !isStudio && !isV2}
	<nav class="site-nav">
		<a href="/" class="nav-name">Studio&nbsp;&nbsp;Linse Hoogervorst</a>
		<div class="nav-links">
			<a href="/index" class="nav-link">Index</a>
			<a href="/about" class="nav-link">About</a>
		</div>
	</nav>
{/if}

{@render children()}

<style>
	.site-nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 12px 16px;
		z-index: 100;
		color: var(--color-primary);
	}

	.nav-name {
		font-family: var(--font-serif);
		font-size: 14px;
		line-height: 17px;
		text-transform: uppercase;
		white-space: pre;
	}

	.nav-links {
		display: flex;
		gap: 16px;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 14px;
		line-height: 17px;
	}

	@media (max-width: 768px) {
		.site-nav {
			padding: 12px 16px;
		}
	}
</style>
