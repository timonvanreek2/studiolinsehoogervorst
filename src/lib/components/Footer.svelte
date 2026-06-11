<script lang="ts">
	let {
		studio = null
	}: {
		studio?: { address?: string; contactEmail?: string; contactPhone?: string } | null;
	} = $props();

	const STRIP = /^(studio linse|the netherlands)$/i;

	let addressLines = $derived(
		studio?.address
			? studio.address.split('\n').filter((l) => l.trim() && !STRIP.test(l.trim()))
			: ['Keizersgracht 203', '1016 DS Amsterdam']
	);
	let email = $derived(studio?.contactEmail ?? 'info@studiolinse.com');
	let phone = $derived(studio?.contactPhone ?? '+31(0)20 624 3673');
</script>

<footer class="footer">
	<div class="footer-row">
		<div class="footer-content">
			<div class="col-text">
				{#each addressLines as line}
					<p>{line}</p>
				{/each}
			</div>

			<div class="col-text">
				<p><a href="mailto:{email}">{email}</a></p>
				<p>Tel: <a href="tel:{phone.replace(/[\s()]/g, '')}">{phone}</a></p>
			</div>
		</div>

		<p class="copyright">© 2025 Studio Linse All rights reserved</p>
	</div>
</footer>

<style>
	.footer {
		min-height: 35vh;
		padding: 8px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		font-family: var(--font-sans);
		font-weight: 450;
		font-size: 12px;
		line-height: 16px;
		color: #000;
		box-sizing: border-box;
	}

	.footer-row {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 16px;
	}

	/* Two text blocks, grouped at the bottom-left. */
	.footer-content {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 64px;
		align-items: flex-end;
	}

	.col-text {
		flex: 0 0 auto;
	}

	.col-text p {
		margin: 0;
	}

	.col-text a {
		color: inherit;
		text-decoration: none;
		transition: opacity 0.15s;
	}

	.col-text a:hover {
		opacity: 0.5;
	}

	.copyright {
		margin: 0;
		color: #999;
		white-space: nowrap;
	}

	@media (max-width: 768px) {
		.footer {
			min-height: auto;
			/* Single source of truth for the space above the footer — pages clear
			   their own bottom padding and let this generous gap apply everywhere. */
			padding: 120px 16px 24px;
		}

		.footer-row {
			flex-direction: column;
			align-items: flex-start;
			gap: 16px;
		}

		.footer-content {
			gap: 16px 32px;
		}
	}
</style>
