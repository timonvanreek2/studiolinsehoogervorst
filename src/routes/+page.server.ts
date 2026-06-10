import { getProjects } from '$lib/sanity/queries';

export async function load() {
	const projects = await getProjects();

	// TODO: hero and archive selection is currently based on hardcoded slug/title matching.
	// This is fragile — a future schema change should add explicit `isHero` and `archived`
	// boolean fields in Sanity so this logic can be replaced with a simple filter.
	const heroProject = projects.find(p => p.title.toLowerCase().includes('national gallery'))
		|| projects.find(p => p.slug === 'national-gallery')
		|| projects[0];

	const orderedProjects = heroProject
		? [heroProject, ...projects.filter(p => p.slug !== heroProject.slug)]
		: projects;

	return { allProjects: orderedProjects };
}
