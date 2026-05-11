<script lang="ts">
	let { data } = $props();

	let allItems = $derived.by(() => {
		const items: { url: string; slug: string; index: number; title: string; year: string; isFirst: boolean; num: number }[] = [];
		for (const p of data.projects) {
			const imgs: string[] = [];
			if (p.image) imgs.push(p.image);
			if (p.gallery) {
				for (const g of p.gallery) {
					if (!imgs.includes(g.url)) imgs.push(g.url);
				}
			}
			const count = Math.min(imgs.length, 4);
			for (let i = 0; i < count; i++) {
				items.push({
					url: imgs[i],
					slug: p.slug,
					index: i,
					title: p.title,
					year: p.completion || '',
					isFirst: i === 0,
					num: i + 1
				});
			}
		}
		return items;
	});

	let totalCount = $derived(allItems.length);
</script>

<svelte:head>
	<title>Index [{totalCount}] — Studio Linse Hoogervorst</title>
</svelte:head>

<main class="index-page">
	<div class="grid">
		{#each allItems as item, i (item.url + i)}
			<a href="/richon/{item.slug}?img={item.index}" class="grid-cell">
				<img
					src="{item.url}?w=400&auto=format&q=70"
					alt=""
					loading="lazy"
				/>
				{#if item.isFirst}
					<span class="cell-label">{item.title}, {item.year}</span>
				{:else}
					<span class="cell-num">{String(item.num).padStart(2, '0')}</span>
				{/if}
			</a>
		{/each}
	</div>
</main>

<style>
	.index-page {
		padding: 8px 32px 80px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 70px 40px;
	}

	.grid-cell {
		display: block;
	}

	.grid-cell img {
		width: 100%;
		height: auto;
		display: block;
	}

	.grid-cell:hover img {
		opacity: 0.7;
		transition: opacity 0.15s;
	}

	.cell-label {
		display: block;
		margin-top: 6px;
		font-family: var(--font-serif);
		font-size: 11px;
		font-style: italic;
		color: #999;
	}

	.cell-num {
		display: block;
		margin-top: 6px;
		font-family: var(--font-serif);
		font-size: 10px;
		color: #bbb;
	}

	@media (max-width: 1024px) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
			gap: 40px 20px;
		}
	}

	@media (max-width: 768px) {
		.index-page {
			padding: 8px 16px 60px;
		}

		.grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 32px 12px;
		}
	}
</style>
