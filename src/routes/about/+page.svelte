<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();

	let path = $derived(page.url.pathname);
	let isAbout = $derived(path.startsWith('/about'));

	let image = $derived(data.studio?.image ?? null);

	// The source studio image is 1920px wide; offer up to that for the
	// 50vw full-height panel on large screens (50vw of a 1440 display ≈ 720px,
	// 2× for retina ≈ 1440), and a full-width crop below the split breakpoint.
	function imageSrcset(url: string): string {
		return [800, 1200, 1600, 1920].map((w) => `${url}?w=${w}&auto=format&q=85 ${w}w`).join(', ');
	}
</script>

<svelte:head>
	<title>About — Studio Linse Hoogervorst</title>
	<meta property="og:title" content="About — Studio Linse Hoogervorst" />
	<meta property="og:description" content="A practice for interior architecture, founded by Paul Linse in Amsterdam." />
</svelte:head>

<h1 class="sr-only">About — Studio Linse Hoogervorst</h1>

<a href="/" class="wordmark"><img src="/wordmark.svg" alt="Studio Linse Hoogervorst" class="wordmark-img" /></a>

<nav class="nav-right">
	<a href="/" class="nav-link">Selected</a><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link">Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link" class:selected={isAbout}>About</a>
</nav>

<main class="about">
	{#if image}
		<div class="portrait">
			<img
				class="portrait-img"
				src="{image}?w=1600&auto=format&q=85"
				srcset={imageSrcset(image)}
				sizes="(min-width: 1152px) 50vw, 100vw"
				alt="Studio Linse Hoogervorst"
				fetchpriority="high"
			/>
		</div>
	{/if}

	<div class="column">
		<div class="bio">
			<!-- Founding year intentionally omitted: this lead said 1993 while the Sanity aboutText says 1999 — resolve the discrepancy in Sanity, then reconsider stating it here. -->
			<p class="lead">Studio Linse Hoogervorst is a practice for interior architecture, founded by Paul Linse in Amsterdam.</p>
			{#if data.studio?.aboutText}
				{#each data.studio.aboutText.split('\n\n') as paragraph}
					<p>{paragraph}</p>
				{/each}
			{/if}
		</div>

		<div class="contact">
			{#if data.studio?.contactEmail}
				<a href="mailto:{data.studio.contactEmail}">{data.studio.contactEmail}</a>
			{/if}
			{#if data.studio?.contactPhone}
				<a href="tel:{data.studio.contactPhone}">{data.studio.contactPhone}</a>
			{/if}
			{#if data.studio?.instagram}
				<a href="https://instagram.com/{data.studio.instagram}" target="_blank" rel="noopener">@{data.studio.instagram}</a>
			{/if}
			{#if data.studio?.address}
				<span class="address">{@html data.studio.address.replace(/\n/g, '<br />')}</span>
			{/if}
		</div>

		{#if data.awards?.length}
			<section class="section">
				<h2 class="section-title">Awards</h2>
				<div class="detail-list">
					{#each data.awards as item}
						<div class="detail-row">
							<span class="detail-year">{item.year}</span>
							<div class="detail-body">
								<span class="detail-source">{item.title.split('—')[0]?.trim() ?? item.title}</span>
								{#if item.title.includes('—')}
									<span class="detail-project">{item.title.split('—').slice(1).join('—').trim()}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}

		{#if data.press?.length}
			<section class="section">
				<h2 class="section-title">Press</h2>
				<div class="detail-list">
					{#each data.press as item}
						<div class="detail-row">
							<span class="detail-year">{item.year}</span>
							<div class="detail-body">
								<span class="detail-source">{item.title.split('—')[0]?.trim() ?? item.title}</span>
								{#if item.title.includes('—')}
									<span class="detail-project">{item.title.split('—').slice(1).join('—').trim()}</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</main>

<style>
	/* ─────────────────────────────────────────────────────────────
	   About — the portrait split.

	   On wide screens the studio image is fixed to the left half and runs
	   the full height of the viewport, so the site-wide datum (the fixed
	   wordmark + nav at 50vh) crosses it. The wide wordmark hangs over the
	   image and inverts through mix-blend exclusion — the same gesture as
	   the home hero, which is what makes About belong to the rest of the
	   site instead of floating off as a centred column. The text reads in
	   the right half; only the narrow nav threads over it.

	   Below 1152px there isn't room for the wordmark, a text measure, and
	   the image side by side, so the layout stacks: image on top, text
	   below, chrome anchored to the top corners.
	   ───────────────────────────────────────────────────────────── */

	/* Datum chrome — shared with the rest of the site. */
	.wordmark {
		position: fixed;
		top: 24px;
		left: 16px;
		z-index: 200;
		display: flex;
		align-items: center;
		/* Legible fallback for browsers without mix-blend-mode support */
		color: #000;
		transition: opacity 0.15s ease-out;
	}

	@supports (mix-blend-mode: exclusion) {
		.wordmark {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.wordmark:hover {
		opacity: 0.5;
	}

	.wordmark-img {
		height: 16px;
		width: auto;
		display: block;
	}

	/* Below the split breakpoint the 291px-wide wordmark + nav can't share a
	   line on a phone, so the nav stacks directly under the wordmark as a
	   logo-and-nav lockup over the top of the image. */
	.nav-right {
		position: fixed;
		top: 50px;
		left: 16px;
		right: auto;
		z-index: 200;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		/* Legible fallback for browsers without mix-blend-mode support */
		color: #000;
	}

	@supports (mix-blend-mode: exclusion) {
		.nav-right {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.nav-link {
		color: inherit;
		transition: opacity 0.15s ease-out;
	}

	.nav-link:hover {
		opacity: 0.5;
	}

	.nav-link.selected {
		font-style: italic;
	}

	.sep {
		font-style: normal;
	}

	/* Stacked (mobile / tablet) layout — image first, text below. */
	.portrait-img {
		width: 100%;
		height: 56vh;
		object-fit: cover;
		object-position: center;
		display: block;
	}

	.about {
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-primary);
	}

	.column {
		max-width: 32rem;
		margin: 0 auto;
		padding: 48px 16px 100px;
	}

	/* Paragraph breaks marked by space, not indent (never both). */
	.bio p {
		margin: 0;
	}

	.bio p + p {
		margin-top: 1em;
	}

	.bio {
		margin-bottom: 40px;
	}

	.contact {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.contact a,
	.contact span {
		color: var(--color-primary);
		text-decoration: none;
		transition: opacity 0.15s ease-out;
	}

	.contact a:hover {
		opacity: 0.5;
	}

	.section {
		margin-top: 80px;
	}

	.section-title {
		font-size: 13px;
		font-weight: 500;
		margin: 0 0 16px;
	}

	.detail-list {
		display: flex;
		flex-direction: column;
	}

	.detail-row {
		display: flex;
		gap: 24px;
		padding: 8px 0;
	}

	.detail-year {
		width: 48px;
		flex-shrink: 0;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
	}

	.detail-body {
		display: flex;
		flex-direction: column;
	}

	/* ── Split layout ──
	   Gated at 1152px: below this the column's right edge (50vw + 26rem)
	   would cross the nav's left edge (100vw − 146px). At ≥1152px the text
	   measure clears the nav with room to spare, so they never overlap. */
	@media (min-width: 1152px) {
		.portrait {
			position: fixed;
			top: 0;
			left: 0;
			width: 50vw;
			height: 100vh;
			z-index: 50;
		}

		.portrait-img {
			width: 100%;
			height: 100%;
		}

		/* Wordmark drops to the datum, over the image. */
		.wordmark {
			top: 50%;
			transform: translateY(-50%);
		}

		.nav-right {
			top: 50%;
			left: auto;
			right: 16px;
			transform: translateY(-50%);
		}

		.about {
			position: relative;
			z-index: 60;
		}

		/* Text reads in the right half, left-aligned to the image edge.
		   26rem measure keeps the right edge clear of the fixed nav. */
		.column {
			max-width: 26rem;
			margin: 0;
			margin-left: 50vw;
			padding: 22vh 48px 18vh 48px;
		}
	}
</style>
