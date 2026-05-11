<script lang="ts">
	import { browser } from '$app/environment';

	let { data } = $props();
	let projects = $derived(data.allProjects);
	let currentIndex = $state(0);
	let project = $derived(projects[currentIndex]);
	let heroImage = $derived(project?.image);

	let startX = $state(0);
	let dragging = $state(false);

	function onPointerDown(e: PointerEvent) {
		startX = e.clientX;
		dragging = true;
	}

	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const dx = e.clientX - startX;
		if (Math.abs(dx) < 30) return;
		if (dx < 0) {
			currentIndex = (currentIndex + 1) % projects.length;
		} else {
			currentIndex = (currentIndex - 1 + projects.length) % projects.length;
		}
	}
</script>

<svelte:head>
	<title>Studio Linse Hoogervorst</title>
</svelte:head>

<main class="home">
	<div class="hero">
		{#if heroImage}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="hero-image"
				onpointerdown={onPointerDown}
				onpointerup={onPointerUp}
			>
				<img
					src="{heroImage}?w=1400&auto=format&q=85"
					alt={project.title}
					draggable="false"
				/>
			</div>
		{/if}
		<div class="hero-meta">
			<span>{currentIndex + 1}/{projects.length}</span>
			<span class="hero-title">{project.title} {project.completion || ''}</span>
		</div>
	</div>
</main>

<style>
	.home {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 120px);
		padding: 40px 32px;
	}

	.hero {
		max-width: 500px;
		width: 100%;
	}

	.hero-image {
		cursor: pointer;
		user-select: none;
		touch-action: pan-y;
	}

	.hero-image img {
		width: 100%;
		height: auto;
		pointer-events: none;
	}

	.hero-meta {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding-top: 10px;
		font-family: var(--font-serif);
		font-size: 12px;
		color: #999;
	}

	.hero-title {
		text-transform: uppercase;
		letter-spacing: 0.3px;
	}

	@media (max-width: 768px) {
		.home {
			padding: 40px 16px;
		}

		.hero {
			max-width: 100%;
		}
	}
</style>
