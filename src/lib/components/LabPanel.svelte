<script lang="ts">
	import { lab, saveLab, resetLab, SPACING_PRESETS, type SpacingPresetKey } from '$lib/lab.svelte';

	// Persist whenever any flag changes.
	$effect(() => {
		JSON.stringify(lab); // touch every field so the effect tracks them
		saveLab();
	});

	const toggles = [{ key: 'dark', label: 'Black background', hint: 'inverted theme' }] as const;

	// Desktop grid spacing — discrete versions to pick between, not free sliders.
	const spacingPresets = Object.entries(SPACING_PRESETS) as [
		SpacingPresetKey,
		(typeof SPACING_PRESETS)[SpacingPresetKey]
	][];
</script>

{#if lab.enabled && lab.collapsed}
	<button class="launcher" onclick={() => (lab.collapsed = false)} aria-label="Open design lab">
		Lab
	</button>
{/if}

{#if lab.enabled && !lab.collapsed}
	<aside class="lab" aria-label="Design lab">
		<header>
			<span class="title">Lab</span>
			<div class="actions">
				<button class="reset" onclick={resetLab}>Reset</button>
				<button class="close" onclick={() => (lab.collapsed = true)} aria-label="Minimise lab panel">×</button>
			</div>
		</header>

		{#each toggles as t}
			<label class="row">
				<input type="checkbox" bind:checked={lab[t.key]} />
				<span class="name">{t.label}</span>
				<span class="hint">{t.hint}</span>
			</label>
		{/each}

		<div class="group">
			<span class="group-title">Hero opening</span>
			<label class="row">
				<input type="checkbox" bind:checked={lab.heroInset} />
				<span class="name">Smaller start</span>
				<span class="hint">{lab.heroInset ? 'inset · 4px' : 'off = fill viewport'}</span>
			</label>
			{#if lab.heroInset}
				<label class="slider sub">
					<span class="slider-name">Start size</span>
					<input type="range" min="40" max="92" step="2" bind:value={lab.heroInsetScale} />
					<span class="slider-val">{lab.heroInsetScale}</span>
				</label>
			{/if}
		</div>

		<div class="group">
			<span class="group-title">Grid spacing</span>
			{#each spacingPresets as [key, p]}
				<label class="row">
					<input
						type="radio"
						name="gridPreset"
						checked={lab.gridPreset === key}
						onchange={() => (lab.gridPreset = key)}
					/>
					<span class="name">{p.label}</span>
					<span class="hint">{p.hint}</span>
				</label>
			{/each}
		</div>

		<div class="group">
			<span class="group-title">Detail hero</span>
			<label class="row">
				<input
					type="radio"
					name="framedOpen"
					checked={lab.framedOpen === 'landscape'}
					onchange={() => (lab.framedOpen = 'landscape')}
				/>
				<span class="name">Open landscape</span>
			</label>
			<label class="row">
				<input
					type="radio"
					name="framedOpen"
					checked={lab.framedOpen === 'portrait'}
					onchange={() => (lab.framedOpen = 'portrait')}
				/>
				<span class="name">Open portrait</span>
			</label>
			<label class="row">
				<input type="checkbox" bind:checked={lab.mobileCarousel} />
				<span class="name">Mobile carousel</span>
				<span class="hint">swipe, not stack</span>
			</label>
		</div>

		<footer>× minimises · Shift+L hides · not shown to visitors</footer>
	</aside>
{/if}

<style>
	.lab {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 9999;
		width: 232px;
		padding: 12px 14px 10px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 8px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 12px;
		line-height: 1.3;
		color: #111;
		/* Stay legible regardless of the theme being previewed behind it. */
		color-scheme: light;
	}

	/* Minimised launcher — a quiet pill that sits where the panel's corner was,
	   so closing the panel never strands the controls out of reach. */
	.launcher {
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 9999;
		padding: 7px 12px;
		background: rgba(255, 255, 255, 0.92);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(0, 0, 0, 0.12);
		border-radius: 999px;
		box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
		font-family: var(--font-sans, system-ui, sans-serif);
		font-size: 11px;
		font-weight: 650;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #555;
		cursor: pointer;
		color-scheme: light;
	}
	.launcher:hover {
		color: #111;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.reset {
		background: none;
		border: none;
		padding: 0;
		font-family: inherit;
		font-size: 11px;
		color: #999;
		cursor: pointer;
	}
	.reset:hover {
		color: #111;
	}

	.title {
		font-weight: 650;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		font-size: 11px;
		color: #555;
	}

	.close {
		background: none;
		border: none;
		font-size: 16px;
		line-height: 1;
		color: #999;
		cursor: pointer;
		padding: 0 2px;
	}
	.close:hover {
		color: #111;
	}

	.row {
		display: flex;
		align-items: baseline;
		gap: 8px;
		padding: 4px 0;
		cursor: pointer;
	}

	.row input {
		margin: 0;
		flex-shrink: 0;
		accent-color: #111;
	}

	.name {
		flex: 1;
	}

	.hint {
		color: #999;
		font-size: 11px;
	}

	/* Sub-controls that belong to the toggle above them — indented, with a hairline
	   spine so they read as nested rather than peers. */
	.sub {
		margin-left: 10px;
		padding-left: 10px;
		border-left: 1px solid rgba(0, 0, 0, 0.1);
	}


	.group {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
	}

	.group-title {
		display: block;
		font-size: 10px;
		font-weight: 650;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: #555;
		margin-bottom: 4px;
	}

	.slider {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 0;
		cursor: pointer;
	}

	.slider-name {
		flex: 1;
		white-space: nowrap;
	}

	.slider input[type='range'] {
		flex: 1.2;
		min-width: 0;
		margin: 0;
		accent-color: #111;
	}

	.slider-val {
		width: 28px;
		text-align: right;
		font-variant-numeric: tabular-nums;
		color: #999;
		font-size: 11px;
	}

	footer {
		margin-top: 10px;
		padding-top: 8px;
		border-top: 1px solid rgba(0, 0, 0, 0.08);
		font-size: 10px;
		color: #aaa;
	}
</style>
