<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>About — Studio Linse Hoogervorst</title>
</svelte:head>

<main class="about-page">
	<div class="about-grid">
		<!-- Left column: manifesto + biography -->
		<div class="about-text">
			<section class="manifesto">
				<p class="manifesto-lead">Studio Linse Hoogervorst is a practice for interior architecture, founded by Paul Linse in Amsterdam, 1993.</p>
				{#if data.studio?.aboutText}
					{#each data.studio.aboutText.split('\n\n') as paragraph}
						<p>{paragraph}</p>
					{/each}
				{/if}
			</section>
		</div>

		<!-- Right column: image -->
		{#if data.studio?.image}
			<div class="about-image">
				<img
					src="{data.studio.image}?w=800&auto=format&q=85"
					alt="Studio Linse Hoogervorst"
				/>
			</div>
		{/if}
	</div>

	<!-- Enquiry -->
	<section class="section">
		<h2 class="section-label">Enquiry</h2>
		<div class="contact-grid">
			{#if data.studio?.contactEmail}
				<div class="contact-row">
					<span class="contact-label">General</span>
					<a href="mailto:{data.studio.contactEmail}">{data.studio.contactEmail}</a>
				</div>
			{/if}
			{#if data.studio?.newBusinessEmail}
				<div class="contact-row">
					<span class="contact-label">New business</span>
					<a href="mailto:{data.studio.newBusinessEmail}">{data.studio.newBusinessEmail}</a>
				</div>
			{/if}
			{#if data.studio?.contactPhone}
				<div class="contact-row">
					<span class="contact-label">Phone</span>
					<a href="tel:{data.studio.contactPhone}">{data.studio.contactPhone}</a>
				</div>
			{/if}
			{#if data.studio?.address}
				<div class="contact-row">
					<span class="contact-label">Visit</span>
					<span>{@html data.studio.address.replace(/\n/g, '<br />')}</span>
				</div>
			{/if}
		</div>
	</section>

	<!-- Awards -->
	{#if data.awards?.length}
		<section class="section">
			<h2 class="section-label">Awards</h2>
			<div class="list">
				{#each data.awards as item}
					<div class="list-row">
						<span class="list-year">{item.year}</span>
						<span>{item.title}</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Press -->
	{#if data.press?.length}
		<section class="section">
			<h2 class="section-label">Press</h2>
			<div class="list">
				{#each data.press as item}
					<div class="list-row">
						<span class="list-year">{item.year}</span>
						<span>{item.title}</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}
</main>

<style>
	.about-page {
		padding: 120px 32px 160px;
		max-width: 1000px;
		margin: 0 auto;
	}

	.about-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 64px;
		margin-bottom: 120px;
	}

	.manifesto {
		font-family: var(--font-serif);
		font-size: 17px;
		line-height: 1.6;
	}

	.manifesto-lead {
		font-size: 22px;
		line-height: 1.4;
		margin-bottom: 32px;
	}

	.manifesto p {
		margin: 0;
	}

	.manifesto p + p {
		margin-top: 1em;
	}

	.about-image img {
		width: 100%;
		height: auto;
	}

	.section {
		margin-bottom: 80px;
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.section-label {
		font-family: var(--font-mono);
		font-size: 10px;
		text-transform: uppercase;
		letter-spacing: 2px;
		color: var(--color-muted);
		margin-bottom: 24px;
	}

	.contact-grid {
		display: flex;
		flex-direction: column;
	}

	.contact-row {
		display: flex;
		gap: 16px;
		padding: 8px 0;
		font-family: var(--font-serif);
		font-size: 15px;
		border-top: 1px solid var(--color-structural);
	}

	.contact-row:last-child {
		border-bottom: 1px solid var(--color-structural);
	}

	.contact-label {
		width: 120px;
		flex-shrink: 0;
		color: var(--color-muted);
	}

	.contact-row a {
		transition: opacity 0.15s;
	}

	.contact-row a:hover {
		opacity: 0.6;
	}

	.list {
		display: flex;
		flex-direction: column;
	}

	.list-row {
		display: flex;
		gap: 16px;
		padding: 8px 0;
		font-family: var(--font-serif);
		font-size: 15px;
		border-top: 1px solid var(--color-structural);
	}

	.list-row:last-child {
		border-bottom: 1px solid var(--color-structural);
	}

	.list-year {
		width: 60px;
		flex-shrink: 0;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-muted);
		padding-top: 3px;
	}

	@media (max-width: 768px) {
		.about-page {
			padding: 100px 16px 100px;
		}

		.about-grid {
			grid-template-columns: 1fr;
			gap: 40px;
			margin-bottom: 80px;
		}

		.manifesto {
			font-size: 16px;
		}

		.manifesto-lead {
			font-size: 19px;
		}

		.section {
			margin-bottom: 60px;
		}

		.contact-row,
		.list-row {
			font-size: 14px;
		}
	}
</style>
