<script lang="ts">
	import { page } from '$app/state';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	let { data } = $props();

	let path = $derived(page.url.pathname);
	let isIndex = $derived(path.startsWith('/projects'));

	/* The datum bar greets you at the top, then steps aside so the
	   full-width table owns the page. Returns when you scroll back. */
	let barHidden = $state(false);
	let menuOpen = $state(false);

	function onScroll() {
		barHidden = window.scrollY > window.innerHeight * 0.08;
	}

	function cityOnly(location: string): string {
		return location?.split(',')[0].trim() ?? '';
	}

	function formatCategory(cat: string): string {
		return cat?.replace('-', ' & ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';
	}

	/* Cursor-following preview.
	   Hovering a row shows that project's image floating beside the pointer.
	   The element is moved by writing transform directly inside a rAF tick —
	   never through reactive state — so mousemove stays off the render path
	   and the preview tracks the cursor at compositor speed. */
	let previewSrc = $state<string | null>(null);
	let previewEl: HTMLDivElement | null = $state(null);
	let rafId = 0;
	let lastX = 0;
	let lastY = 0;

	function imageFor(project: { image?: string; gallery?: { url: string }[] }): string {
		return project.image || project.gallery?.[0]?.url || '';
	}

	function previewUrl(src: string): string {
		return `${src}?w=600&h=750&fit=crop&auto=format&q=85`;
	}

	function showPreview(src: string) {
		// Skip on touch / non-hover pointers — there's no cursor to follow.
		if (window.matchMedia('(hover: none)').matches) return;
		if (src) previewSrc = src;
	}

	function hidePreview() {
		previewSrc = null;
	}

	function movePreview(e: MouseEvent) {
		lastX = e.clientX;
		lastY = e.clientY;
		if (rafId || !previewSrc) return;
		rafId = requestAnimationFrame(() => {
			rafId = 0;
			if (!previewEl) return;
			const w = previewEl.offsetWidth;
			const h = previewEl.offsetHeight;
			const gap = 28;
			// Sit to the right of the cursor; flip left when it would overflow.
			let x = lastX + gap;
			if (x + w > window.innerWidth - 12) x = lastX - gap - w;
			// Vertically centred on the cursor, clamped to the viewport.
			let y = Math.max(12, Math.min(lastY - h / 2, window.innerHeight - h - 12));
			previewEl.style.transform = `translate(${x}px, ${y}px)`;
		});
	}
</script>

<svelte:window onscroll={onScroll} />

<svelte:head>
	<title>Index — Studio Linse Hoogervorst</title>
	<meta property="og:title" content="Index — Studio Linse Hoogervorst" />
	<meta property="og:description" content="Selected projects by Studio Linse Hoogervorst." />
</svelte:head>

<h1 class="sr-only">Index — Studio Linse Hoogervorst</h1>

<a href="/" class="wordmark" class:bar-hidden={barHidden} aria-label="Studio Linse Hoogervorst">
	<Wordmark progress={1} />
</a>

<nav class="fixed-nav" class:bar-hidden={barHidden}>
	<button class="menu-toggle" onclick={() => (menuOpen = true)}>Menu</button>
	<div class="nav-links">
		<a href="/" class="nav-link">Selected</a><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link" class:selected={isIndex}>Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link">About</a>
	</div>
</nav>

<MobileMenu bind:open={menuOpen} />

<main class="index-page" onmousemove={movePreview}>
	<div class="project-list">
		{#each data.projects as project (project.slug)}
			<a
				href="/projects/{project.slug}"
				class="list-row"
				onmouseenter={() => showPreview(imageFor(project))}
				onmouseleave={hidePreview}
			>
				<span class="list-title">{project.title}</span>
				<span class="list-location">{cityOnly(project.location)}</span>
				<span class="list-category">{formatCategory(project.category)}</span>
				<span class="list-year">{project.completion || '—'}</span>
			</a>
		{/each}
	</div>
</main>

<div class="hover-preview" class:visible={!!previewSrc} bind:this={previewEl} aria-hidden="true">
	{#if previewSrc}
		<img src={previewUrl(previewSrc)} alt="" />
	{/if}
</div>

<style>
	/* Site-wide datum: the bar sits fixed at the viewport's vertical
	   centre, identical to the home page. Here it yields on scroll so the
	   full-width table owns the page. */
	.wordmark {
		position: fixed;
		top: 50%;
		left: 16px;
		transform: translateY(-50%);
		z-index: 200;
		display: flex;
		align-items: center;
		/* Resting S/L/H monogram, same scale as the homepage's docked state. */
		--mark-w: 160px;
		--mark-h: 62px;
		color: #000;
		transition: opacity 0.12s ease-out, visibility 0.12s;
	}

	@supports (mix-blend-mode: exclusion) {
		.wordmark {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.wordmark.bar-hidden,
	.fixed-nav.bar-hidden {
		opacity: 0;
		visibility: hidden;
	}

	.fixed-nav {
		position: fixed;
		top: 50%;
		right: 16px;
		transform: translateY(-50%);
		z-index: 200;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		color: #000;
		transition: opacity 0.12s ease-out, visibility 0.12s;
	}

	@supports (mix-blend-mode: exclusion) {
		.fixed-nav {
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

	.index-page {
		/* the table starts just below the datum line, so the bar has faded
		   before any row reaches it */
		padding: 60vh 16px 30vh;
	}

	.project-list {
		display: flex;
		flex-direction: column;
	}

	.list-row {
		display: flex;
		align-items: baseline;
		gap: 16px;
		/* Horizontal padding matches main's 16px page inset; the equal negative
		   margin pulls the row's box out to the screen edges, so a hover fill
		   bleeds edge-to-edge while the text stays aligned with the page. */
		padding: 7px 16px;
		margin: 0 -16px;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 13px;
		line-height: 1.4;
		color: var(--color-primary);
		transition: background-color 0.12s ease-out;
	}

	.list-row:focus-visible {
		outline: 1px solid currentColor;
		outline-offset: 2px;
	}

	.list-row:focus-visible .list-title {
		font-style: italic;
	}

	@media (hover: hover) and (pointer: fine) {
		.nav-link:hover {
			opacity: 0.5;
		}

		.list-row:hover {
			background: var(--color-hover);
		}

		.list-row:hover .list-title {
			font-style: italic;
		}
	}

	.list-title {
		flex: 1;
		font-weight: 550;
	}

	.list-location {
		width: 160px;
		flex-shrink: 0;
		color: var(--color-muted, #999);
	}

	.list-category {
		width: 160px;
		flex-shrink: 0;
		color: var(--color-muted, #999);
	}

	.list-year {
		width: 60px;
		flex-shrink: 0;
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--color-muted, #999);
	}

	/* Cursor-following preview. Position is driven by transform from JS;
	   top/left stay at 0 so the transform is the single source of truth.
	   pointer-events:none keeps it from stealing hover from the rows. */
	.hover-preview {
		position: fixed;
		top: 0;
		left: 0;
		width: 240px;
		z-index: 100;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.18s ease-out;
		will-change: transform;
	}

	.hover-preview.visible {
		opacity: 1;
	}

	.hover-preview img {
		display: block;
		width: 100%;
		aspect-ratio: 4 / 5;
		object-fit: cover;
	}

	/* No cursor to follow on touch — never show it. */
	@media (hover: none) {
		.hover-preview {
			display: none;
		}
	}

	@media (max-width: 768px) {
		/* On mobile the nav pins to the top — no datum, no fade. */
		.wordmark {
			top: 16px;
			left: 16px;
			transform: none;
			--mark-w: 140px;
			--mark-h: 54px;
		}

		.fixed-nav {
			top: 16px;
			right: 16px;
			transform: none;
		}

		/* Override the bar-hidden fade so the nav stays visible on mobile. */
		.wordmark.bar-hidden,
		.fixed-nav.bar-hidden {
			opacity: 1;
			visibility: visible;
			pointer-events: auto;
		}

		.menu-toggle {
			display: block;
		}

		.nav-links {
			display: none;
		}

		/* Content starts below the fixed nav bar (wordmark top 16px + 54px height + 16px gap).
		   The space above the footer is owned by the footer itself, so no bottom pad here. */
		.index-page {
			padding: 90px 16px 0;
		}

		/* Match the row bleed to the 16px page inset (avoids overflow). */
		.list-row {
			padding: 7px 16px;
			margin: 0 -16px;
		}

		.list-location,
		.list-category {
			display: none;
		}

		.list-year {
			width: auto;
		}
	}
</style>
