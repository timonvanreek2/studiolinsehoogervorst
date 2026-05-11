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

	$effect(() => {
		currentIndex = Math.min(startIndex, images.length - 1);
	});
</script>

<svelte:head>
	<title>{project.title} — Studio Linse Hoogervorst</title>
</svelte:head>

<main class="detail">
	<!-- Left: thumbnails -->
	<div class="sidebar">
		<div class="thumb-list">
			{#each images as url, i}
				<button
					class="thumb"
					class:active={i === currentIndex}
					onclick={() => currentIndex = i}
				>
					<img src="{url}?w=200&auto=format&q=60" alt="" />
					<span class="thumb-num">[{String(i + 1).padStart(2, '0')}]</span>
				</button>
			{/each}
		</div>
	</div>

	<!-- Right: large image -->
	<div class="viewer">
		{#if images[currentIndex]}
			<img
				src="{images[currentIndex]}?w=2000&auto=format&q=85"
				alt={project.title}
			/>
		{/if}

		<div class="viewer-meta">
			<span>{project.title}, {project.completion || ''}</span>
		</div>
	</div>
</main>

<style>
	.detail {
		display: flex;
		height: calc(100vh - 80px);
		padding: 0 32px;
		gap: 24px;
	}

	/* Sidebar */
	.sidebar {
		width: 260px;
		flex-shrink: 0;
		overflow-y: auto;
		padding: 8px 0;
		scrollbar-width: none;
	}

	.sidebar::-webkit-scrollbar {
		display: none;
	}

	.thumb-list {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
	}

	.thumb {
		border: none;
		padding: 0;
		background: none;
		cursor: pointer;
		opacity: 0.3;
		transition: opacity 0.15s;
		text-align: left;
	}

	.thumb.active {
		opacity: 1;
	}

	.thumb:hover {
		opacity: 0.7;
	}

	.thumb img {
		width: 100%;
		height: auto;
		display: block;
	}

	.thumb-num {
		display: block;
		margin-top: 3px;
		font-family: var(--font-serif);
		font-size: 9px;
		color: #bbb;
	}

	/* Viewer */
	.viewer {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.viewer img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.viewer-meta {
		position: absolute;
		bottom: 12px;
		right: 0;
		font-family: var(--font-serif);
		font-size: 12px;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		color: #999;
	}

	@media (max-width: 768px) {
		.detail {
			flex-direction: column;
			height: auto;
			padding: 0 16px;
			gap: 16px;
		}

		.sidebar {
			width: 100%;
			max-height: 200px;
		}

		.thumb-list {
			grid-template-columns: repeat(5, 1fr);
		}

		.viewer {
			min-height: 50vh;
		}
	}
</style>
