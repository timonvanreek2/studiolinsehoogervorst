<script lang="ts">
	import { page } from '$app/state';
	import CatalogueGrid from '$lib/components/CatalogueGrid.svelte';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';

	let { data } = $props();

	let allProjects = $derived(
		data.allProjects.filter((p) => p.image || (p.gallery && p.gallery.length > 0))
	);

	let heroSlug = $derived(data.heroSlug ?? allProjects[0]?.slug ?? '');

	// Mobile is a single-column feed where the hero docks into the TOP slot
	// (index 0); desktop is a 3-col grid where the hero docks into the top-middle
	// cell (index 1). Set from a media query on the client.
	let singleColumn = $state(false);

	let gridProjects = $derived.by(() => {
		let list = [...allProjects];
		const target = singleColumn ? 0 : 1;
		const heroIndex = list.findIndex((p) => p.slug === heroSlug);
		if (heroIndex >= 0 && heroIndex !== target) {
			const [hero] = list.splice(heroIndex, 1);
			list.splice(target, 0, hero);
		}
		return list;
	});

	let path = $derived(page.url.pathname);
	let isAbout = $derived(path.startsWith('/about'));

	let menuOpen = $state(false);

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

	// Wordmark typewriter: full name at the top (progress 0), un-typing to the
	// S / L / H monogram as the hero docks (progress 1). Reduced motion stays full.
	let wordmarkProgress = $derived(reduceMotion ? 0 : progress);

	let ticking = false;
	let styleEl: HTMLStyleElement | null = null;
	let raf: { cellLeft: number; cellW: number; startW: number; startLeft: number; startTop: number } | null = null;
	let supportsScrollTimeline = false;

	// chrome clears out as the footer arrives, so it never overlaps it
	let atFooter = $state(false);
	let footerEl: HTMLElement | null = null;

	function heroDelta(p: number) {
		const m = raf!;
		const s0 = m.startW / m.cellW;
		const dx = (1 - p) * (m.startLeft - m.cellLeft);
		// centred path: the image stays optically centred while it scales, so its
		// rendered top tracks (vh − h(p))/2. startTop is that offset at p=0; it
		// interpolates to 0 at p=1 (identity dock). On desktop startH = vh, so
		// startTop = −docTop and this reduces to the original (p−1)·docTop.
		const dy = (1 - p) * m.startTop;
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

		// Mobile: hero opens at 55vh, centred in the viewport so the wordmark sits
		// above it. Desktop: opens at 100vh (full-screen, which is also centred).
		const startH = vw <= 768 ? vh * 0.55 : vh;
		const startW = startH * (4 / 5);
		const startTop = (vh - startH) / 2 - docTop;
		raf = { cellLeft, cellW, startW, startLeft: (vw - startW) / 2, startTop };

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
		// progress drives the grid reveal and wordmark typewriter — it's pure
		// state with no layout read, so set it synchronously rather than waiting
		// on a rAF (which can be throttled, leaving the grid stuck gated).
		const y = window.scrollY;
		progress = Math.min(y / SCROLL_RANGE, 1);

		// The footer check reads layout (getBoundingClientRect), so keep it
		// batched in a rAF, guarded by `ticking` to coalesce bursts of events.
		if (ticking) return;
		ticking = true;
		requestAnimationFrame(() => {
			footerEl ??= document.querySelector('.footer');
			// hide once the footer's top rises past the datum line (vh/2)
			atFooter = footerEl
				? footerEl.getBoundingClientRect().top < window.innerHeight * 0.5
				: false;

			if (!supportsScrollTimeline && !reduceMotion) applyFrame(window.scrollY);
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

		const colMq = window.matchMedia('(max-width: 768px)');
		singleColumn = colMq.matches;
		const onCol = () => { singleColumn = colMq.matches; };
		colMq.addEventListener('change', onCol);

		return () => {
			mq.removeEventListener('change', onMq);
			colMq.removeEventListener('change', onCol);
			styleEl?.remove();
			styleEl = null;
		};
	});

	// re-measure whenever the hero element (re)mounts, motion pref flips, the
	// column count flips (hero changes slot), or the window resizes
	$effect(() => {
		void heroEl;
		void reduceMotion;
		void singleColumn;
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

<a href="/" class="wordmark" class:hidden={atFooter} aria-label="Studio Linse Hoogervorst">
	<Wordmark progress={wordmarkProgress} />
</a>

<nav class="fixed-nav" class:hidden={atFooter}>
	<button class="menu-toggle" onclick={() => (menuOpen = true)}>Menu</button>
	<div class="nav-links">
		<button class="nav-link" class:selected={progress >= 1} onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Selected</button><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link">Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link" class:selected={isAbout}>About</a>
	</div>
</nav>

<MobileMenu bind:open={menuOpen} />

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
		/* Stacked-wordmark display size; the typewriter reveal scales off these.
		   (Native asset is 219×85 — shown smaller for a quieter presence.) */
		--mark-w: 160px;
		--mark-h: 62px;
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

	/* No dim on hover — hovering the mark types the full name back in, and
	   that reveal IS the hover feedback. */

	.wordmark.hidden,
	.fixed-nav.hidden {
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
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

	.nav-links {
		display: flex;
		align-items: baseline;
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

	.menu-toggle {
		display: none;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		cursor: pointer;
		color: inherit;
	}

	main {
		position: relative;
		z-index: 60;
		min-height: 100vh;
		/* JS sets the real value; this keeps the pre-hydration frame close */
		padding-top: calc(800px + 50vh - ((100vw - 680px) / 3) * 0.625);
	}

	@media (max-width: 768px) {
		/* Pin chrome to the top — same pattern as about and projects pages. */
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

		.menu-toggle {
			display: block;
		}

		.nav-links {
			display: none;
		}

		main {
			/* Single-column feed: cell is 64% of the (100vw − 32px) content width,
			   so its half-height is (100vw − 32px) × 0.64 × 0.625 = × 0.4. */
			padding-top: calc(800px + 50vh - (100vw - 32px) * 0.4);
		}
	}
</style>
