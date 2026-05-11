<script lang="ts">
	import type { YearGroup } from '../../routes/+page.server';
	import { getActiveProject } from '$lib/stores/nav.svelte';

	let { yearGroups }: { yearGroups: YearGroup[] } = $props();

	function scrollToProject(slug: string) {
		const el = document.getElementById(`project-${slug}`);
		if (el) el.scrollIntoView({ behavior: 'smooth' });
	}
</script>

<!-- Desktop: fixed left sidebar -->
<aside class="hidden md:flex fixed top-0 left-0 h-screen w-[50vw] flex-col justify-between p-6 z-10 blend-exclusion pointer-events-none">
	<nav class="flex flex-col gap-6 pointer-events-auto pt-12">
		{#each yearGroups as group}
			<div>
				<span class="text-[color:var(--color-muted)]">({group.year})</span>
				<ul class="mt-1">
					{#each group.projects as project}
						<li>
							<button
								class="uppercase tracking-wide text-left transition-colors duration-200 {getActiveProject() === project.slug ? 'text-white' : 'text-[#666]'}"
								onclick={() => scrollToProject(project.slug)}
							>
								{project.title}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>

	<div class="pointer-events-auto">
		<a href="/studio/about" class="uppercase tracking-wide text-[#666] hover:text-white transition-colors duration-200">
			Studio Linse
		</a>
	</div>
</aside>

<!-- Mobile: static index at top -->
<div class="md:hidden px-4 pt-16 pb-8">
	<nav class="flex flex-col gap-4">
		{#each yearGroups as group}
			<div>
				<span class="text-[color:var(--color-muted)]">({group.year})</span>
				<ul class="mt-1">
					{#each group.projects as project}
						<li>
							<button
								class="uppercase tracking-wide text-left transition-colors duration-200 {getActiveProject() === project.slug ? 'text-[color:var(--color-primary)]' : 'text-[color:var(--color-muted)]'}"
								onclick={() => scrollToProject(project.slug)}
							>
								{project.title}
							</button>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</div>
