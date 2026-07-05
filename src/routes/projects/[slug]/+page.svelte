<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';

	let { data } = $props();
	let project = $derived(data.project);

	let categoryLabel = $derived(
		project.category
			? project.category.replace('-', ' & ').replace(/\b\w/g, (c) => c.toUpperCase())
			: ''
	);

	let aspectByUrl = $derived.by(() => {
		const m = new Map<string, number>();
		for (const g of project.gallery ?? []) {
			if (g.url && g.aspectRatio) m.set(g.url, g.aspectRatio);
		}
		return m;
	});

	// ─── Detail gallery ─────────────────────────────────────────────────────────
	// The flat gallery, in order, with each image's aspect ratio resolved. This is
	// the raw material the framed spread is composed from.
	type ScrollImg = { url: string; aspect: number; isAccent: boolean };
	// Editor-flagged accent images (Sanity "Show as small accent"), by url.
	let accentByUrl = $derived.by(() => {
		const s = new Set<string>();
		for (const g of project.gallery ?? []) {
			if (g.url && g.isAccent) s.add(g.url);
		}
		return s;
	});
	let scrollImages = $derived.by<ScrollImg[]>(() => {
		const urls: string[] = [];
		if (project.image) urls.push(project.image);
		for (const g of project.gallery ?? []) {
			if (g.url && !urls.includes(g.url)) urls.push(g.url);
		}
		return urls.map((url) => ({ url, aspect: aspectByUrl.get(url) ?? 1.5, isAccent: accentByUrl.has(url) }));
	});

	// The page opens landscape: move the first landscape image to the front so it
	// becomes the top-right hero.
	let framedImages = $derived.by<ScrollImg[]>(() => {
		const imgs = scrollImages;
		if (imgs.length < 2) return imgs;
		const wantPortrait = false;
		const idx = imgs.findIndex(
			(im) => !im.isAccent && (wantPortrait ? im.aspect <= 1.05 : im.aspect > 1.05)
		);
		if (idx <= 0) return imgs; // already first, or none of that orientation
		const rest = imgs.slice();
		const [opener] = rest.splice(idx, 1);
		return [opener, ...rest];
	});


	type FrPlace = 'hero' | 'left' | 'mid' | 'right' | 'full';
	type FrBand = { img: ScrollImg; place: FrPlace; accent?: ScrollImg; accentSide?: 'left' | 'right' };

	// Stable per-project seed (a small string hash) so each project gets a distinct
	// but fixed composition — no reshuffle on reload, no two projects alike.
	function frSeed(s: string): number {
		let h = 0;
		for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
		return Math.abs(h);
	}

	// The air side beside a flush 2/5 column (opposite the image), or null for mid / full
	// bands, which have no clear single-side air to host a floating accent.
	function frAirSide(place: FrPlace): 'left' | 'right' | null {
		if (place === 'left') return 'right';
		if (place === 'right') return 'left';
		return null;
	}

	// Editorial row grid, per the Figma. Fixed-height rows abut top-to-bottom with no gap
	// and no overlap; images bleed to the viewport edges (only the text is inset). The
	// hero opens 3/5 right with the copy low-left. After it, WIDE frames run full-bleed
	// and everything else takes a 2/5 column that cycles position — left · mid · right —
	// for restrained variety. The first image always docks flush left, directly under the
	// copy. A per-project seed offsets the column cycle so no two projects open alike.
	//
	// Accents (small floating detail images): editor-flagged ones (Sanity "Show as small
	// accent"), else one seed-picked image, float in the CLEAR air beside a flush left /
	// right column — never over another image.
	let framedBands = $derived.by<FrBand[]>(() => {
		const all = framedImages;
		if (!all.length) return [];
		const seed = frSeed(project.title ?? 'studio-linse');

		const flagged = all.slice(1).filter((im) => im.isAccent);
		const useFlagged = flagged.length > 0;
		const accentQueue = useFlagged ? flagged.slice() : [];
		const flow = useFlagged ? all.slice(1).filter((im) => !im.isAccent) : all.slice(1);

		const bands: FrBand[] = [{ img: all[0], place: 'hero' }];
		const cols: FrPlace[] = ['left', 'mid', 'right'];

		// A 2/5 column position, seed-shuffled per image, that (a) never repeats the
		// previous column — so equal-width frames never stack edge-aligned — and (b) never
		// completes a monotonic unit step (left→mid→right or its reverse), which is the
		// diagonal staircase we're breaking up. What's left reads scattered.
		let prevCol: FrPlace | null = null;
		let prevPrevCol: FrPlace | null = null;
		const order: Record<string, number> = { left: 0, mid: 1, right: 2 };
		const pickCol = (idx: number): FrPlace => {
			let cands = cols.filter((c) => c !== prevCol);
			if (prevCol && prevPrevCol) {
				const step = order[prevCol] - order[prevPrevCol];
				if (step === 1 || step === -1) {
					cands = cands.filter((c) => order[c] - order[prevCol as string] !== step);
				}
			}
			if (!cands.length) cands = cols.filter((c) => c !== prevCol);
			// Prefer a column unused in the last two picks, so we rotate through all three
			// rather than oscillating between two.
			const fresh = cands.filter((c) => c !== prevPrevCol);
			const pool = fresh.length ? fresh : cands;
			const c = pool[frSeed(`${project.title ?? ''}#${idx}`) % pool.length];
			prevPrevCol = prevCol;
			prevCol = c;
			return c;
		};

		// Seed auto-accent (fallback): float one flow image beside a flush side column.
		const accentAt = 1 + (seed % 3);
		let sideN = 0;
		let autoPlaced = false;
		let prevFull = false;

		let i = 0;
		while (i < flow.length) {
			const img = flow[i];
			let place: FrPlace;
			if (bands.length === 1) {
				// First image sits directly under the hero copy: always the flush-left column.
				place = 'left';
				prevCol = 'left';
				prevPrevCol = null;
			} else if (img.aspect >= 1.4 && !prevFull) {
				// Wide frame runs full-bleed — but never two full rows in a row.
				place = 'full';
			} else {
				// A 2/5 column: naturally narrow frames, plus any wide frame demoted to
				// avoid stacking two fulls (cropping it into a column is fine).
				place = pickCol(i);
			}
			prevFull = place === 'full';
			// A full row breaks the column run — the next column starts fresh.
			if (place === 'full') { prevCol = null; prevPrevCol = null; }

			const band: FrBand = { img, place };
			i++;

			const side = frAirSide(place); // non-null only for flush left / right columns
			if (useFlagged) {
				if (side && accentQueue.length) {
					band.accent = accentQueue.shift();
					band.accentSide = side;
				}
			} else if (side) {
				sideN++;
				if (!autoPlaced && sideN === accentAt && i < flow.length) {
					band.accent = flow[i];
					band.accentSide = side;
					i++;
					autoPlaced = true;
				}
			}
			bands.push(band);
		}
		return bands;
	});

	let hasInternalReferrer = false;

	afterNavigate((navigation) => {
		if (navigation.from) hasInternalReferrer = true;
	});

	function close() {
		if (hasInternalReferrer) history.back();
		else goto('/');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') { close(); return; }
	}
</script>

<svelte:window onkeydown={handleKeydown} />
<svelte:head>
	<title>{project.title} — Studio Linse Hoogervorst</title>
	<meta property="og:title" content="{project.title} — Studio Linse Hoogervorst" />
	{#if project.location}<meta property="og:description" content="{project.location}" />{/if}
	{#if project.image}<meta property="og:image" content="{project.image}" />{/if}
</svelte:head>

<h1 class="sr-only">{project.title} — Studio Linse Hoogervorst</h1>

	<!-- Framed: asymmetric editorial spread (per the Figma). Fixed meta bar on top
	     (mix-blend, reads over photo or white). You open on a hero docked top-right
	     (landscape 3/5 or portrait 2/5 per the sub-variant) with the project copy
	     bottom-left of that first screen; images then run a varied left / full /
	     centre / right rhythm, cover-cropped, with one small floating accent. -->
	<div class="fr">
		<div class="fr-bar">
			<div class="meta-group">
				<span class="meta-title">{project.title}</span>
				{#if project.location}<span class="meta-detail">{project.location}</span>{/if}
			</div>
			<div class="meta-group">
				{#if project.category}
					<span class="meta-title">{categoryLabel}</span>
				{/if}
				{#if project.completion}<span class="meta-detail">Completed in {project.completion}</span>{/if}
			</div>
			<div class="meta-group">
				{#if project.photographer}
					<span class="meta-title">Photography by</span>
					<span class="meta-detail">{project.photographer}</span>
				{/if}
			</div>
			<div class="meta-group right">
				<button class="fr-close" onclick={close}>Close</button>
			</div>
		</div>

		<div class="fr-grid">
			{#each framedBands as band, b}
				<div
					class="fr-band fr-{band.place}"
					class:hero-wide={band.place === 'hero'}
					class:fr-wide={band.img.aspect > 1.2}
					class:mobile-inset={b > 0 && band.place !== 'full' && (b - 1) % 4 === 0}
				>
					<div class="fr-cell">
						<img
							class="fr-img"
							src="{band.img.url}?w=2000&auto=format&q=85"
							srcset="{band.img.url}?w=1000&auto=format&q=85 1000w, {band.img.url}?w=1600&auto=format&q=85 1600w, {band.img.url}?w=2000&auto=format&q=85 2000w"
							sizes="100vw"
							alt="{project.title} — image {b + 1}"
							loading={b < 2 ? 'eager' : 'lazy'}
							style="aspect-ratio: {band.img.aspect};"
						/>
					</div>
					{#if band.accent}
						<div class="fr-accent fr-accent--{band.accentSide ?? 'right'}">
							<img
								class="fr-img"
								src="{band.accent.url}?w=900&auto=format&q=85"
								srcset="{band.accent.url}?w=500&auto=format&q=85 500w, {band.accent.url}?w=900&auto=format&q=85 900w"
								sizes="20vw"
								alt="{project.title} — detail"
								loading="lazy"
							/>
						</div>
					{/if}
					{#if band.place === 'hero' && project.description?.length}
						<div class="fr-copy">
							{#each project.description as paragraph}<p>{paragraph}</p>{/each}
							<div class="fr-copy-meta">
								{#if project.category}
									<p><span>{categoryLabel}</span>{#if project.completion}<span>Completed in {project.completion}</span>{/if}</p>
								{/if}
								{#if project.photographer}
									<p><span>Photography by</span><span>{project.photographer}</span></p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>

<style>
	/* ─── Detail page (framed spread) ───────────────────────────────────────────
	   Asymmetric editorial spread (per the Figma). A fixed meta bar tops a scrolling
	   stack of near-viewport-tall BANDS; within each band one image is placed by width
	   bucket (2/5 · 3/5 · full) and alignment (left / centre / right / hero-right), the
	   rest of the band left white as air. The hero band carries the project copy
	   bottom-left and may carry a small floating accent image. */
	.fr {
		position: fixed;
		inset: 0;
		z-index: 200;
		background: var(--color-bg);
		overflow-y: auto;
		overflow-x: hidden;
		-webkit-overflow-scrolling: touch;
		font-family: var(--font-sans);
		--fr-edge: 16px;
		/* Row height tracks viewport WIDTH, not height, so every image keeps a consistent
		   crop aspect as the screen narrows (2/5 column ≈ 0.72, matching the Figma's
		   576×800). 55.5vw = 800 ÷ 1440. Capped at 92vh so a row never outgrows the
		   viewport on wide, short screens. */
		--fr-rh: min(55.5vw, 92vh);
		/* Snap to whole pixels so stacked full-bleed images meet on an integer boundary —
		   a fractional height leaves a 1px rasterised seam. Progressive: browsers without
		   round() keep the plain value above. */
		--fr-rh: min(round(55.5vw, 1px), 92vh);
	}

	/* Top meta bar. Fixed across the top; mix-blend keeps it legible whether a
	   white margin or a dark photo sits behind it. */
	.fr-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 220;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 16px var(--fr-edge);
		font-size: 12px;
		font-weight: 500;
		line-height: 1.42;
		mix-blend-mode: exclusion;
		color: #fff;
		pointer-events: none;
	}
	.fr-bar .meta-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}
	.fr-bar .meta-group.right {
		/* Shrink the Close button to its label and pin it to the column's right edge —
		   otherwise the flex column stretches it full-width and the label centres. */
		align-items: flex-end;
		text-align: right;
	}
	.fr-bar .meta-title {
		font-weight: 550;
	}
	.fr-close {
		pointer-events: auto;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		transition: opacity 0.15s;
	}
	.fr-close:hover {
		opacity: 0.6;
	}

	/* Image bands scroll up the page. Each band is a near-viewport-tall row; the image
	   sits in a cell whose WIDTH and horizontal alignment compose the asymmetry. The
	   empty part of each band stays white — that air is the design. */
	.fr-grid {
		position: relative;
	}
	.fr-band {
		position: relative;
		width: 100%;
		height: var(--fr-rh);
		display: flex;
		/* No background: the .fr container is already white, and an opaque band would
		   paint a white line across the previous image when the two overlap (below). */
	}
	/* Overlap each band 1px into the one above so vertically-flush images always share
	   a covered edge — kills the hairline the browser rasterises at the seam on
	   fractional scroll offsets / HiDPI, which integer band heights alone don't. The
	   later band paints over the join; transparent bands keep the whitespace intact. */
	.fr-band + .fr-band {
		margin-top: -1px;
	}
	.fr-cell {
		height: 100%;
		overflow: hidden;
	}
	/* Column widths, per the Figma. Hero docks right (3/5 landscape, else 2/5 portrait);
	   body images take a 2/5 column at one of three positions — flush left, mid (left
	   edge at 40%), flush right — and full bleeds the whole width. Images bleed to the
	   viewport edges; only the text (meta / copy) is inset. */
	.fr-hero .fr-cell {
		width: 40%;
		margin-left: auto;
	}
	.fr-hero.hero-wide .fr-cell {
		width: 60%;
	}
	.fr-left .fr-cell {
		width: 40%;
		margin-right: auto;
	}
	.fr-right .fr-cell {
		width: 40%;
		margin-left: auto;
	}
	.fr-mid .fr-cell {
		width: 40%;
		margin-left: 40%;
	}
	.fr-full .fr-cell {
		width: 100%;
	}
	.fr-img {
		display: block;
		width: 100%;
		height: 100%;
		max-width: none;
		object-fit: cover;
		border-radius: 0;
	}

	/* Small floating detail accent — overlaps the air beside a side image (Figma:
	   242×336 at 63% / 27% of an 800-tall band). */
	.fr-accent {
		position: absolute;
		top: 27%;
		width: 17%;
		height: 42%;
		overflow: hidden;
		z-index: 3;
	}
	.fr-accent--right {
		left: 63%;
	}
	.fr-accent--left {
		left: 20%;
	}

	/* Project copy — bottom-left of the FIRST screen only (it scrolls away with the
	   hero band). Small sans, matching the meta bar, per the Figma. */
	.fr-copy {
		position: absolute;
		left: var(--fr-edge);
		bottom: 16px;
		z-index: 4;
		width: clamp(280px, 38%, 552px);
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 12px;
		line-height: 1.42;
		color: var(--color-primary);
	}
	.fr-copy p {
		margin: 0;
	}
	.fr-copy p + p {
		margin-top: 1em;
	}
	/* Category / photography meta — desktop keeps these in the fixed top bar, so the
	   in-copy version only appears at the mobile breakpoint below. */
	.fr-copy-meta {
		display: none;
	}

	@media (max-width: 768px) {
		/* Phones follow the mobile Figma (node 371-38): a full-bleed hero opens the page
		   with the title + Close overlaid on it; the description and project meta sit
		   below on white; the gallery then runs as a calm, generously spaced rhythm of
		   full-bleed and centred inset prints. */

		/* Title + Close overlaid on the hero (absolute, scrolls away with it). Keeps the
		   desktop exclusion blend + white so it inverts over the photo. Category and
		   photographer drop out here — they reappear below the copy. */
		.fr-bar {
			position: absolute;
			padding: 12px;
		}
		.fr-bar .meta-group:nth-child(2),
		.fr-bar .meta-group:nth-child(3) {
			display: none;
		}
		.fr-bar .meta-group:first-child {
			flex: 1 1 auto;
		}
		.fr-bar .meta-group.right {
			flex: 0 0 auto;
		}

		/* Bands flow in normal document order, no overlap, generous air between every
		   image (the desktop -1px seam overlap is undone). */
		.fr-band {
			height: auto;
			display: block;
			margin: 0;
		}
		.fr-band + .fr-band {
			margin-top: 104px;
		}

		/* Hero: full-bleed, cover-cropped to a tall opening frame; copy follows below. */
		.fr-band.fr-hero {
			display: flex;
			flex-direction: column;
			margin-top: 0;
		}
		.fr-hero .fr-cell,
		.fr-hero.hero-wide .fr-cell,
		.fr-hero.fr-wide .fr-cell {
			width: 100%;
			margin: 0;
			height: auto;
			aspect-ratio: 402 / 560;
		}
		.fr-copy {
			position: static;
			order: 0;
			width: auto;
			margin: 28px 12px 0;
		}
		.fr-copy-meta {
			display: block;
			margin-top: 32px;
		}
		.fr-copy-meta p {
			margin: 0;
		}
		.fr-copy-meta p + p {
			margin-top: 20px;
		}
		.fr-copy-meta span {
			display: block;
		}

		/* Gallery beats: every image runs full-bleed at its natural height — portrait
		   frames included, so they read tall and immersive rather than boxed. A centred
		   inset print punctuates the rhythm (the opener + every fourth beat), and the
		   small accents float between, so it's not an unbroken wall of full frames. */
		.fr-full .fr-cell,
		.fr-left .fr-cell,
		.fr-mid .fr-cell,
		.fr-right .fr-cell {
			width: 100%;
			margin: 0;
			height: auto;
		}
		.fr-full .fr-img,
		.fr-left .fr-img,
		.fr-mid .fr-img,
		.fr-right .fr-img {
			height: auto;
		}
		.fr-band.mobile-inset .fr-cell {
			width: 70%;
			margin: 0 auto;
			height: auto;
			aspect-ratio: 282 / 390;
		}
		.fr-band.mobile-inset .fr-img {
			height: 100%;
		}

		/* Accents: small centred prints, their own beat below the band image. */
		.fr-accent {
			position: static;
			width: 43%;
			height: auto;
			aspect-ratio: 174 / 242;
			margin: 104px auto 0;
		}
		.fr-accent--left,
		.fr-accent--right {
			margin-left: auto;
			margin-right: auto;
		}
	}


	.meta-group {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.meta-group.right {
		text-align: right;
	}

	.meta-title {
		font-weight: 550;
	}

	.meta-detail {
		font-weight: 500;
	}

</style>
