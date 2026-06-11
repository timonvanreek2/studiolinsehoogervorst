<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate, goto } from '$app/navigation';

	let { data } = $props();
	let project = $derived(data.project);

	type Slide = { kind: 'image'; url: string } | { kind: 'description' };

	let slides = $derived.by(() => {
		const result: Slide[] = [];
		const urls: string[] = [];
		if (project.image) urls.push(project.image);
		if (project.gallery) {
			for (const g of project.gallery) {
				if (g.url !== project.image && !urls.includes(g.url)) {
					urls.push(g.url);
				}
			}
		}
		if (urls.length > 0) result.push({ kind: 'image', url: urls[0] });
		if (project.description?.length) result.push({ kind: 'description' });
		for (let i = 1; i < urls.length; i++) {
			result.push({ kind: 'image', url: urls[i] });
		}
		return result;
	});

	let currentIndex = $state(0);

	$effect(() => {
		const start = parseInt(page.url.searchParams.get('img') || '0', 10);
		currentIndex = Math.min(start, slides.length - 1);
	});

	function next() {
		if (slides.length > 0) currentIndex = (currentIndex + 1) % slides.length;
	}

	function prev() {
		if (slides.length > 0) currentIndex = (currentIndex - 1 + slides.length) % slides.length;
	}

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
		if (e.key === 'ArrowRight') next();
		if (e.key === 'ArrowLeft') prev();
	}

	let cursorSide = $state<'left' | 'right' | null>(null);

	function handleMouseMove(e: MouseEvent) {
		cursorSide = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
	}

	function handleClick(e: MouseEvent) {
		if (justSwiped) return;
		const el = e.target as HTMLElement;
		if (el.closest('button, a')) return;
		if (e.clientX < window.innerWidth / 2) prev();
		else next();
	}

	// Touch swipe: a gesture trigger only — the crossfade design doesn't translate,
	// so we never drag the slide with the finger.
	let isDragging = false;
	let dragPointerId: number | null = null;
	let dragStartX = 0;
	let dragStartY = 0;
	let dragStartTime = 0;
	let dragLastX = 0;
	let dragLastY = 0;
	let justSwiped = false;

	function handlePointerDown(e: PointerEvent) {
		if (e.pointerType !== 'touch') return;
		if (isDragging) return; // ignore additional touch points
		isDragging = true;
		dragPointerId = e.pointerId;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		dragLastX = e.clientX;
		dragLastY = e.clientY;
		dragStartTime = e.timeStamp;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging || e.pointerId !== dragPointerId) return;
		dragLastX = e.clientX;
		dragLastY = e.clientY;
	}

	function handlePointerUp(e: PointerEvent) {
		if (!isDragging || e.pointerId !== dragPointerId) return;
		isDragging = false;
		dragPointerId = null;
		const deltaX = dragLastX - dragStartX;
		const deltaY = dragLastY - dragStartY;
		if (Math.abs(deltaX) <= Math.abs(deltaY)) return; // horizontal must dominate
		const elapsedMs = e.timeStamp - dragStartTime;
		const velocity = elapsedMs > 0 ? Math.abs(deltaX) / elapsedMs : 0;
		if (Math.abs(deltaX) >= 60 || velocity > 0.11) {
			justSwiped = true;
			if (deltaX < 0) next();
			else prev();
			setTimeout(() => {
				justSwiped = false;
			}, 0);
		}
	}

	function handlePointerCancel(e: PointerEvent) {
		if (e.pointerId !== dragPointerId) return;
		isDragging = false;
		dragPointerId = null;
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

<div
	class="detail-page"
	class:cursor-left={cursorSide === 'left'}
	class:cursor-right={cursorSide === 'right'}
	onmousemove={handleMouseMove}
	onclick={handleClick}
	role="presentation"
>
	<div class="top-bar">
		<div class="meta-group">
			<span class="meta-title">{project.title}</span>
			{#if project.location}<span class="meta-detail">{project.location}</span>{/if}
		</div>
		<div class="meta-group">
			{#if project.category}
				<span class="meta-title">{project.category.replace('-', ' & ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
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
			<button class="close-btn" onclick={close}>Close</button>
		</div>
	</div>

	<div
		class="image-area"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerCancel}
		role="presentation"
	>
		{#each slides as slide, i}
			{#if slide.kind === 'image'}
				<img
					class="gallery-img"
					class:active={i === currentIndex}
					src="{slide.url}?w=2400&auto=format&q=85"
					srcset="{slide.url}?w=800&auto=format&q=85 800w, {slide.url}?w=1600&auto=format&q=85 1600w, {slide.url}?w=2400&auto=format&q=85 2400w"
					sizes="(max-width: 768px) calc(100vw - 16px), (max-width: 1024px) calc(100vw - 80px), calc(100vw - 360px)"
					alt="{project.title} — image {i + 1}"
					loading={Math.abs(i - currentIndex) < 3 ? 'eager' : 'lazy'}
				/>
			{:else}
				<div class="description-slide" class:active={i === currentIndex}>
					{#each project.description as paragraph}
						<p>{paragraph}</p>
					{/each}
					<!-- On mobile the top bar is collapsed to title + Close, so the full
					     project meta lives here, beside the text that gives it context. -->
					<dl class="slide-meta">
						{#if project.location}
							<div><dt>Location</dt><dd>{project.location}</dd></div>
						{/if}
						{#if project.category}
							<div><dt>Type</dt><dd>{project.category.replace('-', ' & ').replace(/\b\w/g, (c) => c.toUpperCase())}</dd></div>
						{/if}
						{#if project.completion}
							<div><dt>Completed</dt><dd>{project.completion}</dd></div>
						{/if}
						{#if project.photographer}
							<div><dt>Photography</dt><dd>{project.photographer}</dd></div>
						{/if}
					</dl>
				</div>
			{/if}
		{/each}
	</div>

	<div class="counter" aria-live="polite">{currentIndex + 1} / {slides.length}</div>

	<button class="nav-btn nav-btn--prev" aria-label="Previous image" onclick={prev}>‹</button>
	<button class="nav-btn nav-btn--next" aria-label="Next image" onclick={next}>›</button>
</div>

<style>
	.detail-page {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 200;
		overflow: hidden;
	}

	.detail-page.cursor-left {
		cursor: w-resize;
	}

	.detail-page.cursor-right {
		cursor: e-resize;
	}

	.top-bar {
		position: relative;
		z-index: 10;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 16px 16px 12px;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
		line-height: 1.4;
		color: var(--color-primary);
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

	.close-btn {
		background: none;
		border: none;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		color: var(--color-primary);
		cursor: pointer;
		padding: 0;
		transition: opacity 0.15s;
		line-height: 1.4;
		text-align: right;
	}

	.close-btn:hover {
		opacity: 0.5;
	}

	.image-area {
		position: absolute;
		inset: 0;
		margin: 0 180px;
		overflow: hidden;
		touch-action: pan-y;
	}

	.gallery-img {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		transform: translateY(-50%);
		width: 100%;
		max-height: 80vh;
		object-fit: contain;
		opacity: 0;
		transition: opacity 0.15s ease-out;
	}

	.gallery-img.active {
		opacity: 1;
		transition: opacity 0.25s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.description-slide {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100%;
		max-width: 480px;
		opacity: 0;
		transition: opacity 0.15s ease-out;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
		line-height: 1.6;
		color: var(--color-primary);
	}

	.description-slide.active {
		opacity: 1;
		transition: opacity 0.25s cubic-bezier(0.23, 1, 0.32, 1);
	}

	.description-slide p {
		margin: 0;
	}

	.description-slide p + p {
		margin-top: 0.3em;
	}

	/* The full meta block only surfaces on mobile, where the top bar is collapsed. */
	.slide-meta {
		display: none;
	}

	.counter {
		position: absolute;
		bottom: 16px;
		right: 16px;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 500;
		color: var(--color-muted, #999);
	}

	@media (max-width: 1024px) {
		.image-area {
			margin: 0 40px;
		}
	}

	@media (max-width: 768px) {
		/* Collapse the top bar to a single line — just the title and Close. The
		   rest of the meta moves onto the description slide. */
		.top-bar {
			display: flex;
			align-items: baseline;
			justify-content: space-between;
			padding: 16px;
		}

		.meta-group:nth-child(2),
		.meta-group:nth-child(3) {
			display: none;
		}

		/* Only the title survives in group 1 — drop the location line. */
		.meta-group:first-child .meta-detail {
			display: none;
		}

		.image-area {
			margin: 0 16px;
		}

		/* Reveal the spec list under the description text. */
		.slide-meta {
			display: flex;
			flex-direction: column;
			gap: 4px;
			margin-top: 28px;
		}

		.slide-meta div {
			display: flex;
			justify-content: space-between;
			gap: 24px;
		}

		.slide-meta dt {
			color: var(--color-muted);
		}

		.slide-meta dd {
			margin: 0;
			text-align: right;
		}
	}

	/* Prev/next nav buttons — visually hidden but fully focusable.
	   They surface for keyboard users and screen readers while leaving
	   the mouse-click-zone design entirely intact. */
	.nav-btn {
		position: absolute;
		bottom: 16px;
		width: 1px;
		height: 1px;
		padding: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
		border: 0;
		background: none;
		cursor: pointer;
	}

	.nav-btn--prev {
		left: 16px;
	}

	.nav-btn--next {
		right: 48px;
	}

	.nav-btn:focus-visible {
		/* Expand to a visible, tappable target on focus */
		width: auto;
		height: auto;
		clip: auto;
		overflow: visible;
		white-space: normal;
		padding: 4px 8px;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		color: var(--color-primary);
		outline: 1px solid currentColor;
		outline-offset: 2px;
		border-radius: 2px;
	}

	@media (prefers-reduced-motion: reduce) {
		.gallery-img,
		.gallery-img.active,
		.description-slide,
		.description-slide.active {
			transition: opacity 0.1s ease;
		}
	}
</style>
