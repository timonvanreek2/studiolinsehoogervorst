import { getProjects } from '$lib/sanity/queries';

const FEATURED_COUNT = 8;

export async function load() {
	const projects = await getProjects();

	const heroProject = projects.find(p => p.title.toLowerCase().includes('national gallery'))
		|| projects.find(p => p.slug === 'national-gallery')
		|| projects[0];

	const ARCHIVE_SLUGS = new Set(['masterly-milano']);
	const isArchived = (p: { slug: string; title: string }) =>
		ARCHIVE_SLUGS.has(p.slug) || p.title.toLowerCase().includes('masterly milano');

	const EXCLUDE_FEATURED = new Set(['fishes', 'palace-het-loo']);
	const isExcludedFromFeatured = (p: { slug: string; title: string }) =>
		EXCLUDE_FEATURED.has(p.slug) || p.title.toLowerCase().includes('fishes') || p.title.toLowerCase().includes('palace het loo');

	const orderedProjects = heroProject
		? [heroProject, ...projects.filter(p => p.slug !== heroProject.slug)]
		: projects;

	const eligible = orderedProjects.filter(p => !isArchived(p) && !isExcludedFromFeatured(p));

	const INCLUDE_FEATURED = ['pillows-amsterdam', 'inter-scaldes'];
	let featuredProjects = eligible.slice(0, FEATURED_COUNT);
	for (const slug of INCLUDE_FEATURED) {
		const project = eligible.find(p => p.slug === slug || p.title.toLowerCase().includes(slug.replace(/-/g, ' ')));
		if (project && !featuredProjects.includes(project)) {
			featuredProjects = [...featuredProjects.slice(0, FEATURED_COUNT - 1), project];
		}
	}
	return { allProjects: orderedProjects, featuredProjects };
}
