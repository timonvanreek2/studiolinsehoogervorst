<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

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
	<!-- A frosted white veil washes the page back; navigation stays compact at
	     top-right, exactly where the Menu toggle was. -->
	<div
		class="menu-overlay"
		role="dialog"
		aria-modal="true"
		aria-label="Menu"
		transition:fade={{ duration: 260, easing: cubicOut }}
	>
		<nav class="menu-nav">
			<button class="menu-link menu-close" onclick={close}>Close</button>
			<div class="menu-links">
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
			</div>
		</nav>
	</div>
{/if}

<style>
	.menu-overlay {
		position: fixed;
		inset: 0;
		z-index: 1000;
		/* A flat white wash — the content stays faintly recognisable beneath it,
		   rather than blurred away. */
		background: rgba(255, 255, 255, 0.9);
	}

	.menu-nav {
		position: absolute;
		top: 16px;
		right: 16px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		font-family: var(--font-sans);
		font-size: 13px;
		font-weight: 550;
		line-height: 1;
		color: var(--color-primary);
	}

	/* Close sits where the toggle was; the link group drops below with a gap. */
	.menu-close {
		background: none;
		border: none;
		padding: 0;
		font: inherit;
		color: inherit;
		cursor: pointer;
		margin-bottom: 32px;
	}

	.menu-links {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12px;
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
