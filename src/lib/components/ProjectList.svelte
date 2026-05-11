<script lang="ts">
	import type { Project } from '$lib/types';
	import { isLandscape } from '$lib/utils/gallery';
	import { page } from '$app/state';
	let { projects, featuredSlugs = [], onRowClick, showPreview = true }: {
		projects: Project[];
		featuredSlugs?: string[];
		onRowClick?: () => void;
		showPreview?: boolean;
	} = $props();

	let activeSlug = $state('');
	let activeProject = $derived(projects.find(p => p.slug === activeSlug));
	let isV2 = $derived(page.url.pathname.startsWith('/v2'));
	let projectBase = $derived(isV2 ? '/v2/projects' : '/projects');

	function trackRow(node: HTMLElement, slug: string) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					activeSlug = slug;
				}
			},
			{ rootMargin: '-50% 0px -50% 0px', threshold: 0 }
		);
		observer.observe(node);
		return { destroy() { observer.disconnect(); } };
	}
</script>

<!-- Fixed centered preview image -->
{#if showPreview && activeProject?.image}
	<div class="preview-image">
		{#key activeProject.slug}
			<img
				class="preview-img"
				class:landscape={isLandscape(activeProject.image)}
				class:portrait={!isLandscape(activeProject.image)}
				src="{activeProject.image}?w=600&auto=format&q=80"
				alt={activeProject.title}
			/>
		{/key}
	</div>
{/if}

<div class="project-list">
	{#each projects as project}
		{@const isFeatured = featuredSlugs.includes(project.slug)}
		<a
			href="{projectBase}/{project.slug}"
			class="list-row"
			class:featured={isFeatured}
			class:active={project.slug === activeSlug}
			use:trackRow={project.slug}
			onclick={onRowClick}
		>
			<div class="list-half">
				<span class="list-title">{project.title}</span>
				<span class="list-location">{project.location}</span>
			</div>
			<div class="list-half">
				<span class="list-category">{project.category}</span>
				<span class="list-year">( {project.completion || '—'} )</span>
			</div>
		</a>
	{/each}
</div>

<style>
	.list-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 6px 0;
		font-family: var(--font-meta);
		font-weight: 500;
		font-size: 14px;
		line-height: 16px;
		white-space: nowrap;
		transition: color 0.2s ease;
		color: var(--color-muted);
		cursor: pointer;
	}

	.list-row.active {
		color: var(--color-primary);
	}

	.list-row:hover {
		opacity: 0.6;
	}

	.list-title {
		width: 380px;
		flex-shrink: 0;
	}

	.list-category {
		text-transform: capitalize;
	}

	.list-year {
		text-align: right;
		width: 140px;
		flex-shrink: 0;
	}

	.list-half {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	@media (max-width: 768px) {
		.list-row {
			white-space: normal;
		}

		.list-title {
			width: auto;
		}

		.list-location,
		.list-category {
			display: none;
		}

		.list-year {
			width: auto;
		}

		.preview-image {
			display: none;
		}
	}

	.preview-image {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 0;
		pointer-events: none;
	}

	.preview-image img {
		display: block;
		object-fit: cover;
	}

	.preview-image img.portrait {
		height: 40vh;
		width: auto;
		aspect-ratio: 3 / 4;
	}

	.preview-image img.landscape {
		width: 30vw;
		height: auto;
		aspect-ratio: 4 / 3;
	}

	@media (max-width: 768px) {
		.list-row {
			color: var(--color-primary);
		}

		.list-location, .list-category {
			display: none;
		}

		.list-title {
			width: auto;
			flex: 1;
		}

		.list-year {
			width: auto;
			flex-shrink: 0;
		}

		.preview-image {
			display: none;
		}
	}
</style>
