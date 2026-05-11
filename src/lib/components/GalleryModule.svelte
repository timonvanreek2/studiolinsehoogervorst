<script lang="ts">
	import { fadeIn } from '$lib/actions/inview';
	import { getAspect, type ModuleType } from '$lib/utils/gallery';

	let { images, type, projectTitle }: {
		images: string[];
		type: ModuleType;
		projectTitle: string;
	} = $props();
</script>

<div class="gallery-module" use:fadeIn>
	{#if type === 'full'}
		<div class="mod-full">
			<img
				src="{images[0]}?w=1800&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'double-balanced'}
		{@const a1 = getAspect(images[0])}
		{@const a2 = getAspect(images[1])}
		{@const total = a1 + a2}
		<div class="mod-double">
			<img
				src="{images[0]}?w=1200&auto=format&q=85"
				alt={projectTitle}
				style="flex: {a1 / total}; aspect-ratio: {a1};"
				loading="lazy"
			/>
			<img
				src="{images[1]}?w=1200&auto=format&q=85"
				alt={projectTitle}
				style="flex: {a2 / total}; aspect-ratio: {a2};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'double-unbalanced'}
		{@const a1 = getAspect(images[0])}
		{@const a2 = getAspect(images[1])}
		<div class="mod-double">
			<img
				src="{images[0]}?w=1400&auto=format&q=85"
				alt={projectTitle}
				style="flex: 1.5; aspect-ratio: {a1};"
				loading="lazy"
			/>
			<img
				src="{images[1]}?w=900&auto=format&q=85"
				alt={projectTitle}
				style="flex: 1; aspect-ratio: {a2};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'left-offset'}
		<div class="mod-offset mod-offset-left">
			<img
				src="{images[0]}?w=1200&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'right-offset'}
		<div class="mod-offset mod-offset-right">
			<img
				src="{images[0]}?w=1200&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'portrait-left'}
		<div class="mod-portrait mod-portrait-left">
			<img
				src="{images[0]}?w=800&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'portrait-right'}
		<div class="mod-portrait mod-portrait-right">
			<img
				src="{images[0]}?w=800&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'portrait-center'}
		<div class="mod-portrait mod-portrait-center">
			<img
				src="{images[0]}?w=800&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'triple'}
		{@const aspects = images.slice(0, 3).map(getAspect)}
		{@const total = aspects.reduce((s, a) => s + a, 0)}
		<div class="mod-triple">
			{#each images.slice(0, 3) as url, i}
				<img
					src="{url}?w=700&auto=format&q=85"
					alt={projectTitle}
					style="flex: {aspects[i] / total}; aspect-ratio: {aspects[i]};"
					loading="lazy"
				/>
			{/each}
		</div>

	{:else if type === 'large-small-left'}
		<div class="mod-large-small">
			<img
				class="large"
				src="{images[0]}?w=1400&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
			<img
				class="small"
				src="{images[1]}?w=600&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[1])};"
				loading="lazy"
			/>
		</div>

	{:else if type === 'large-small-right'}
		<div class="mod-large-small">
			<img
				class="small"
				src="{images[0]}?w=600&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[0])};"
				loading="lazy"
			/>
			<img
				class="large"
				src="{images[1]}?w=1400&auto=format&q=85"
				alt={projectTitle}
				style="aspect-ratio: {getAspect(images[1])};"
				loading="lazy"
			/>
		</div>
	{/if}
</div>

<style>
	:global(.gallery-module) {
		opacity: 0;
		transform: translateY(8px);
		transition: opacity 0.4s ease, transform 0.4s ease;
	}

	:global(.gallery-module.visible) {
		opacity: 1;
		transform: translateY(0);
	}

	img {
		display: block;
		width: 100%;
		height: auto;
		object-fit: cover;
	}

	.mod-full img {
		width: 100%;
	}

	.mod-double, .mod-triple {
		display: flex;
		gap: 0;
		align-items: start;
	}

	.mod-double img, .mod-triple img {
		min-width: 0;
		height: auto;
	}

	.mod-offset {
		width: 60%;
	}

	.mod-offset-left {
		margin-right: auto;
	}

	.mod-offset-right {
		margin-left: auto;
	}

	.mod-portrait {
		width: 38%;
	}

	.mod-portrait-left {
		margin-right: auto;
	}

	.mod-portrait-right {
		margin-left: auto;
	}

	.mod-portrait-center {
		margin: 0 auto;
	}

	.mod-large-small {
		display: flex;
		align-items: start;
	}

	.mod-large-small .large {
		flex: 2;
		min-width: 0;
	}

	.mod-large-small .small {
		flex: 1;
		min-width: 0;
	}

	@media (max-width: 768px) {
		.mod-double, .mod-triple, .mod-large-small {
			flex-direction: column;
		}

		.mod-double img, .mod-triple img, .mod-large-small img {
			flex: none !important;
			width: 100%;
		}

		.mod-offset, .mod-portrait {
			width: 100%;
		}
	}
</style>
