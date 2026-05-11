<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	let { children } = $props();
</script>

<div class="v2-root">
	<Nav isV2={true} baseHref="/v2" />
	{@render children()}

	<footer class="site-footer">
		<span>Studio Linse Hoogervorst</span>
		<div class="footer-right">
			<a href="/v2">Selected</a>
			<a href="/v2/about">About</a>
		</div>
	</footer>
</div>

<style>
	:global(.v2-root) {
		--font-sans: "HAL Timezone", system-ui, sans-serif;
		--font-mono: "HAL Timezone Mono", ui-monospace, monospace;
		--font-meta: "ABC Diatype", system-ui, sans-serif;
		--color-bg: #f7f3f2;
		--color-primary: #000;
		--color-muted: #999;

		background: var(--color-bg);
		color: var(--color-primary);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 400;
		line-height: 1.5;
		min-height: 100vh;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	.site-footer {
		font-family: var(--font-meta);
		color: var(--color-primary);
		display: flex;
		justify-content: space-between;
		padding: 40px 8px;
		font-size: 14px;
		font-weight: 500;
		line-height: 1.5;
	}

	.footer-right {
		display: flex;
		gap: 24px;
	}

	.site-footer a {
		color: inherit;
		text-decoration: none;
	}

	.site-footer a:hover {
		opacity: 0.6;
	}

	@media (max-width: 768px) {
		.site-footer {
			flex-direction: column;
			gap: 8px;
		}

		.footer-right {
			flex-direction: column;
			gap: 4px;
		}
	}
</style>
