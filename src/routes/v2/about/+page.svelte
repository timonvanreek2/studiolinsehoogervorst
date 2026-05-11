<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>About — Studio Linse Hoogervorst</title>
</svelte:head>

<div class="about-page">

	{#if data.studio?.image}
		<div class="studio-image">
			<img
				src="{data.studio.image}?w=1200&auto=format&q=85"
				alt="Studio Linse Hoogervorst"
			/>
		</div>
	{/if}

	<section class="section">
		<div class="row">
			<p class="row-label">About</p>
			<div class="row-body">
				{#if data.studio?.aboutText}
					{#each data.studio.aboutText.split('\n\n') as paragraph}
						<p>{paragraph}</p>
					{/each}
				{/if}
			</div>
		</div>
	</section>

	<section class="section">
		<div class="row">
			<p class="row-label">Enquiry</p>
			<div class="row-body">
				<div class="detail-list">
					{#if data.studio?.contactEmail}
						<div class="detail-row">
							<span class="detail-label">General</span>
							<a href="mailto:{data.studio.contactEmail}">{data.studio.contactEmail}</a>
						</div>
					{/if}
					{#if data.studio?.newBusinessEmail}
						<div class="detail-row">
							<span class="detail-label">New business</span>
							<a href="mailto:{data.studio.newBusinessEmail}">{data.studio.newBusinessEmail}</a>
						</div>
					{/if}
					{#if data.studio?.contactPhone}
						<div class="detail-row">
							<span class="detail-label">Phone</span>
							<a href="tel:{data.studio.contactPhone}">{data.studio.contactPhone}</a>
						</div>
					{/if}
					{#if data.studio?.address}
						<div class="detail-row">
							<span class="detail-label">Visit</span>
							<span>{@html data.studio.address.replace(/\n/g, '<br />')}</span>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</section>

	{#if data.awards?.length}
		<section class="section">
			<div class="row">
				<p class="row-label">Awards</p>
				<div class="row-body">
					<div class="detail-list">
						{#each data.awards as item}
							<div class="detail-row">
								<span class="detail-label">{item.year}</span>
								<span>{item.title}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{/if}

	{#if data.press?.length}
		<section class="section">
			<div class="row">
				<p class="row-label">Press</p>
				<div class="row-body">
					<div class="detail-list">
						{#each data.press as item}
							<div class="detail-row">
								<span class="detail-label">{item.year}</span>
								<span>{item.title}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>
	{/if}

</div>

<style>
	.about-page {
		padding: calc(50vh - 8px) 8px 120px;
		font-family: var(--font-meta);
		font-weight: 500;
		font-size: 14px;
		line-height: 1.5;
		color: var(--color-primary);
		min-height: 100vh;
		position: relative;
	}

	.studio-image {
		position: absolute;
		top: 0;
		left: 50%;
		right: 0;
		height: 44vh;
		z-index: 0;
		overflow: hidden;
	}

	.studio-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(100%);
	}

	.section {
		margin-bottom: 120px;
		position: relative;
		z-index: 1;
	}

	.section:last-child {
		margin-bottom: 0;
	}

	.row {
		display: flex;
		gap: 8px;
	}

	.row-label {
		flex: 1;
		min-width: 0;
		margin: 0;
		line-height: 16px;
	}

	.row-body {
		flex: 1;
		min-width: 0;
	}

	.row-body p {
		margin: 0;
	}

	.row-body p + p {
		margin-top: 1em;
	}

	.detail-list {
		display: flex;
		flex-direction: column;
	}

	.detail-row {
		display: flex;
		gap: 8px;
		padding: 6px 0;
	}

	.detail-label {
		width: 120px;
		flex-shrink: 0;
	}

	.detail-row a {
		color: var(--color-primary);
		text-decoration: none;
	}

	.detail-row a:hover {
		opacity: 0.6;
	}

	@media (max-width: 768px) {
		.studio-image {
			position: relative;
			left: -8px;
			right: auto;
			width: calc(100% + 16px);
			height: 30vh;
			margin-bottom: 40px;
		}

		.about-page {
			padding: 120px 8px 60px;
		}

		.section {
			margin-bottom: 80px;
		}

		.row {
			flex-direction: column;
			gap: 16px;
		}

		.detail-row {
			flex-direction: column;
			gap: 2px;
		}

		.detail-label {
			width: auto;
		}
	}
</style>
