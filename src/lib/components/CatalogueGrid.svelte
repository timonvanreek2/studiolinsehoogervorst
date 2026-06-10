<script lang="ts">
	import type { Project } from '$lib/types';
	import { fadeIn } from '$lib/actions/inview';

	let {
		projects,
		heroSlug = undefined,
		onHeroEl = undefined,
		revealed = true,
		docked = true
	}: {
		projects: Project[];
		heroSlug?: string;
		onHeroEl?: (el: HTMLElement | null) => void;
		revealed?: boolean;
		docked?: boolean;
	} = $props();

	function staggerMs(index: number): number {
		const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
		const rand = x - Math.floor(x);
		return Math.round(rand * 400);
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
	};

	let cells = $derived.by(() => {
		return projects
			.map((project) => {
				const url = project.image || project.gallery?.[0]?.url;
				return url ? ({ project, url } as Cell) : null;
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
	style:--cols={3}
	style:--col-gap="160px"
	style:--row-gap="160px"
	style:--padding="180px"
	style:--aspect="4 / 5"
	style:--label-size="13px"
	style:--label-color="#000000"
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
			<img
				class="cover"
				src={isHero ? heroSrc(cell.url) : cellSrc(cell.url)}
				srcset={isHero ? heroSrcset(cell.url) : cellSrcset(cell.url)}
				sizes={isHero
					? '100vw'
					: '(max-width: 768px) 48vw, (max-width: 1024px) 45vw, 26vw'}
				alt={cell.project.title}
				loading={i < 6 || isHero ? 'eager' : 'lazy'}
				fetchpriority={isHero ? 'high' : undefined}
			/>
			<div class="label">{cell.project.title}</div>
		</a>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--cols), 1fr);
		column-gap: var(--col-gap);
		row-gap: var(--row-gap);
		padding: 0 var(--padding);
		align-items: start;
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

	.label {
		margin-top: 6px;
		font-family: var(--font-sans);
		font-size: var(--label-size);
		font-weight: 550;
		line-height: 17px;
		color: var(--label-color);
		text-align: center;
		opacity: 0;
		transition: opacity 0.2s ease-out;
	}

	@media (hover: hover) and (pointer: fine) {
		.cell:hover .label {
			opacity: 1;
		}
	}

	/* Touch devices have no hover: titles are always present. */
	@media (hover: none) {
		.label {
			opacity: 1;
		}
	}

	@media (max-width: 1024px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
			column-gap: 40px;
			row-gap: 60px;
			padding: 0 40px;
		}
	}

	@media (max-width: 768px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
			column-gap: 8px;
			row-gap: 40px;
			padding: 0 8px;
		}
	}
</style>
