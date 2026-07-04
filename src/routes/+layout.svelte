<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import Monogram from '$lib/components/Monogram.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LabPanel from '$lib/components/LabPanel.svelte';
	import { lab, SPACING_PRESETS } from '$lib/lab.svelte';

	let { children, data } = $props();
	let isToolPage = $derived(page.url.pathname.startsWith('/tools/'));
	let isRichon = $derived(page.url.pathname.startsWith('/richon'));
	let isStudio = $derived(page.url.pathname.startsWith('/studio'));
	let isV2 = $derived(page.url.pathname.startsWith('/v2'));
	let isHome = $derived(page.url.pathname === '/');
	let showChrome = $derived(!isToolPage && !isRichon && !isStudio && !isV2);

	let path = $derived(page.url.pathname);
	let isSelected = $derived(path === '/');
	let isIndex = $derived(path.startsWith('/projects'));
	let isAbout = $derived(path.startsWith('/about'));

	let isProjectsIndex = $derived(path === '/projects');
	let showNav = $derived(showChrome && !isHome && !isAbout && !isProjectsIndex);

	let menuOpen = $state(false);

	// ─── Design Lab wiring (dev/preview scaffolding — gated, removable) ───
	// A ?lab URL flag opens the panel (shareable preview link).
	$effect(() => {
		if (page.url.searchParams.has('lab')) {
			lab.enabled = true;
			lab.collapsed = false;
		}
	});

	// Variants that apply at the document root: theme, caption gap, grid spacing.
	$effect(() => {
		if (!browser) return;
		const root = document.documentElement;
		if (lab.dark) root.setAttribute('data-theme', 'dark');
		else root.removeAttribute('data-theme');
		const sp = SPACING_PRESETS[lab.gridPreset] ?? SPACING_PRESETS.default;
		root.style.setProperty('--lab-col-gap', `${sp.col}px`);
		root.style.setProperty('--lab-row-gap', `${sp.row}px`);
		root.style.setProperty('--lab-grid-padding', `${sp.padding}px`);
	});

	// Shift+L toggles the panel from anywhere.
	$effect(() => {
		if (!browser) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.shiftKey && (e.key === 'L' || e.key === 'l')) {
				lab.enabled = !lab.enabled;
				// Turning the lab on always brings up the full panel, never the
				// stranded pill — collapse is only reachable via the × button.
				if (lab.enabled) lab.collapsed = false;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

{#if showNav}
	<nav class="site-nav" class:open={menuOpen}>
		<button class="menu-toggle" onclick={() => (menuOpen = !menuOpen)}>
			{menuOpen ? 'Close' : 'Menu'}
		</button>
		<div class="nav-links">
			<a href="/" class="nav-link" class:selected={isSelected} onclick={() => (menuOpen = false)}>Selected</a><span
				class="sep">,&nbsp;</span
			><a href="/projects" class="nav-link" class:selected={isIndex} onclick={() => (menuOpen = false)}>Index</a><span
				class="sep">,&nbsp;</span
			><a href="/about" class="nav-link" class:selected={isAbout} onclick={() => (menuOpen = false)}>About</a>
		</div>
	</nav>
{/if}

<div class="page-shell">
	{#if showNav}
		<Monogram />
	{/if}
	{@render children()}
</div>

{#if showChrome}
	<Footer studio={data.studio} />
{/if}

<LabPanel />

<style>
	.page-shell {
		position: relative;
	}

	.site-nav {
		position: fixed;
		top: 8px;
		left: 8px;
		z-index: 100;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		color: var(--color-primary);
	}

	.nav-link.selected {
		font-style: italic;
	}

	.nav-link {
		transition: opacity 0.15s;
	}

	.nav-link:hover {
		opacity: 0.5;
	}

	.sep {
		font-style: normal;
	}

	.menu-toggle {
		display: none;
	}

	@media (max-width: 768px) {
		.site-nav {
			left: 8px;
			font-size: 13px;
		}

		.menu-toggle {
			display: block;
			background: none;
			border: none;
			padding: 0;
			font-family: var(--font-sans);
			font-size: 13px;
			font-weight: 550;
			color: var(--color-primary);
			cursor: pointer;
			line-height: 1;
		}

		.nav-links {
			display: none;
		}

		.site-nav.open .menu-toggle {
			margin-bottom: 12px;
		}

		.site-nav.open .nav-links {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.site-nav.open .sep {
			display: none;
		}
	}
</style>
