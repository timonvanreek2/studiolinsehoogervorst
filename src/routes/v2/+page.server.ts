import { getProjects } from '$lib/sanity/queries';

const FEATURED_COUNT = 8;

export async function load() {
	const projects = await getProjects();

	const heroProject = projects.find(p => p.title.toLowerCase().includes('national gallery'))
		|| projects[0];

	const ARCHIVE_SLUGS = new Set(['masterly-milano']);
	const isArchived = (p: { slug: string; title: string }) =>
		ARCHIVE_SLUGS.has(p.slug) || p.title.toLowerCase().includes('masterly milano');

	const EXCLUDE_FEATURED = new Set(['fishes', 'palace-het-loo']);
	const isExcludedFromFeatured = (p: { slug: string; title: string }) =>
		EXCLUDE_FEATURED.has(p.slug);

	const orderedProjects = heroProject
		? [heroProject, ...projects.filter(p => p.slug !== heroProject.slug)]
		: projects;

	const eligible = orderedProjects.filter(p => !isArchived(p) && !isExcludedFromFeatured(p));
	const featuredProjects = eligible.slice(0, FEATURED_COUNT);

	return { allProjects: orderedProjects, featuredProjects };
}
