<script lang="ts">
	import { browser } from '$app/environment';
	import { isLandscape } from '$lib/utils/gallery';
	import ProjectList from '$lib/components/ProjectList.svelte';

	let { data } = $props();

	let metaOffset = $state(0);
	let featuredPassed = $state(false);
	let metaReleased = $state(false);
	let featuredWrapperEl = $state<HTMLElement | null>(null);
	let activeSectionIndex = $state(0);

	let activeProject = $derived(
		activeSectionIndex > 0 ? data.featuredProjects[activeSectionIndex - 1] : null
	);

	$effect(() => {
		if (!browser || !featuredWrapperEl) return;
		function onScroll() {
			const rect = featuredWrapperEl!.getBoundingClientRect();
			metaReleased = rect.bottom <= window.innerHeight;
			featuredPassed = rect.bottom <= 0;
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
		return () => window.removeEventListener('scroll', onScroll);
	});

	function trackSection(node: HTMLElement, index: number) {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) activeSectionIndex = index;
			},
			{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
		);
		observer.observe(node);
		return { destroy() { observer.disconnect(); } };
	}

	const positions = [
		'flush-left',
		'center-right',
		'center',
		'flush-right',
		'center-left',
		'center'
	];

	function getPositionStyle(pos: string, landscape: boolean): string {
		if (landscape) return '';
		switch (pos) {
			case 'flush-left': return 'left: 0;';
			case 'flush-right': return 'right: 0;';
			case 'center-left': return 'left: 35%; transform: translateX(-50%);';
			case 'center-right': return 'left: 65%; transform: translateX(-50%);';
			default: return 'left: 50%; transform: translateX(-50%);';
		}
	}
</script>

<svelte:head>
	<title>Studio Linse Hoogervorst</title>
</svelte:head>

<main>
	<div class="featured-wrapper" bind:this={featuredWrapperEl}>
		{#if !featuredPassed}
		<div
			class="meta-bar"
			class:released={metaReleased}
			style={metaReleased ? '' : `position: fixed; top: 50%; transform: translateY(calc(-50% + ${metaOffset}px));`}
		>
			{#if activeProject}
				<div class="meta-half">
					<span class="meta-title">{activeProject.title}</span>
					<span class="meta-location">{activeProject.location}</span>
				</div>
				<div class="meta-half">
					<span class="meta-category">{activeProject.category}</span>
					<span class="meta-year">( {activeProject.completion || '—'} )</span>
				</div>
			{:else}
				<div class="meta-half">
					<span>Spaces honouring their context</span>
				</div>
				<div class="meta-half">
					<span>Concerned with atmosphere, proportion and materiality</span>
				</div>
			{/if}
		</div>
		{/if}
		<!-- Intro image -->
		<section use:trackSection={0}>
			<div class="hero-slide">
				<img
					src="/intro.jpg"
					alt="Studio Linse Hoogervorst"
					class="gallery-image"
					style="left: 50%; transform: translateX(-50%);"
				/>
			</div>
		</section>

		<!-- Featured projects as full-viewport images -->
		{#each data.featuredProjects as project, projectIndex (project.slug)}
			<section id="project-{project.slug}" data-slug={project.slug} use:trackSection={projectIndex + 1}>
				{#if project.image}
					{@const landscape = isLandscape(project.image)}
					{@const portraitPos = positions[projectIndex % positions.length]}
					<a
						href="/v2/projects/{project.slug}"
						class="project-image-link hero-slide"
						data-cursor-label={project.title}
					>
						<img
							src="{project.image}?w=2000&auto=format&q=85"
							alt={project.title}
							class="gallery-image"
							class:landscape
							class:portrait={!landscape}
							style={getPositionStyle(portraitPos, landscape)}
							loading="lazy"
						/>
					</a>
				{/if}
			</section>
		{/each}
	</div>

	<!-- Inline index -->
	<div id="index" class="index-inline">
		<ProjectList
			projects={data.allProjects}
			featuredSlugs={data.featuredProjects.map(p => p.slug)}
			showPreview={featuredPassed}
		/>
	</div>
</main>

<style>
	.meta-bar {
		position: fixed;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
		font-family: var(--font-meta);
		font-size: 14px;
		font-weight: 500;
		line-height: 16px;
		white-space: nowrap;
		color: #fff;
		mix-blend-mode: exclusion;
		z-index: 10;
		pointer-events: none;
	}

	.meta-half {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.meta-title {
		width: 380px;
		flex-shrink: 0;
	}

	.meta-category {
		text-transform: capitalize;
	}

	.meta-year {
		text-align: right;
		width: 140px;
		flex-shrink: 0;
	}

	.featured-wrapper {
		position: relative;
	}

	.meta-bar.released {
		position: absolute;
		bottom: 50vh;
		left: 0;
		right: 0;
	}

	.hero-slide {
		height: 100dvh;
		width: 100%;
		position: relative;
		overflow: hidden;
	}

	.gallery-image {
		position: absolute;
		height: 100%;
		object-fit: cover;
	}

	.gallery-image.landscape {
		width: 100%;
		left: 0;
	}

	.gallery-image.portrait {
		width: auto;
	}

	.project-image-link {
		display: block;
		cursor: pointer;
	}

	.index-inline {
		padding: 50vh 8px 50vh;
	}

	@media (max-width: 768px) {
		.gallery-image.portrait {
			width: 100%;
			left: 0 !important;
			transform: none !important;
			right: auto !important;
		}

		.meta-bar {
			font-size: 14px;
		}

		.meta-title {
			width: auto;
		}

		.meta-location,
		.meta-category {
			display: none;
		}

		.meta-year {
			width: auto;
		}
	}
</style>
