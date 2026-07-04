<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import CatalogueGrid from '$lib/components/CatalogueGrid.svelte';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import MobileMenu from '$lib/components/MobileMenu.svelte';
	import { lab } from '$lib/lab.svelte';

	let { data } = $props();

	let allProjects = $derived(
		data.allProjects.filter((p) => p.image || (p.gallery && p.gallery.length > 0))
	);

	let heroSlug = $derived(data.heroSlug ?? allProjects[0]?.slug ?? '');

	// Hero opening orientation is a per-project Sanity setting (default landscape),
	// not a global toggle — the hero project decides whether it opens 3:2 or 4:5.
	let heroProject = $derived(allProjects.find((p) => p.slug === heroSlug));
	let heroLandscape = $derived(heroProject?.heroOrientation !== 'portrait');

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

	// Crop-morph (landscape lab variant): the wide image's aspect inside the
	// hero window. Must stay in sync with the -43.75% offset in CatalogueGrid.
	const HERO_WIDE_ASPECT = 3 / 2;

	// Breathing gap (px) the inset hero leaves past the wordmark's right edge —
	// the air between logo and framed image (re: the lab inset opening).
	const LOGO_CLEARANCE = 40;

	let heroEl = $state<HTMLElement | null>(null);
	let mainEl = $state<HTMLElement | null>(null);
	let progress = $state(0);
	let reduceMotion = $state(false);
	let revealed = $derived(reduceMotion || progress >= 0.85);
	let docked = $derived(reduceMotion || progress >= 1);

	// Wordmark typewriter: full name at the top (progress 0), un-typing to the
	// S / L / H monogram as the hero docks (progress 1). Reduced motion stays full.
	let wordmarkProgress = $derived(reduceMotion ? 0 : progress);

	// Hero corner radius. Two regimes, by opening size:
	//  • FULL openings fill the viewport, so their corners are off-screen — they
	//    start sharp (factor 0) and round only as they lock into the grid, ramped
	//    over the last 20% (also avoids clip-mask writes during the heavy scroll).
	//  • SMALLER (inset) openings are framed prints — rounded from the very start.
	//    Portrait scales uniformly, so a constant factor of 1 reads as a clean,
	//    proportional 4px. Landscape's crop morph scales non-uniformly, which would
	//    turn a flat radius elliptical — so its radius is counter-scaled inside the
	//    keyframes instead, and the factor stays undefined here.
	// Reduced motion has no dock — undefined falls back to the global radius.
	let heroRadiusFactor = $derived.by(() => {
		if (reduceMotion) return undefined;
		if (lab.heroInset) return heroLandscape ? undefined : 1;
		return progress <= 0.8 ? 0 : (progress - 0.8) / 0.2;
	});

	let ticking = false;
	let styleEl: HTMLStyleElement | null = null;
	let raf: {
		cellLeft: number;
		cellW: number;
		cellH: number;
		startW: number;
		startH: number;
		startLeft: number;
		startTop: number;
	} | null = null;
	let supportsScrollTimeline = false;

	// Crop-morph hero elements (landscape lab variant) — the clipping window and
	// the wide image inside it; both carry their own scroll-driven transform.
	let cropEl: HTMLElement | null = null;
	let wideImgEl: HTMLElement | null = null;

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

	/*
	 * Crop-morph dock (landscape lab variant). The visible window W(p) lerps
	 * from full screen (startW × startH) to the 4:5 cell; since its aspect
	 * changes, the outer .crop scales non-uniformly (sx, sy) — which would
	 * stretch the picture, so the wide img inside counter-scales by (c/sx, c/sy)
	 * where c is the uniform "cover" factor for the current window. Net effect:
	 * the image only ever scales uniformly; the framing tightens around it.
	 * Both layers are pure transforms, so the compositor scroll-timeline still
	 * drives them; the 1/s terms make the inner path nonlinear, hence sampled
	 * keyframes rather than two.
	 */
	function landscapeDelta(p: number) {
		const m = raf!;
		const w = m.cellW + (1 - p) * (m.startW - m.cellW);
		const h = m.cellH + (1 - p) * (m.startH - m.cellH);
		const sx = w / m.cellW;
		const sy = h / m.cellH;
		const dx = (1 - p) * (m.startLeft - m.cellLeft);
		const dy = (1 - p) * m.startTop;
		const imgW = m.cellH * HERO_WIDE_ASPECT;
		// Image zoom: lerp between the endpoint cover factors rather than tracking
		// strict per-frame cover (max of the two axis ratios). The strict max has a
		// slope kink where the shrinking window crosses the image's 3:2 aspect —
		// on a 16:9 screen that lands mid-dock and reads as a hitch in the zoom.
		// The lerp stays ≥ the strict minimum everywhere (a chord over a convex
		// function), so the window is always covered; it hits full-bleed at p=0
		// and the identity at p=1 exactly, with a perfectly even zoom in between.
		const c0 = Math.max(m.startW / imgW, m.startH / m.cellH);
		const c = c0 + (1 - c0) * p;
		const kx = c / sx;
		const ky = c / sy;
		const tx = (imgW * (1 - kx)) / 2;
		const ty = (m.cellH * (1 - ky)) / 2;
		return { dx, dy, sx, sy, tx, ty, kx, ky };
	}

	function buildKeyframes(): string {
		if (heroLandscape) {
			// Window + image are pure transforms ONLY — never put border-radius (or any
			// non-compositable prop) in these keyframes. A scroll-timeline animation runs
			// on the GPU compositor thread only while every animated property is
			// compositable; a single border-radius keyframe demotes the whole thing to the
			// main thread and re-rasterises the clipped image every frame (the inset dock's
			// jank). The inset's 4px corner instead rides the .crop's static CSS radius: it
			// renders scaled during the morph (a hair softer up top) and resolves to an
			// exact 4px circle at the docked rest scale of 1 — all on the compositor.
			let win = '@keyframes hero-dock-win {';
			let img = '@keyframes hero-dock-img {';
			const STEPS = 40;
			for (let i = 0; i <= STEPS; i++) {
				const p = i / STEPS;
				const d = landscapeDelta(p);
				const pct = (p * 100).toFixed(1);
				win += `${pct}% { transform: translate(${d.dx.toFixed(2)}px, ${d.dy.toFixed(2)}px) scale(${d.sx.toFixed(5)}, ${d.sy.toFixed(5)}); }`;
				img += `${pct}% { transform: translate(${d.tx.toFixed(2)}px, ${d.ty.toFixed(2)}px) scale(${d.kx.toFixed(5)}, ${d.ky.toFixed(5)}); }`;
			}
			return win + '}' + img + '}';
		}
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

		// The resting cell is always the normal 4:5 grid slot — that's the concept:
		// the hero IS a project in the grid. The landscape variant only changes the
		// opening frame and how the image is cropped on the way down.
		const cellW = heroEl.offsetWidth;
		const cellH = cellW * 1.25;
		mainEl.style.paddingTop = `${SCROLL_RANGE + (vh - cellH) / 2}px`;

		// offset-based measurement: immune to any transform currently applied
		const mainRect = mainEl.getBoundingClientRect();
		const docTop = mainRect.top + window.scrollY + heroEl.offsetTop;
		const cellLeft = mainRect.left + heroEl.offsetLeft;

		// Opening frame, centred in the viewport so the wordmark sits over it. Two
		// independent axes:
		//   orientation — landscape (3:2) or portrait (4:5)
		//   size        — full (fills the viewport: width for landscape, height for
		//                 portrait) or smaller (an inset, framed print)
		const openAspect = heroLandscape ? HERO_WIDE_ASPECT : 4 / 5;
		let startW: number;
		let startH: number;

		if (lab.heroInset) {
			// Smaller "framed print" opening — a centred image, the full composition
			// visible, that docks into the grid cell. The size slider is a fraction of
			// the full opening: a share of width for landscape, of height for portrait.
			if (heroLandscape) {
				startW = vw * (lab.heroInsetScale / 100);
				startH = startW / openAspect;
			} else {
				startH = vh * (lab.heroInsetScale / 100);
				startW = startH * openAspect;
			}

			// Never taller than the viewport.
			if (startH > vh * 0.92) {
				startH = vh * 0.92;
				startW = startH * openAspect;
			}

			// Desktop chrome keeps the wordmark vertically centred at the left edge,
			// so a centred inset can march straight into it. Cap the width to leave a
			// gutter past the logo — and symmetrically past the nav — so the framed
			// image always floats clear while staying centred. (Mainly bites the wide
			// landscape opening; the narrow portrait one rarely reaches the gutter.)
			// Below 768 the chrome pins to the top, needing vertical not horizontal
			// room, which the centred vertical position already provides — so skip it.
			if (vw > 768) {
				const markEl = document.querySelector('.wordmark');
				const markRight = markEl ? markEl.getBoundingClientRect().right : 176;
				const maxW = vw - 2 * (markRight + LOGO_CLEARANCE);
				if (startW > maxW) {
					startW = Math.max(maxW, vw * 0.3);
					startH = startW / openAspect;
				}
			}
		} else if (heroLandscape) {
			// Full landscape: the window is the whole viewport; the 3:2 image
			// cover-crops to fill it (you see a slice).
			startW = vw;
			startH = vw <= 768 ? Math.min(vh * 0.55, vw / openAspect) : vh;
		} else {
			// Full portrait: 4:5 at 100vh on desktop, 55vh on mobile.
			startH = vw <= 768 ? vh * 0.55 : vh;
			startW = startH * openAspect;
		}
		const startTop = (vh - startH) / 2 - docTop;
		raf = { cellLeft, cellW, cellH, startW, startH, startLeft: (vw - startW) / 2, startTop };

		// Crop-morph elements only exist in the landscape variant's DOM.
		cropEl = heroEl.querySelector<HTMLElement>('.crop');
		wideImgEl = cropEl?.querySelector<HTMLElement>('img') ?? null;

		// Prefer the compositor-thread scroll-timeline; rAF fallback writes the
		// transform directly where it isn't supported.
		if (supportsScrollTimeline) {
			if (!styleEl) {
				styleEl = document.createElement('style');
				document.head.appendChild(styleEl);
			}
			styleEl.textContent = buildKeyframes();
			if (heroLandscape && cropEl && wideImgEl) {
				// The cell itself stays static; the window + image pair animates.
				// Clear any portrait animation the cell carried before the flip.
				heroEl.style.animation = '';
				heroEl.style.transform = '';
				heroEl.style.removeProperty('animation-timeline');
				heroEl.style.removeProperty('animation-range');
				const layers: Array<[HTMLElement, string]> = [
					[cropEl, 'hero-dock-win'],
					[wideImgEl, 'hero-dock-img']
				];
				for (const [el, name] of layers) {
					el.style.transform = '';
					el.style.animation = `${name} 1ms linear both`;
					el.style.setProperty('animation-timeline', 'scroll(root block)');
					el.style.setProperty('animation-range', `0px ${SCROLL_RANGE}px`);
				}
			} else {
				heroEl.style.transform = '';
				heroEl.style.transformOrigin = 'top left';
				heroEl.style.animation = 'hero-dock 1ms linear both';
				heroEl.style.setProperty('animation-timeline', 'scroll(root block)');
				heroEl.style.setProperty('animation-range', `0px ${SCROLL_RANGE}px`);
			}
		} else {
			heroEl.style.transformOrigin = 'top left';
			applyFrame(window.scrollY);
		}
	}

	function applyFrame(y: number) {
		if (!heroEl || !raf) return;
		const p = Math.min(Math.max(y / SCROLL_RANGE, 0), 1);
		if (heroLandscape) {
			if (!cropEl || !wideImgEl) return;
			if (p >= 1) {
				cropEl.style.transform = '';
				wideImgEl.style.transform = '';
				return;
			}
			const d = landscapeDelta(p);
			cropEl.style.transform = `translate(${d.dx}px, ${d.dy}px) scale(${d.sx}, ${d.sy})`;
			wideImgEl.style.transform = `translate(${d.tx}px, ${d.ty}px) scale(${d.kx}, ${d.ky})`;
			// Radius is left to the .crop's static CSS (renders scaled during the morph,
			// exact 4px at the docked scale of 1) — never written per-frame, see buildKeyframes.
			return;
		}
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
		progress = Math.min(window.scrollY / SCROLL_RANGE, 1);

		// Fallback browsers (no scroll-timeline, e.g. Safari < 26): write the hero
		// transform synchronously too — a style write inside the scroll handler
		// renders this same frame. Deferring it to the rAF below paints one frame
		// late, which reads as the hero swimming behind the page while you scroll.
		// (Transform writes don't invalidate layout, so the rect read below stays cheap.)
		if (!supportsScrollTimeline && !reduceMotion) {
			applyFrame(window.scrollY);
		}

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
		// re-measure the dock when the hero opening changes shape/size
		void heroLandscape;
		void lab.heroInset;
		void lab.heroInsetScale;
		layout();
		onScroll();
		const onResize = () => layout();
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	// A grid-spacing change resizes the hero's cell, so the dock keyframes (built
	// from the cell's width/position) have to be rebuilt — otherwise the hero docks
	// to the previous cell. The spacing is applied to the document root by the
	// layout component's own effect; await tick() so that flush has landed and the
	// cell has its new size before we re-measure (reading it synchronously here
	// would race and capture the old geometry). tick() also covers a stored
	// non-default preset on first mount, where the same ordering applies.
	$effect(() => {
		void lab.gridPreset;
		tick().then(layout);
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
		<button class="nav-link" class:selected={progress >= 1} onclick={() => window.scrollTo({ top: SCROLL_RANGE, behavior: 'smooth' })}>Selected</button><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link">Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link" class:selected={isAbout}>About</a>
	</div>
</nav>

<MobileMenu bind:open={menuOpen} />

<main bind:this={mainEl}>
	<CatalogueGrid
		projects={gridProjects}
		{heroSlug}
		{revealed}
		{docked}
		{heroRadiusFactor}
		heroLandscape={heroLandscape}
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
