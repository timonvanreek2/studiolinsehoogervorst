<script lang="ts">
	import type { Project } from '$lib/types';
	import { fadeIn, revealOnLoad } from '$lib/actions/inview';


	let {
		projects,
		heroSlug = undefined,
		onHeroEl = undefined,
		revealed = true,
		docked = true,
		heroRadiusFactor = undefined,
		heroLandscape = false
	}: {
		projects: Project[];
		heroSlug?: string;
		onHeroEl?: (el: HTMLElement | null) => void;
		revealed?: boolean;
		docked?: boolean;
		// Lab variant: the hero opens as a full-screen landscape image whose
		// visible window crops down into this same 4:5 cell as it docks. The cell
		// keeps its normal grid slot — only the opening treatment changes. The
		// page animates the .crop window and the wide img inside it.
		heroLandscape?: boolean;
		// Corner-radius multiplier for the docking hero only, 0 → 1. While the hero
		// is blown up full-screen it reads as a sharp full-bleed image (0); it rides
		// to 1× the site-wide --img-radius as it locks into the grid. Expressed as a
		// factor (not px) so the resting hero always matches the global token exactly.
		// undefined → fall back to the global image radius (like every other image).
		heroRadiusFactor?: number;
	} = $props();

	function staggerMs(index: number): number {
		const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
		const rand = x - Math.floor(x);
		return Math.round(rand * 400);
	}

	// Caption shows the city only — the part before the first comma ("Amsterdam, The
	// Netherlands" → "Amsterdam"; a bare "London" stays "London").
	function cityOf(location: string | undefined): string {
		return (location ?? '').split(',')[0].trim();
	}

	function cellSrc(url: string): string {
		if (!url.includes('cdn.sanity.io')) return url;
		return `${url}?w=800&auto=format&q=85`;
	}

	function cellSrcset(url: string): string | undefined {
		if (!url.includes('cdn.sanity.io')) return undefined;
		return [600, 800, 1200, 1600]
			.map((w) => `${url}?w=${w}&auto=format&q=85 ${w}w`)
			.join(', ');
	}

	function heroSrc(url: string): string {
		if (!url.includes('cdn.sanity.io')) return url;
		return `${url}?w=2400&auto=format&q=85`;
	}

	function heroSrcset(url: string): string | undefined {
		if (!url.includes('cdn.sanity.io')) return undefined;
		return [1200, 1600, 2400]
			.map((w) => `${url}?w=${w}&auto=format&q=85 ${w}w`)
			.join(', ');
	}

	type Cell = {
		project: Project;
		url: string;
		lqip?: string;
	};

	// The LQIP that matches a given cover URL — cover or the gallery entry it came
	// from — so the blur-up placeholder is always the right image, even when the
	// landscape variant swaps in a different gallery asset.
	function lqipFor(project: Project, url: string): string | undefined {
		if (url === project.image) return project.imageLqip;
		return project.gallery?.find((g) => g.url === url)?.lqip ?? project.imageLqip;
	}

	// Sanity CDN filenames embed the asset's pixel size (…-8192x5464.jpg), so an
	// image's aspect is readable straight off its URL — no schema change needed.
	function sanityAspect(url: string): number | null {
		const m = url.match(/-(\d+)x(\d+)\.[a-z]+/i);
		return m ? Number(m[1]) / Number(m[2]) : null;
	}

	// For the full-screen opening, swap the hero's cover image for the most
	// landscape asset the project has (if it has one at all — otherwise keep the
	// usual cover and let the viewport-aspect crop do the work).
	function widestLandscape(project: Project): string | null {
		const candidates = [project.image, ...(project.gallery ?? []).map((g) => g.url)].filter(
			(u): u is string => !!u
		);
		let best: string | null = null;
		let bestAspect = 1.2; // only swap for a genuinely landscape asset
		for (const u of candidates) {
			const a = sanityAspect(u);
			if (a && a > bestAspect) {
				bestAspect = a;
				best = u;
			}
		}
		return best;
	}

	let cells = $derived.by(() => {
		return projects
			.map((project) => {
				let url = project.image || project.gallery?.[0]?.url;
				if (heroLandscape && project.slug === heroSlug) {
					url = widestLandscape(project) ?? url;
				}
				return url ? ({ project, url, lqip: lqipFor(project, url) } as Cell) : null;
			})
			.filter((c): c is Cell => c !== null);
	});

	function heroRef(node: HTMLElement, isHero: boolean) {
		if (isHero) onHeroEl?.(node);
		return {
			update(v: boolean) {
				if (v) onHeroEl?.(node);
			},
			destroy() {
				if (isHero) onHeroEl?.(null);
			}
		};
	}
</script>

<div
	class="grid"
	class:gated={!revealed}
	class:docked
	style:--aspect="4 / 5"
	style:--label-size="13px"
	style:--label-color="var(--color-muted)"
	role="presentation"
>
	{#each cells as cell, i (cell.project.slug)}
		{@const isHero = cell.project.slug === heroSlug}
		<a
			href="/projects/{cell.project.slug}"
			class="cell"
			class:hero-cell={isHero}
			style:--stagger-delay="{staggerMs(i)}ms"
			use:fadeIn
			use:heroRef={isHero}
		>
			{#if isHero && heroLandscape}
				<!-- Crop-morph hero: .crop is the visible window (full screen at the
				     top, this 4:5 cell once docked); the wide img inside counter-scales
				     so the picture never distorts — the framing tightens instead. -->
				<div
					class="crop"
					style:border-radius={heroRadiusFactor !== undefined
						? `calc(var(--img-radius) * ${heroRadiusFactor})`
						: null}
				>
					<img
						class="cover wide"
						src={heroSrc(cell.url)}
						srcset={heroSrcset(cell.url)}
						sizes="100vw"
						alt={cell.project.title}
						loading="eager"
						fetchpriority="high"
					/>
				</div>
			{:else if isHero}
				<!-- Portrait docking hero: loads eager/high-priority and is the LCP, so
				     it gets no blur-up — its corner radius rides the dock instead. -->
				<img
					class="cover"
					src={heroSrc(cell.url)}
					srcset={heroSrcset(cell.url)}
					sizes="100vw"
					alt={cell.project.title}
					loading="eager"
					fetchpriority="high"
					style:border-radius={heroRadiusFactor !== undefined
						? `calc(var(--img-radius) * ${heroRadiusFactor})`
						: null}
				/>
			{:else}
				<!-- Blur-up: the LQIP placeholder fills the frame instantly; the sharp
				     image crossfades over it once decoded (see revealOnLoad), so the cell
				     is never an empty box and the photo never hard-pops. -->
				<div class="frame">
					{#if cell.lqip}
						<img class="ph" src={cell.lqip} alt="" aria-hidden="true" />
					{/if}
					<img
						class="cover"
						src={cellSrc(cell.url)}
						srcset={cellSrcset(cell.url)}
						sizes="(max-width: 768px) 64vw, (max-width: 1024px) 30vw, 26vw"
						alt={cell.project.title}
						loading={i < 6 ? 'eager' : 'lazy'}
						use:revealOnLoad
					/>
				</div>
			{/if}
			<div class="label label--always">
				<span class="label-title">{cell.project.title}</span>
				{#if cell.project.location}<span class="label-loc">{cityOf(cell.project.location)}</span>{/if}
			</div>
		</a>
	{/each}
</div>


<style>
	/* Proportional editorial grid. Inter-column GUTTERS are fractional tracks
	   (column 3.5 : gutter 2) so the rhythm between images scales with their size.
	   The SIDE padding is a floored clamp rather than an fr track: 11.84vw is
	   exactly what a 2.25fr side track resolves to (2.25 / 19fr total), so on wide
	   screens this is pixel-identical to a pure proportional grid — but the 180px
	   floor keeps the rails from starving below ~1520px, where they'd otherwise
	   drop under the mid-height wordmark (left) and nav (right) and let images run
	   beneath them. The ceiling matches the 2.25fr track at the 2400px max-width.
	   row-gap mirrors the column gutter via a vw clamp (row-gap can't be an fr). */
	.grid {
		display: grid;
		grid-template-columns: [c] 3.5fr 2fr [c] 3.5fr 2fr [c] 3.5fr;
		column-gap: 0;
		row-gap: clamp(64px, 10.5vw, 252px);
		padding-inline: clamp(180px, 11.84vw, 284px);
		max-width: 2400px;
		margin-inline: auto;
		align-items: start;
	}
	/* Pin each of the three cells per row to a content track, skipping the
	   gutter tracks (auto-placement alone would fill the gutters too). */
	.cell:nth-child(3n + 1) {
		grid-column: 1;
	}
	.cell:nth-child(3n + 2) {
		grid-column: 3;
	}
	.cell:nth-child(3n + 3) {
		grid-column: 5;
	}

	.cell {
		position: relative;
		z-index: 101;
		display: block;
		min-width: 0;
		opacity: 0;
		transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
		transition-delay: var(--stagger-delay, 0ms);
	}

	.cell:global(.visible) {
		opacity: 1;
	}

	/* The hero cell is the landing image itself: always visible, never gated,
	   transformed from center stage by the page's scroll-driven animation. */
	.cell.hero-cell {
		opacity: 1;
		transition: none;
		z-index: 102;
		will-change: transform;
	}

	/* While the intro is playing, hold neighbours back so the grid
	   materialises around the docking hero instead of underneath it. */
	.grid.gated .cell:not(.hero-cell) {
		opacity: 0;
	}

	.grid.gated .label {
		opacity: 0;
	}

	/* The hero's title may only appear once the image has reached its
	   final scale — never while it is still transforming. */
	.grid:not(.docked) .hero-cell .label {
		opacity: 0;
	}

	.cell img.cover {
		width: 100%;
		aspect-ratio: var(--aspect);
		object-fit: cover;
		display: block;
	}

	/* Blur-up frame (regular grid cells). A fixed --aspect window that clips both
	   the placeholder and the sharp image, so the cell box never depends on the
	   sharp image having loaded — no reflow when it arrives. */
	.frame {
		position: relative;
		width: 100%;
		aspect-ratio: var(--aspect);
		overflow: hidden;
		border-radius: var(--img-radius, 0);
	}

	.frame img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* The LQIP preview, scaled up and blurred. The slight overscale pushes the
	   blur's soft fringe past the clip edge so the frame's borders stay crisp. */
	.frame .ph {
		filter: blur(14px);
		transform: scale(1.08);
	}

	/* Sharp image: starts hidden, crossfades over the placeholder once decoded.
	   A touch slower than UI motion — it suits photography and reads as the image
	   settling rather than snapping. */
	.frame img.cover {
		opacity: 0;
		transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.frame img.cover:global(.loaded) {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.frame img.cover {
			transition-duration: 0.2s;
		}
	}

	/* Crop-morph hero (landscape lab variant). The .crop box sits exactly where
	   a normal hero img would — same 4:5 slot — and clips the wide image inside.
	   Both carry scroll-driven transforms set by the page; transform-origin 0 0
	   matches the keyframe math. */
	.crop {
		position: relative;
		width: 100%;
		aspect-ratio: var(--aspect);
		overflow: hidden;
		border-radius: var(--img-radius, 0);
		transform-origin: 0 0;
		will-change: transform;
	}

	.crop img.cover.wide {
		position: absolute;
		top: 0;
		/* 3:2 box filling the 4:5 window's height: width = (3/2)÷(4/5) = 187.5%
		   of the cell, centred → left = (100% − 187.5%) / 2. Both dimensions are
		   explicit (not aspect-ratio-resolved) because Chrome sizes an abspos img
		   from its natural ratio, not the aspect-ratio property. Keep in sync
		   with HERO_WIDE_ASPECT in the home page. */
		left: -43.75%;
		width: 187.5%;
		/* Tailwind preflight clamps img to max-width: 100% — lift it, this img is
		   meant to overflow its clipping window. */
		max-width: none;
		height: 100%;
		border-radius: 0;
		transform-origin: 0 0;
		will-change: transform;
	}

	.label {
		margin-top: var(--label-gap, 10px);
		font-family: var(--font-sans);
		font-size: var(--label-size);
		font-weight: 550;
		line-height: 17px;
		color: var(--label-color);
		text-align: center;
	}


	/* Always-on caption (lab variant): the title sits flush left, the location flush
	   right, permanently below the image — in the site sans, black, a touch larger
	   than the hover label so it reads as a standing caption rather than a hover hint. */
	.label--always {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 16px;
		margin-top: 10px;
		text-align: left;
		font-size: 12px;
		font-weight: 500;
		color: var(--color-primary);
		opacity: 1;
	}
	/* In the narrow 3-up cells a long title + long location can't share one line.
	   Let the title take the remaining width and wrap; the location keeps its natural
	   width, flush right, aligned to the first line. */
	.label--always .label-title {
		flex: 1 1 auto;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.label--always .label-loc {
		flex: 0 0 auto;
		color: var(--color-muted);
	}


	/* No tablet override: the proportional grid runs the whole desktop→tablet
	   range. The 180px side-padding floor holds the wordmark/nav clear of the
	   images as it narrows (columns get smaller, but the rails never collapse) —
	   the layout stays the editorial triptych down to the single-column switch,
	   never an in-between 2-up. */

	@media (max-width: 768px) {
		/* Single-column editorial feed: one project per row, each image a narrow
		   centred column with generous white space between. The opening hero docks
		   into the top slot of this feed. */
		.grid {
			grid-template-columns: 1fr;
			justify-items: center;
			row-gap: 80px;
			padding: 0 16px;
		}
		/* Drop the desktop track placement so cells stack in the single column. */
		.cell:nth-child(3n + 1),
		.cell:nth-child(3n + 2),
		.cell:nth-child(3n + 3) {
			grid-column: auto;
		}

		.cell {
			width: 64%;
		}

	}
</style>
