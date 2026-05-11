<script lang="ts">
	import type { Project } from '$lib/types';
	import { setActiveView } from '$lib/stores/nav.svelte';

	let { projects }: { projects: Project[] } = $props();

	let hoveredSlug = $state<string | null>(null);
	let mouseY = $state(0);

	function handleHover(slug: string, e: MouseEvent) {
		hoveredSlug = slug;
		mouseY = e.clientY;
	}

	function handleMove(e: MouseEvent) {
		mouseY = e.clientY;
	}

	function handleClick(slug: string) {
		setActiveView('selected');
		requestAnimationFrame(() => {
			const el = document.getElementById(`project-${slug}`);
			if (el) el.scrollIntoView({ behavior: 'smooth' });
		});
	}
</script>

<table class="w-full border-collapse">
	<tbody>
		{#each projects as project}
			<tr
				class="border-b border-[color:var(--color-structural)] cursor-pointer group"
				onmouseenter={(e) => handleHover(project.slug, e)}
				onmousemove={handleMove}
				onmouseleave={() => hoveredSlug = null}
				onclick={() => handleClick(project.slug)}
			>
				<td class="py-3 pr-6 font-mono text-[12px] text-[color:var(--color-muted)] w-16">
					{project.completion || '—'}
				</td>
				<td class="py-3 pr-6 font-sans text-[14px] uppercase tracking-slightly-tight group-hover:opacity-60 transition-opacity duration-200">
					{project.title}
				</td>
				<td class="py-3 pr-6 font-sans text-[14px] italic max-md:hidden">
					{project.location}
				</td>
				<td class="py-3 font-mono text-[12px] uppercase text-[color:var(--color-muted)] max-md:hidden">
					{project.category}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<!-- Hover thumbnail -->
{#if hoveredSlug}
	{@const project = projects.find(p => p.slug === hoveredSlug)}
	{#if project?.image}
		<div
			class="fixed right-8 pointer-events-none z-20"
			style="top: {mouseY - 91}px"
		>
			<img
				src="{project.image}?w=400&auto=format&q=80"
				alt={project.title}
				class="h-[183px] w-auto block"
			/>
		</div>
	{/if}
{/if}
