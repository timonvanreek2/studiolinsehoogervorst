import { getFeaturedProjects } from '$lib/sanity/queries';

export async function load() {
	const projects = await getFeaturedProjects();
	const heroProject = projects.find(p => p.isHero) ?? projects[0];
	return { allProjects: projects, heroSlug: heroProject?.slug ?? null };
}
