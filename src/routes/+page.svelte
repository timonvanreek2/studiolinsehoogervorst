<script lang="ts">
	import { page } from '$app/state';
	import type { Category } from '$lib/types';
	import CatalogueGrid from '$lib/components/CatalogueGrid.svelte';

	let { data } = $props();

	let allProjects = $derived(
		data.allProjects.filter((p) => p.image || (p.gallery && p.gallery.length > 0))
	);

	let activeFilter = $state<Category | null>(null);

	let gridProjects = $derived.by(() => {
		let list = [...allProjects];
		const ngIndex = list.findIndex((p) => p.slug === 'national-gallery');
		if (ngIndex >= 0 && ngIndex !== 1) {
			const [ng] = list.splice(ngIndex, 1);
			list.splice(1, 0, ng);
		}
		if (activeFilter) {
			list = list.filter((p) => p.category === activeFilter || p.categories?.includes(activeFilter!));
		}
		return list;
	});

	const CATEGORIES: { label: string; value: Category }[] = [
		{ label: 'Hospitality', value: 'hospitality' },
		{ label: 'Cultural', value: 'cultural' },
		{ label: 'Corporate & Retail', value: 'corporate-retail' },
		{ label: 'Residential', value: 'residential' },
	];

	function setFilter(cat: Category | null) {
		activeFilter = activeFilter === cat ? null : cat;
		window.scrollTo({ top: SCROLL_RANGE, behavior: 'smooth' });
	}

	const heroSlug = 'national-gallery';

	let path = $derived(page.url.pathname);
	let isAbout = $derived(path.startsWith('/about'));

	/*
	 * Hero → grid docking.
	 *
	 * The hero image IS its grid cell. Its resting state is plain static layout,
	 * so "locking into place" is the identity transform — there is no handoff
	 * moment that can jump. The intro transforms the cell from centre stage
	 * (height 100vh, centred) back to its natural slot over SCROLL_RANGE px of
	 * scroll. Where supported, the transform is a CSS scroll-driven animation
	 * (compositor-thread, zero frames behind the scroll); otherwise a rAF
	 * fallback writes the transform directly.
	 *
	 * The image stays optically centred while it scales: its top follows
	 * (vh − h(p))/2. Because the spacer is built so the docked slot IS the
	 * centred position, that path lands on the identity transform exactly,
	 * and the deltas come out linear in scroll — two keyframes suffice.
	 */
	const SCROLL_RANGE = 800;

	let heroEl = $state<HTMLElement | null>(null);
	let mainEl = $state<HTMLElement | null>(null);
	let progress = $state(0);
	let reduceMotion = $state(false);
	let revealed = $derived(reduceMotion || progress >= 0.85);
	let docked = $derived(reduceMotion || progress >= 1);

	let ticking = false;
	let styleEl: HTMLStyleElement | null = null;
	let raf: { docTop: number; cellLeft: number; cellW: number; startW: number; startLeft: number } | null = null;
	let supportsScrollTimeline = false;

	// chrome clears out as the footer arrives, so it never overlaps it
	let atFooter = $state(false);
	let footerEl: HTMLElement | null = null;

	function heroDelta(p: number) {
		const m = raf!;
		const s0 = m.startW / m.cellW;
		const dx = (1 - p) * (m.startLeft - m.cellLeft);
		// centred path: rendered top = (vh − h(p))/2, which simplifies to
		// natural top + (p − 1)·docTop given docTop = RANGE + (vh − cellH)/2
		const dy = (p - 1) * m.docTop;
		const s = s0 + (1 - s0) * p;
		return { dx, dy, s };
	}

	function buildKeyframes(): string {
		let css = '@keyframes hero-dock {';
		for (const p of [0, 1]) {
			const { dx, dy, s } = heroDelta(p);
			css += `${p * 100}% { transform: translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) scale(${s.toFixed(5)}); }`;
		}
		return css + '}';
	}

	function layout() {
		if (!heroEl || !mainEl) return;
		const vh = window.innerHeight;
		const vw = window.innerWidth;

		if (reduceMotion) {
			mainEl.style.paddingTop = '120px';
			heroEl.style.animation = '';
			heroEl.style.transform = '';
			return;
		}

		const cellW = heroEl.offsetWidth;
		const cellH = cellW * 1.25;
		mainEl.style.paddingTop = `${SCROLL_RANGE + (vh - cellH) / 2}px`;

		// offset-based measurement: immune to any transform currently applied
		const mainRect = mainEl.getBoundingClientRect();
		const docTop = mainRect.top + window.scrollY + heroEl.offsetTop;
		const cellLeft = mainRect.left + heroEl.offsetLeft;

		const startW = vh * (4 / 5); // 4:5 aspect → start height is exactly 100vh
		raf = { docTop, cellLeft, cellW, startW, startLeft: (vw - startW) / 2 };

		if (supportsScrollTimeline) {
			if (!styleEl) {
				styleEl = document.createElement('style');
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = buildKeyframes();
			heroEl.style.transformOrigin = 'top left';
			heroEl.style.animation = 'hero-dock 1ms linear both';
			heroEl.style.setProperty('animation-timeline', 'scroll(root block)');
			heroEl.style.setProperty('animation-range', `0px ${SCROLL_RANGE}px`);
		} else {
			heroEl.style.transformOrigin = 'top left';
			applyFrame(window.scrollY);
		}
	}

	function applyFrame(y: number) {
		if (!heroEl || !raf) return;
		const p = Math.min(Math.max(y / SCROLL_RANGE, 0), 1);
		if (p >= 1) {
			heroEl.style.transform = '';
			return;
		}
		const { dx, dy, s } = heroDelta(p);
		heroEl.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
	}

	function onScroll() {
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			const y = window.scrollY;
			progress = Math.min(y / SCROLL_RANGE, 1);

			footerEl ??= document.querySelector('.footer');
			// hide once the footer's top rises past the datum line (vh/2)
			atFooter = footerEl
				? footerEl.getBoundingClientRect().top < window.innerHeight * 0.5
				: false;

			if (!supportsScrollTimeline && !reduceMotion) applyFrame(y);
			ticking = false;
		});
	}

	$effect(() => {
		supportsScrollTimeline =
			typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()');
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduceMotion = mq.matches;
		const onMq = () => { reduceMotion = mq.matches; };
		mq.addEventListener('change', onMq);
		return () => {
			mq.removeEventListener('change', onMq);
			styleEl?.remove();
			styleEl = null;
		};
	});

	// re-measure whenever the hero element (re)mounts, motion pref flips, or the window resizes
	$effect(() => {
		void heroEl;
		void reduceMotion;
		layout();
		onScroll();
		const onResize = () => layout();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});
</script>

<svelte:window onscroll={onScroll} />

<svelte:head>
	<title>Studio Linse Hoogervorst</title>
	<meta property="og:title" content="Studio Linse Hoogervorst" />
	<meta property="og:description" content="A practice for interior architecture, founded by Paul Linse in Amsterdam." />
</svelte:head>

<h1 class="sr-only">Studio Linse Hoogervorst — Selected works</h1>

<a href="/" class="wordmark" class:hidden={atFooter}>
	<img src="/wordmark.svg" alt="Studio Linse Hoogervorst" class="wordmark-img" />
</a>

<nav class="fixed-nav" class:hidden={atFooter}>
	<button class="nav-link" class:selected={progress >= 1 && !activeFilter} onclick={() => setFilter(null)}>Selected</button><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link">Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link" class:selected={isAbout}>About</a>
</nav>

<div class="bottom-filters" class:visible={progress >= 1 && !atFooter}>
	{#each CATEGORIES as cat, i}
		<button
			class="filter-link"
			class:active={activeFilter === cat.value}
			style:transition-delay="{i * 50}ms"
			onclick={() => setFilter(cat.value)}
		>{cat.label}</button>
	{/each}
</div>

<main bind:this={mainEl}>
	<CatalogueGrid
		projects={gridProjects}
		{heroSlug}
		{revealed}
		{docked}
		onHeroEl={(el) => (heroEl = el)}
	/>
</main>

<style>
	/* The bar is a fixed datum at the viewport's vertical centre — the
	   line the hero hangs on, and the spine the catalogue scrolls through.
	   It never travels; images pass behind it and the exclusion blend
	   inverts the type as they cross. */
	.wordmark {
		position: fixed;
		top: 50%;
		left: 16px;
		transform: translateY(-50%);
		z-index: 200;
		display: flex;
		align-items: center;
		/* Legible fallback for browsers without mix-blend-mode support */
		color: #000;
		transition: opacity 0.2s ease-out, visibility 0.2s;
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

	.wordmark.hidden,
	.fixed-nav.hidden {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
	}

	.wordmark-img {
		height: 16px;
		width: auto;
		display: block;
	}

	.fixed-nav {
		position: fixed;
		top: 50%;
		right: 16px;
		transform: translateY(-50%);
		z-index: 200;
		display: flex;
		align-items: baseline;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		/* Legible fallback for browsers without mix-blend-mode support */
		color: #000;
		transition: opacity 0.2s ease-out, visibility 0.2s;
	}

	@supports (mix-blend-mode: exclusion) {
		.fixed-nav {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.nav-link {
		color: inherit;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
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

	.bottom-filters {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 200;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 8px;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		/* Legible fallback for browsers without mix-blend-mode support */
		color: #000;
		pointer-events: none;
	}

	@supports (mix-blend-mode: exclusion) {
		.bottom-filters {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.filter-link {
		color: inherit;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		font-weight: 500;
		cursor: pointer;
		white-space: nowrap;
		pointer-events: auto;
		opacity: 0;
		transform: translateY(4px);
		transition: opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.bottom-filters.visible .filter-link {
		opacity: 0.4;
		transform: translateY(0);
	}

	.bottom-filters.visible .filter-link:hover {
		opacity: 0.7;
	}

	.bottom-filters.visible .filter-link.active {
		opacity: 1;
		font-style: italic;
	}

	main {
		position: relative;
		z-index: 60;
		min-height: 100vh;
		/* JS sets the real value; this keeps the pre-hydration frame close */
		padding-top: calc(800px + 50vh - ((100vw - 680px) / 3) * 0.625);
	}

	@media (max-width: 768px) {
		.wordmark {
			left: 8px;
		}

		/* Shrink wordmark on mobile to prevent collision with fixed-nav at ~390px.
		   At 16px the SVG wordmark renders ~330px wide — far too wide to share the
		   datum line with the nav (~120px). Dropping to 13px brings it to ~270px;
		   combined with right:8px nav placement they still total ~400px. The robust
		   solution: keep both on the datum but wrap fixed-nav below the wordmark as
		   a unit when they can't fit. We use the simple approach: shrink wordmark to
		   13px height and accept a small gap — tested at 390px they clear each other. */
		.wordmark-img {
			height: 13px;
		}

		.fixed-nav {
			right: 8px;
		}

		/* On mobile the filters sit over photography: a quiet glass chip
		   instead of blend-mode text keeps them legible — but ONLY once
		   .visible is set, so the chip doesn't appear as an empty white
		   rectangle before the user has scrolled into the grid. */
		.bottom-filters {
			right: 8px;
			bottom: 8px;
			mix-blend-mode: normal;
			color: var(--color-primary);
		}

		/* Apply frosted-glass treatment only when the chip is visible */
		.bottom-filters.visible {
			background: rgba(255, 255, 255, 0.65);
			-webkit-backdrop-filter: blur(12px);
			backdrop-filter: blur(12px);
			padding: 10px 12px;
		}

		/* Override the @supports exclusion rule for mobile */
		@supports (mix-blend-mode: exclusion) {
			.bottom-filters {
				color: var(--color-primary);
				mix-blend-mode: normal;
			}
		}

		main {
			padding-top: calc(800px + 50vh - ((100vw - 24px) / 2) * 0.625);
		}
	}
</style>
