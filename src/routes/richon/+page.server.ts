import { getProjects } from '$lib/sanity/queries';

export async function load() {
	const projects = await getProjects();

	const heroProject = projects.find(p => p.title.toLowerCase().includes('national gallery'))
		|| projects[0];

	const ARCHIVE_SLUGS = new Set(['masterly-milano']);
	const allProjects = projects.filter(p => !ARCHIVE_SLUGS.has(p.slug));

	return { heroProject, allProjects };
}
