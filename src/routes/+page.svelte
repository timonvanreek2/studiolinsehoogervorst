<script lang="ts">
	import type { Project } from '$lib/types';

	let { data } = $props();
</script>

<svelte:head>
	<title>Studio Linse Hoogervorst</title>
</svelte:head>

<main>
	<!-- Hero colophon -->
	<section class="hero">
		<div class="hero-text">
			<p class="hero-name">Studio Linse Hoogervorst</p>
			<p>"Practice for interior architecture"</p>
			<p>Founded by Paul Linse</p>
			<p><span class="uppercase">Amsterdam</span>, since 1993</p>
		</div>
	</section>

	<!-- Project strips -->
	{#each data.featuredProjects as project (project.slug)}
		{@const images = project.gallery?.length ? project.gallery : []}
		<section class="project-section">
			<div class="image-strip">
				{#each images.slice(0, 6) as img, i}
					<a href="/projects/{project.slug}?img={i}" class="image-cell">
						<img
							src="{img.url}?w=600&auto=format&q=80"
							alt=""
							loading="lazy"
						/>
					</a>
				{/each}
			</div>
			<a href="/projects/{project.slug}" class="strip-meta">
				<div class="meta-left">
					<span class="meta-title">{project.title}</span>
					<span class="meta-location">{project.location}</span>
				</div>
				<div class="meta-right">
					<span>{project.category}</span>
					<span class="meta-year">(  {project.completion || '—'}  )</span>
					<span>→</span>
				</div>
			</a>
		</section>
	{/each}
</main>

<style>
	/* Hero */
	.hero {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		color: var(--color-primary);
	}

	.hero-text {
		text-align: center;
		font-family: var(--font-serif);
		font-size: 24px;
		line-height: 30px;
	}

	.hero-text p {
		margin: 0;
	}

	.hero-name {
		text-transform: uppercase;
	}

	.uppercase {
		text-transform: uppercase;
	}

	/* Project sections */
	.project-section {
		margin-bottom: 150px;
	}

	.image-strip {
		display: flex;
		gap: 16px;
		align-items: flex-start;
		padding: 0 16px;
	}

	.image-cell {
		flex: 1 0 0;
		min-width: 0;
		display: block;
		cursor: pointer;
	}

	.image-cell img {
		width: 100%;
		height: auto;
		display: block;
		object-fit: cover;
		transition: opacity 0.15s;
	}

	.image-cell:hover img {
		opacity: 0.7;
	}

	.strip-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 16px;
		color: var(--color-primary);
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 12px;
		line-height: 16px;
		transition: opacity 0.15s;
	}

	.strip-meta:hover {
		opacity: 0.5;
	}

	.meta-left {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 553px;
		flex-shrink: 0;
	}

	.meta-title {
		flex: 1 0 0;
		min-width: 0;
	}

	.meta-location {
		white-space: nowrap;
		flex-shrink: 0;
	}

	.meta-right {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 270px;
		flex-shrink: 0;
		text-align: right;
		justify-content: flex-end;
	}

	.meta-year {
		white-space: pre;
	}

	@media (max-width: 768px) {
		.hero-text {
			font-size: 20px;
			line-height: 26px;
			padding: 0 16px;
		}

		.image-strip {
			gap: 8px;
		}

		.project-section {
			margin-bottom: 80px;
		}

		.meta-left {
			width: auto;
			flex: 1;
		}

		.meta-right {
			display: none;
		}

		.strip-meta {
			font-size: 11px;
		}
	}
</style>
