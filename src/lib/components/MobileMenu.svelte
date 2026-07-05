<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import Wordmark from './Wordmark.svelte';

	// Bindable so each page keeps owning the open/closed state next to its own
	// Menu toggle; this component only renders the open overlay.
	let { open = $bindable(false) }: { open?: boolean } = $props();

	let path = $derived(page.url.pathname);

	const links = [
		{ href: '/', label: 'Selected', match: (p: string) => p === '/' },
		{ href: '/projects', label: 'Index', match: (p: string) => p.startsWith('/projects') },
		{ href: '/about', label: 'About', match: (p: string) => p.startsWith('/about') }
	];

	function close() {
		open = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}

	// Lock the page behind the overlay while it's open.
	$effect(() => {
		if (!open) return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});
</script>

<svelte:window onkeydown={onKeydown} />

{#if open}
	<!-- A solid, theme-coloured panel; Close stays top-right where the Menu toggle
	     was, and the navigation is centred in the viewport. -->
	<div
		class="menu-overlay"
		role="dialog"
		aria-modal="true"
		aria-label="Menu"
		transition:fade={{ duration: 260, easing: cubicOut }}
	>
		<a href="/" class="menu-logo" aria-label="Studio Linse Hoogervorst" onclick={close}>
			<Wordmark progress={0} />
		</a>
		<button class="menu-close" onclick={close}>Close</button>
		<nav class="menu-links">
			{#each links as link}
				<a
					href={link.href}
					class="menu-link"
					class:current={link.match(path)}
					onclick={close}
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</div>
{/if}

<style>
	.menu-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		/* Solid, theme-coloured panel — flips with light/dark via the token. */
		background: var(--color-bg);
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		color: var(--color-primary);
	}

	/* Logo top-left, mirroring the page header; a home link that closes the menu.
	   Plain currentColor here — no exclusion blend, since the ground is a known
	   solid colour. */
	.menu-logo {
		position: absolute;
		top: 16px;
		left: 16px;
		display: flex;
		color: var(--color-primary);
		--mark-w: 140px;
		--mark-h: 54px;
	}

	/* Close stays top-right, exactly where the Menu toggle was. */
	.menu-close {
		position: absolute;
		top: 16px;
		right: 16px;
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
	}

	/* Links in a centred row across the middle of the viewport. */
	.menu-links {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 28px;
	}

	.menu-link {
		color: inherit;
		transition: opacity 0.15s ease-out;
	}

	.menu-link.current {
		font-style: italic;
	}

	@media (hover: hover) {
		.menu-link:hover {
			opacity: 0.5;
		}
	}
</style>
