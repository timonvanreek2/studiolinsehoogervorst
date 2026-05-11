<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();
	let project = $derived(data.project);

	let images = $derived.by(() => {
		const urls: string[] = [];
		if (project.image) urls.push(project.image);
		if (project.gallery) {
			for (const g of project.gallery) {
				if (g.url !== project.image && !urls.includes(g.url)) {
					urls.push(g.url);
				}
			}
		}
		return urls;
	});

	let startIndex = $derived(parseInt(page.url.searchParams.get('img') || '0', 10));
	let currentIndex = $state(0);
	let track: HTMLDivElement;

	$effect(() => {
		currentIndex = Math.min(startIndex, images.length - 1);
	});

	$effect(() => {
		if (!track) return;
		const slide = track.children[currentIndex] as HTMLElement;
		if (slide) {
			slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
		}
	});

	function next() {
		if (images.length > 0) currentIndex = (currentIndex + 1) % images.length;
	}

	function prev() {
		if (images.length > 0) currentIndex = (currentIndex - 1 + images.length) % images.length;
	}

	let infoOpen = $state(false);
	let descriptionEl = $state<HTMLElement | null>(null);

	function toggleInfo() {
		infoOpen = !infoOpen;
		if (infoOpen) {
			requestAnimationFrame(() => {
				descriptionEl?.scrollIntoView({ behavior: 'smooth' });
			});
		}
	}

	function close() {
		history.back();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') { close(); return; }
		if (e.key === 'ArrowRight') next();
		if (e.key === 'ArrowLeft') prev();
	}
</script>

<svelte:window onkeydown={handleKeydown} />
<svelte:head>
	<title>{project.title} — Studio Linse Hoogervorst</title>
</svelte:head>

<div class="modal" class:info-open={infoOpen}>

	<!-- Horizontal image strip -->
	<div class="image-area">
		{#if images.length > 1}
			<button class="nav-prev" onclick={prev} aria-label="Previous"></button>
			<button class="nav-next" onclick={next} aria-label="Next"></button>
		{/if}

		<div class="track" bind:this={track}>
			{#each images as url, i}
				<div class="slide" class:active={i === currentIndex}>
					<img
						src="{url}?w=2400&auto=format&q=85"
						alt={project.title}
						loading={Math.abs(i - currentIndex) < 3 ? 'eager' : 'lazy'}
					/>
				</div>
			{/each}
		</div>
	</div>

	<!-- Info bar -->
	<div class="info-bar">
		<div class="info-left">
			<span class="info-title">{project.title}</span>
			<span class="info-location">{project.location}</span>
		</div>
		<div class="info-right">
			{#if project.category}<span class="info-category">{project.category}</span>{/if}
			{#if project.completion}<span>(  {project.completion}  )</span>{/if}
			<span class="info-counter">{currentIndex + 1} / {images.length}</span>
			{#if project.description?.length}
				<button class="info-btn" onclick={toggleInfo}>{infoOpen ? 'Close' : 'Info'}</button>
			{/if}
		</div>
	</div>

	<!-- Description panel -->
	{#if infoOpen && project.description?.length}
		<div class="description-panel" bind:this={descriptionEl}>
			<div class="description-content">
				<div class="description-meta">
					<span class="info-title">{project.title}</span>
					<span class="info-location">{project.location}</span>
					{#if project.category}<span class="info-category">{project.category}</span>{/if}
					{#if project.completion}<span>(  {project.completion}  )</span>{/if}
				</div>
				<div class="description-text">
					{#each project.description as paragraph}
						<p>{paragraph}</p>
					{/each}
				</div>
			</div>
		</div>
	{/if}

	<button class="close-btn" onclick={close}>Close</button>
</div>

<style>
	.modal {
		position: fixed;
		inset: 0;
		background: #fff;
		z-index: 200;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.modal.info-open {
		overflow-y: auto;
	}

	.modal.info-open .image-area {
		flex-shrink: 0;
	}

	.close-btn {
		position: fixed;
		top: 12px;
		right: 16px;
		z-index: 210;
		background: none;
		border: none;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 14px;
		color: var(--color-primary);
		cursor: pointer;
		padding: 4px 0;
		transition: opacity 0.15s;
	}

	.close-btn:hover {
		opacity: 0.5;
	}

	/* Image area */
	.image-area {
		flex: 1;
		position: relative;
		overflow: hidden;
		padding-top: 48px;
	}

	.track {
		display: flex;
		align-items: center;
		gap: 16px;
		height: 100%;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		padding: 0 16px;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	.slide {
		flex-shrink: 0;
		height: 100%;
		display: flex;
		align-items: center;
		scroll-snap-align: center;
	}

	.slide img {
		max-height: 100%;
		width: auto;
		object-fit: contain;
	}

	.nav-prev,
	.nav-next {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 50%;
		background: none;
		border: none;
		z-index: 1;
	}

	.nav-prev {
		left: 0;
		cursor: w-resize;
	}

	.nav-next {
		right: 0;
		cursor: e-resize;
	}

	/* Info bar */
	.info-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 12px;
		line-height: 16px;
		color: var(--color-primary);
		flex-shrink: 0;
	}

	.info-left,
	.info-right {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.info-location,
	.info-counter {
		color: var(--color-muted);
	}

	.info-category {
		text-transform: capitalize;
	}

	.info-btn {
		background: none;
		border: none;
		font: inherit;
		color: var(--color-primary);
		cursor: pointer;
		padding: 0;
		transition: opacity 0.15s;
	}

	.info-btn:hover {
		opacity: 0.5;
	}

	.description-panel {
		flex-shrink: 0;
		padding: 60px 16px 120px;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 14px;
		line-height: 1.5;
		color: var(--color-primary);
	}

	.description-content {
		max-width: 640px;
	}

	.description-meta {
		display: flex;
		gap: 16px;
		margin-bottom: 40px;
		font-size: 12px;
		line-height: 16px;
	}

	.description-text p {
		margin: 0;
	}

	.description-text p + p {
		margin-top: 1em;
	}

	@media (max-width: 768px) {
		.track {
			padding: 0;
			gap: 0;
		}

		.slide {
			width: 100vw;
			justify-content: center;
		}

		.slide img {
			width: 100%;
			max-height: 100%;
			object-fit: contain;
		}

		.info-bar {
			padding: 12px 8px;
		}

		.info-location,
		.info-category {
			display: none;
		}

		.info-right {
			gap: 8px;
		}

		.description-panel {
			padding: 40px 8px 80px;
		}

		.description-meta {
			flex-direction: column;
			gap: 4px;
		}
	}
</style>
