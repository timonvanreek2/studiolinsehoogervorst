<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();

	let path = $derived(page.url.pathname);
	let isIndex = $derived(path.startsWith('/projects'));

	/* The datum bar greets you at the top, then steps aside so the
	   full-width table owns the page. Returns when you scroll back. */
	let barHidden = $state(false);

	function onScroll() {
		barHidden = window.scrollY > window.innerHeight * 0.08;
	}

	function cityOnly(location: string): string {
		return location?.split(',')[0].trim() ?? '';
	}

	function formatCategory(cat: string): string {
		return cat?.replace('-', ' & ').replace(/\b\w/g, (c) => c.toUpperCase()) ?? '';
	}
</script>

<svelte:window onscroll={onScroll} />

<svelte:head>
	<title>Index — Studio Linse Hoogervorst</title>
	<meta property="og:title" content="Index — Studio Linse Hoogervorst" />
	<meta property="og:description" content="Selected projects by Studio Linse Hoogervorst." />
</svelte:head>

<h1 class="sr-only">Index — Studio Linse Hoogervorst</h1>

<a href="/" class="wordmark" class:bar-hidden={barHidden}>
	<img src="/wordmark.svg" alt="Studio Linse Hoogervorst" class="wordmark-img" />
</a>

<nav class="fixed-nav" class:bar-hidden={barHidden}>
	<a href="/" class="nav-link">Selected</a><span class="sep">,&nbsp;</span><a href="/projects" class="nav-link" class:selected={isIndex}>Index</a><span class="sep">,&nbsp;</span><a href="/about" class="nav-link">About</a>
</nav>

<main class="index-page">
	<div class="project-list">
		{#each data.projects as project (project.slug)}
			<a href="/projects/{project.slug}" class="list-row">
				<span class="list-title">{project.title}</span>
				<span class="list-location">{cityOnly(project.location)}</span>
				<span class="list-category">{formatCategory(project.category)}</span>
				<span class="list-year">{project.completion || '—'}</span>
			</a>
		{/each}
	</div>
</main>

<style>
	/* Site-wide datum: the bar sits fixed at the viewport's vertical
	   centre, identical to the home page. Here it yields on scroll so the
	   full-width table owns the page. */
	.wordmark {
		position: fixed;
		top: 50%;
		left: 16px;
		transform: translateY(-50%);
		z-index: 200;
		display: flex;
		align-items: center;
		color: #000;
		transition: opacity 0.12s ease-out, visibility 0.12s;
	}

	@supports (mix-blend-mode: exclusion) {
		.wordmark {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.wordmark.bar-hidden,
	.fixed-nav.bar-hidden {
		opacity: 0;
		visibility: hidden;
	}

	.wordmark-img {
		height: 16px;
		width: auto;
		display: block;
	}

	.fixed-nav {
		position: fixed;
		top: 50%;
		right: 16px;
		transform: translateY(-50%);
		z-index: 200;
		display: flex;
		align-items: baseline;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		color: #000;
		transition: opacity 0.12s ease-out, visibility 0.12s;
	}

	@supports (mix-blend-mode: exclusion) {
		.fixed-nav {
			color: #fff;
			mix-blend-mode: exclusion;
		}
	}

	.nav-link {
		color: inherit;
		transition: opacity 0.15s ease-out;
	}

	.nav-link.selected {
		font-style: italic;
	}

	.sep {
		font-style: normal;
	}

	.index-page {
		/* the table starts just below the datum line, so the bar has faded
		   before any row reaches it */
		padding: 60vh 16px 30vh;
	}

	.project-list {
		display: flex;
		flex-direction: column;
	}

	.list-row {
		display: flex;
		align-items: baseline;
		gap: 16px;
		padding: 7px 0;
		font-family: var(--font-sans);
		font-weight: 500;
		font-size: 13px;
		line-height: 1.4;
		color: var(--color-primary);
		transition: opacity 0.15s ease-out;
	}

	.list-row:focus-visible {
		outline: 1px solid currentColor;
		outline-offset: 2px;
	}

	.list-row:focus-visible .list-title {
		font-style: italic;
	}

	@media (hover: hover) and (pointer: fine) {
		.wordmark:hover {
			opacity: 0.5;
		}

		.nav-link:hover {
			opacity: 0.5;
		}

		.list-row:hover .list-title {
			font-style: italic;
		}
	}

	.list-title {
		flex: 1;
		font-weight: 550;
	}

	.list-location {
		width: 160px;
		flex-shrink: 0;
		color: var(--color-muted, #999);
	}

	.list-category {
		width: 160px;
		flex-shrink: 0;
		color: var(--color-muted, #999);
	}

	.list-year {
		width: 60px;
		flex-shrink: 0;
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: var(--color-muted, #999);
	}

	@media (max-width: 768px) {
		.wordmark {
			left: 8px;
		}

		.fixed-nav {
			right: 8px;
		}

		.index-page {
			padding: 60vh 8px 20vh;
		}

		.list-location,
		.list-category {
			display: none;
		}

		.list-year {
			width: auto;
		}
	}
</style>
