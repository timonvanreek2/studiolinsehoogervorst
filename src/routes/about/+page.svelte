<script lang="ts">
	import { page } from '$app/state';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	let { data } = $props();

	let path = $derived(page.url.pathname);
	let isAbout = $derived(path.startsWith('/about'));

	let menuOpen = $state(false);

	let portraitOne = $derived(data.studio?.portraitOne ?? null);
	let portraitTwo = $derived(data.studio?.portraitTwo ?? null);
	let hasPortraits = $derived(!!(portraitOne || portraitTwo));

	// Portraits are cropped to 4:5 around the Sanity hotspot.
	function portraitSrcset(url: string): string {
		return [300, 460, 600, 760]
			.map((w) => `${url}?w=${w}&h=${Math.round(w * 1.25)}&fit=crop&auto=format&q=85 ${w}w`)
			.join(', ');
	}
	function portraitSrc(url: string): string {
		return `${url}?w=460&h=575&fit=crop&auto=format&q=85`;
	}
</script>

<svelte:head>
	<title>About — Studio Linse Hoogervorst</title>
	<meta property="og:title" content="About — Studio Linse Hoogervorst" />
	<meta property="og:description" content="A practice for interior architecture, founded by Paul Linse in Amsterdam." />
</svelte:head>

<h1 class="sr-only">About — Studio Linse Hoogervorst</h1>

<a href="/" class="wordmark" aria-label="Studio Linse Hoogervorst">
	<Wordmark progress={1} />
</a>

<nav class="nav-right">
	<button class="menu-toggle" onclick={() => (menuOpen = true)}>Menu</button>
	<div class="nav-links">
		<a href="/" class="nav-link">Selected</a><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link">Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link" class:selected={isAbout}>About</a>
	</div>
</nav>

<MobileMenu bind:open={menuOpen} />

<main class="about" class:has-portraits={hasPortraits}>
	{#if hasPortraits}
		<div class="portraits">
			{#if portraitOne}
				<img
					class="portrait"
					src={portraitSrc(portraitOne)}
					srcset={portraitSrcset(portraitOne)}
					sizes="(min-width: 1152px) 228px, 45vw"
					alt="Studio Linse Hoogervorst"
				/>
			{/if}
			{#if portraitTwo}
				<img
					class="portrait"
					src={portraitSrc(portraitTwo)}
					srcset={portraitSrcset(portraitTwo)}
					sizes="(min-width: 1152px) 228px, 45vw"
					alt="Studio Linse Hoogervorst"
				/>
			{/if}
		</div>
	{/if}

	<div class="column">
		{#if data.studio?.aboutText}
			<div class="bio">
				{#each data.studio.aboutText.split('\n\n') as paragraph}
					<p>{paragraph}</p>
				{/each}
			</div>
		{/if}

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
	   About — two portraits on the datum.

	   On wide screens the two founder portraits sit centred as a pair,
	   their vertical middle resting on the site-wide datum (50vh), with the
	   wordmark and nav flanking on the same horizontal line — the datum
	   becomes a shelf carrying name, faces, and nav across the page. The
	   bio (driven entirely by Sanity, no hard-coded copy) reads in a centred
	   column below.

	   Below 1152px the wide wordmark can't share the datum line with the
	   centred portraits, so the layout stacks: chrome anchors to the top-left
	   corner (wordmark, then nav beneath it), portraits sit side by side, bio
	   below.
	   ───────────────────────────────────────────────────────────── */

	/* Datum chrome — shared with the rest of the site. The mark here is the
	   resting S/L/H monogram (progress 1); hovering it types the full name. */
	.wordmark {
		position: fixed;
		top: 24px;
		left: 16px;
		z-index: 200;
		display: flex;
		align-items: center;
		--mark-w: 110px;
		--mark-h: 43px;
		color: #000;
	}

	@supports (mix-blend-mode: exclusion) {
		.wordmark {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	/* Stacked mobile chrome: nav sits under the 43px-tall monogram. */
	.nav-right {
		position: fixed;
		top: 77px;
		left: 16px;
		right: auto;
		z-index: 200;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		color: #000;
	}

	@supports (mix-blend-mode: exclusion) {
		.nav-right {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.nav-links {
		display: flex;
		align-items: baseline;
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

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: inherit;
	}

	.about {
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 13px;
		line-height: 1.5;
		color: var(--color-primary);
	}

	/* Stacked (mobile / tablet) defaults — content clears the taller
	   monogram chrome (nav bottom ≈ 90px). */
	.portraits {
		display: flex;
		gap: 12px;
		max-width: 22rem;
		margin: 0 auto;
		padding: 90px 16px 0;
		box-sizing: border-box;
	}

	.about:not(.has-portraits) .column {
		padding-top: 90px;
	}

	.portrait {
		flex: 1 1 0;
		min-width: 0;
		aspect-ratio: 4 / 5;
		object-fit: cover;
		display: block;
	}

	.column {
		max-width: 22rem;
		margin: 0 auto;
		padding: 40px 16px 96px;
		box-sizing: border-box;
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

	/* ── Mobile nav ──
	   On narrow screens the wordmark grows and moves to top-left; the nav
	   moves to top-right and collapses behind a Menu toggle. */
	@media (max-width: 768px) {
		.wordmark {
			top: 16px;
			--mark-w: 140px;
			--mark-h: 54px;
		}

		.nav-right {
			top: 16px;
			left: auto;
			right: 16px;
			align-items: flex-end;
		}

		.menu-toggle {
			display: block;
		}

		.nav-links {
			display: none;
		}

		/* Left-align to the shared 16px page margin instead of a centred narrow
		   column, so About lines up with every other page. */
		.portraits,
		.column {
			max-width: none;
			margin-left: 0;
			margin-right: 0;
		}

		/* The space above the footer is owned by the footer, so the bio column
		   doesn't add its own bottom padding on mobile. */
		.column {
			padding-bottom: 0;
		}
	}

	/* ── Datum layout (wide screens) ──
	   Gated at 1152px so the centred portrait pair clears the fixed wordmark
	   on the left and the nav on the right. */
	@media (min-width: 1152px) {
		/* Chrome drops to the datum line. */
		.wordmark {
			top: 50%;
			transform: translateY(-50%);
			--mark-w: 160px;
			--mark-h: 62px;
		}

		.nav-right {
			top: 50%;
			left: auto;
			right: 16px;
			transform: translateY(-50%);
		}

		/* Push content so the portrait row's centre lands on the datum:
		   the row is 285px tall (228px wide × 4:5), so half is ~143px. */
		.about.has-portraits {
			padding-top: calc(50vh - 143px);
		}

		.portraits {
			max-width: none;
			width: 480px;
			gap: 24px;
			padding: 0;
			margin: 0 auto;
		}

		.column {
			max-width: none;
			width: 480px;
			padding: 0;
			margin: 56px auto 30vh;
		}
	}
</style>
