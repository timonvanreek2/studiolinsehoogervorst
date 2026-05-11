<script lang="ts">
	import { browser } from '$app/environment';

	let dotX = $state(0);
	let dotY = $state(0);
	let labelX = $state(0);
	let labelY = $state(0);
	let label = $state('');
	let visible = $state(false);

	const LERP = 0.12;
	let animFrame: number;

	function animate() {
		labelX += (dotX - labelX) * LERP;
		labelY += (dotY - labelY) * LERP;
		animFrame = requestAnimationFrame(animate);
	}

	function handleMove(e: MouseEvent) {
		dotX = e.clientX;
		dotY = e.clientY;

		const target = e.target as HTMLElement;
		const cursorLabel = target?.closest('[data-cursor-label]') as HTMLElement | null;

		if (cursorLabel) {
			label = cursorLabel.dataset.cursorLabel || '';
			visible = true;
		} else {
			label = '';
			visible = false;
		}
	}

	$effect(() => {
		if (!browser) return;
		animFrame = requestAnimationFrame(animate);
		window.addEventListener('mousemove', handleMove);
		return () => {
			cancelAnimationFrame(animFrame);
			window.removeEventListener('mousemove', handleMove);
		};
	});
</script>

{#if browser}
	<div
		class="fixed top-0 left-0 w-2 h-2 rounded-full bg-white blend-exclusion pointer-events-none z-50 max-md:hidden"
		style="transform: translate({dotX - 4}px, {dotY - 4}px)"
	></div>

	{#if visible && label}
		<div
			class="fixed top-0 left-0 pointer-events-none z-50 blend-exclusion uppercase tracking-tight font-mono text-[10px] max-md:hidden"
			style="transform: translate({labelX + 16}px, {labelY + 16}px)"
		>
			{label}
		</div>
	{/if}
{/if}
