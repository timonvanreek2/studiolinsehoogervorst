<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Index — Studio Linse Hoogervorst</title>
</svelte:head>

<main class="index-page">
	<h1 class="index-heading">Index</h1>

	<div class="project-list">
		{#each data.projects as project (project.slug)}
			<a href="/projects/{project.slug}" class="project-row">
				<span class="project-title">{project.title}</span>
				<span class="project-location">{project.location}</span>
				<span class="project-category">{project.category}</span>
				<span class="project-year">{project.completion || '—'}</span>
			</a>
		{/each}
	</div>
</main>

<style>
	.index-page {
		padding: 120px 32px 160px;
		max-width: 1000px;
		margin: 0 auto;
	}

	.index-heading {
		font-family: var(--font-serif);
		font-size: 28px;
		margin-bottom: 80px;
	}

	.project-list {
		display: flex;
		flex-direction: column;
	}

	.project-row {
		display: flex;
		align-items: baseline;
		padding: 12px 0;
		border-top: 1px solid var(--color-structural);
		font-family: var(--font-serif);
		font-size: 15px;
		transition: opacity 0.15s;
	}

	.project-row:last-child {
		border-bottom: 1px solid var(--color-structural);
	}

	.project-row:hover {
		opacity: 0.5;
	}

	.project-title {
		flex: 2;
		min-width: 0;
	}

	.project-location {
		flex: 1.5;
		min-width: 0;
		color: var(--color-muted);
	}

	.project-category {
		flex: 1;
		min-width: 0;
		color: var(--color-muted);
		text-transform: capitalize;
	}

	.project-year {
		width: 80px;
		flex-shrink: 0;
		text-align: right;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--color-muted);
	}

	@media (max-width: 768px) {
		.index-page {
			padding: 100px 16px 100px;
		}

		.index-heading {
			font-size: 22px;
			margin-bottom: 48px;
		}

		.project-row {
			flex-wrap: wrap;
			gap: 2px;
			padding: 14px 0;
		}

		.project-title {
			width: 100%;
			flex: none;
		}

		.project-location,
		.project-category {
			font-size: 13px;
		}

		.project-year {
			width: auto;
		}
	}
</style>
