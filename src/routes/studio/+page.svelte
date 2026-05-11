<script lang="ts">
	import ProjectList from '$lib/components/ProjectList.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Studio Linse Hoogervorst</title>
</svelte:head>

<main class="studio-home">
	<ProjectList projects={data.projects} />
</main>

<style>
	.studio-home {
		padding: 100px 8px 120px;
		min-height: 100vh;
		background: #000;
	}
</style>
